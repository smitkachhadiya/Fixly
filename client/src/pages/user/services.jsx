import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PlaceholderImg from "../../assets/plumbing.png";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Services = () => {
  // State for listings and categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [viewMode, setViewMode] = useState("all"); // all, provider
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tags, setTags] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Increased from 10 for better grid layout
  const [totalPages, setTotalPages] = useState(1);

  // State for sorting
  const [sortOption, setSortOption] = useState("newest");

  // State for favorite services (if user is logged in)
  const [favorites, setFavorites] = useState([]);

  // Refs
  const servicesRef = useRef(null);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Extract all possible query parameters
    const categoryParam = params.get("category");
    const providerParam = params.get("provider");
    const searchParam = params.get("search");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const tagsParam = params.get("tags");
    const pageParam = params.get("page");
    const limitParam = params.get("limit");
    const sortParam = params.get("sort");

    // Set state based on URL parameters
    if (categoryParam) setSelectedCategory(categoryParam);
    if (providerParam) {
      setSelectedProvider(providerParam);
      setViewMode("provider");
    }
    if (searchParam) setSearchTerm(searchParam);
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    if (tagsParam) setTags(tagsParam);
    if (pageParam) setPage(parseInt(pageParam));
    if (limitParam) setLimit(parseInt(limitParam));
    if (sortParam) setSortOption(sortParam);
  }, [location.search]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const fetchedCategories = response.data.data || [];
        setCategories(fetchedCategories);

        // Set the first category as selected by default if not already set
        if (!selectedCategory && fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]._id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load service categories. Please try again later.');
      }
    };

    fetchCategories();

    // If user is logged in, fetch favorites
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Mock function to fetch user favorites - this would need to be implemented in your backend
  const fetchFavorites = async () => {
    // This is a placeholder - replace with actual API call
    try {
      // const response = await axios.get(`/api/users/${user.id}/favorites`);
      // setFavorites(response.data.data || []);

      // For now, just using localStorage to simulate favorites functionality
      const savedFavorites = localStorage.getItem('serviceFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch listings based on filters, sorting, and pagination
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        let url;
        let params = new URLSearchParams();

        // Determine base URL based on view mode
        if (viewMode === "provider" && selectedProvider) {
          // For provider-specific listings
          url = `/api/listings/provider/${selectedProvider}`;
        } else {
          // For all listings with filters
          url = '/api/listings';

          // Add query parameters
          if (selectedCategory) params.append('category', selectedCategory);
          if (searchTerm) params.append('search', searchTerm);
          if (minPrice) params.append('minPrice', minPrice);
          if (maxPrice) params.append('maxPrice', maxPrice);
          if (tags) params.append('tags', tags);
          if (sortOption) params.append('sort', sortOption);

          // Pagination parameters
          params.append('page', page);
          params.append('limit', limit);
        }

        // Make the API request with timeout
        console.log('Fetching listings from:', url, 'with params:', params.toString());
        
        // Add timeout to catch network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await api.get(
          params.toString() ? `${url}?${params.toString()}` : url,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        console.log('API Response:', response);

        // Handle the response
        const data = response.data;
        if (data && Array.isArray(data.data)) {
          setFilteredListings(data.data);
        } else {
          console.warn('Unexpected data format:', data);
          setFilteredListings([]);
        }

        // Set pagination info if available
        if (data && data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        }

        console.log('Fetched listings:', data?.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        
        // Handle different types of errors
        if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection and try again.');
        } else if (err.code === 'ERR_CANCELED') {
          setError('Request timeout. Please try again.');
        } else if (err.response) {
          // Server responded with error status
          setError(`Server error: ${err.response.data?.message || 'Failed to load services'}`);
        } else {
          // Network or other error
          setError('Failed to load services. Please try again later.');
        }
        
        // Clear listings on error
        setFilteredListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    selectedCategory,
    viewMode,
    selectedProvider,
    searchTerm,
    minPrice,
    maxPrice,
    tags,
    page,
    limit,
    sortOption
  ]);

  // Update URL with current filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedProvider) params.append('provider', selectedProvider);
    if (searchTerm) params.append('search', searchTerm);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (tags) params.append('tags', tags);
    if (page > 1) params.append('page', page);
    if (limit !== 12) params.append('limit', limit);
    if (sortOption !== 'newest') params.append('sort', sortOption);

    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setViewMode("all");
    setPage(1); // Reset to first page

    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('category', categoryId);
    params.delete('provider'); // Clear provider when changing category
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });

    // Scroll to services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle view details
  const handleViewDetails = (listing) => {
    // Change from /service/ to /listing/ to match your route configuration
    navigate(`/listing/${listing._id}`);
  };

  // Handle price filter
  const handlePriceFilter = () => {
    setPage(1); // Reset to first page
    updateUrlWithFilters();
    setIsFilterOpen(false); // Close filter panel after applying
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1); // Reset to first page

    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('sort', e.target.value);
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);

    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`/services?${params.toString()}`, { replace: true });

    // Scroll to top of services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setTags("");
    setSortOption("newest");
    setPage(1);
    setViewMode("all");
    setSelectedProvider(null);

    // Keep only the category in URL
    navigate(`/services?category=${selectedCategory}`, { replace: true });
  };

  // Toggle favorite status
  const toggleFavorite = (listingId) => {
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: location } });
      return;
    }

    // Update local favorites list
    let updatedFavorites;
    if (favorites.includes(listingId)) {
      updatedFavorites = favorites.filter(id => id !== listingId);
    } else {
      updatedFavorites = [...favorites, listingId];
    }

    setFavorites(updatedFavorites);

    // Save to localStorage (replace with API call in production)
    localStorage.setItem('serviceFavorites', JSON.stringify(updatedFavorites));

    // For a real implementation, you'd save to the database
    // axios.post(`/api/users/${user.id}/favorites`, { listingId });
  };

  // Find the name of the selected category
  const selectedCategoryName = categories.find(
    cat => cat._id === selectedCategory
  )?.categoryName || 'All Services';

  // Calculate average rating for stars display
  const renderStars = (rating) => {
    if (!rating || rating <= 0) return null;

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {halfStar && <i key="half" className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Calculate range of pages to show
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-md bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3] transition-colors duration-200 shadow-sm"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(<span key="dots1" className="px-2 py-2 text-[#727373]">...</span>);
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md transition-colors duration-200 shadow-sm ${
            page === i 
              ? 'bg-[#50B498] text-white border border-[#50B498] shadow-md' 
              : 'bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3]'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="px-2 py-2 text-[#727373]">...</span>);
      }

      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-md bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3] transition-colors duration-200 shadow-sm"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Helper function to get appropriate icon for category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes('plumb')) return 'fas fa-faucet';
    if (name.includes('electric')) return 'fas fa-bolt';
    if (name.includes('clean')) return 'fas fa-broom';
    if (name.includes('paint')) return 'fas fa-paint-roller';
    if (name.includes('garden') || name.includes('landscape')) return 'fas fa-leaf';
    if (name.includes('repair') || name.includes('maintenance')) return 'fas fa-tools';
    if (name.includes('heat') || name.includes('air') || name.includes('ac')) return 'fas fa-temperature-high';
    if (name.includes('roof')) return 'fas fa-home';
    if (name.includes('carpet') || name.includes('floor')) return 'fas fa-broom';
    if (name.includes('security')) return 'fas fa-shield-alt';
    if (name.includes('pest')) return 'fas fa-bug';
    if (name.includes('move')) return 'fas fa-truck';

    // Default icon
    return 'fas fa-hammer';
  };

  // Loading skeleton component
  const ServiceCardSkeleton = () => (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#babfbc]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-48 bg-[#babfbc] rounded-t-xl animate-pulse"></div>
      <div className="p-5">
        <div className="h-6 bg-[#babfbc] rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-[#babfbc] rounded mb-2 w-3/4 animate-pulse"></div>
        <div className="h-4 bg-[#babfbc] rounded mb-4 animate-pulse"></div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-[#babfbc] rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-[#babfbc] rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="h-10 bg-[#babfbc] rounded animate-pulse"></div>
      </div>
    </motion.div>
  );

  // Service card with hover effects
  const ServiceCard = ({ listing, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#babfbc] relative transition-all duration-300 hover:shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -10 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        viewport={{ once: true }}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={listing.serviceImage || PlaceholderImg}
            alt={listing.serviceTitle || 'Service'}
            className="w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PlaceholderImg;
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <button
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              favorites.includes(listing._id) 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white text-[#727373] hover:text-red-500 shadow-md'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(listing._id);
            }}
            aria-label={favorites.includes(listing._id) ? "Remove from favorites" : "Add to favorites"}
          >
            <i className={favorites.includes(listing._id) ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-[#0b0e11] mb-3 line-clamp-1">{listing.serviceTitle}</h3>

          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[#727373] text-sm">Price:</span>
              <span className="text-xl font-bold text-[#50B498] ml-1">₹{listing.servicePrice ? listing.servicePrice.toFixed(2) : '0.00'}</span>
            </div>
            {listing.averageRating > 0 && (
              <div className="flex items-center gap-1">
                {renderStars(listing.averageRating)}
                <span className="text-[#0b0e11] text-sm">{listing.averageRating.toFixed(1)}</span>
                {listing.reviewCount > 0 && (
                  <span className="text-[#727373] text-sm">({listing.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <p className="text-[#727373] mb-4 line-clamp-2">
            {listing.serviceDetails && listing.serviceDetails.length > 100
              ? `${listing.serviceDetails.substring(0, 100)}...`
              : listing.serviceDetails || 'No description available'}
          </p>

          {listing.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(','))
                .slice(0, 3) // Show max 3 tags
                .map((tag, index) => (
                  <span key={index} className="bg-[#ebf2f3] text-[#0b0e11] text-xs px-2 py-1 rounded-full">
                    {typeof tag === 'string' ? tag.trim() : tag}
                  </span>
                ))}
              {(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(',')).length > 3 && (
                <span className="bg-[#babfbc] text-[#0b0e11] text-xs px-2 py-1 rounded-full">
                  +{(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(',')).length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-[#727373] mb-4">
            <div className="flex items-center">
              <i className="fas fa-user-circle mr-1"></i>
              <span className="truncate max-w-[120px]">
                {listing.serviceProviderId?.userId ?
                  `${listing.serviceProviderId.userId.firstName || ''} ${listing.serviceProviderId.userId.lastName || ''}`.trim() || 'Service Provider'
                  : 'Service Provider'}
              </span>
            </div>

            <div className="flex items-center">
              <i className="fas fa-map-marker-alt mr-1"></i>
              <span className="truncate max-w-[100px]">{listing.serviceLocation || 'Available'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {listing.completedJobs > 0 && (
              <div className="flex items-center text-xs bg-[#babfbc] text-[#0b0e11] px-2 py-1 rounded-full">
                <i className="fas fa-check-circle mr-1"></i>
                <span>{listing.completedJobs} jobs completed</span>
              </div>
            )}
            <div className="flex items-center text-xs bg-[#ebf2f3] text-[#0b0e11] px-2 py-1 rounded-full">
              <i className="fas fa-clock mr-1"></i>
              <span>Est. {listing.estimatedHours || '1-2'} hours</span>
            </div>
          </div>

          <motion.div
            className="opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              className="w-full flex items-center justify-center bg-[#50B498] hover:bg-[#468585] text-white"
              onClick={() => handleViewDetails(listing)}
            >
              Book Now
            </Button>
          </motion.div>
          
          <motion.div
            className="opacity-100"
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11] font-medium"
              onClick={() => handleViewDetails(listing)}
            >
              View Details
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DEF9C4] to-[#9CDBA6]">

      {/* Hero Section with Search */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#0b0e11] mb-4">
              Find the Perfect Service
            </h1>
            <p className="text-xl text-[#468585] max-w-3xl mx-auto mb-8">
              Browse through our wide range of professional services and connect with trusted providers
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-2 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && updateUrlWithFilters()}
                  className="w-full px-6 py-4 border-0 focus:outline-none focus:ring-0 text-[#0b0e11] placeholder-[#727373] bg-transparent"
                />
              </div>
              <Button
                onClick={updateUrlWithFilters}
                className="px-8 py-4 bg-[#50B498] hover:bg-[#468585] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <i className="fas fa-search mr-2"></i> Search
              </Button>
            </div>
          </motion.div>

          {/* Category Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-[#0b0e11] mb-8 text-center">
              Browse Services by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  className={`bg-white rounded-xl p-6 shadow-md cursor-pointer transition-all duration-300 border-2 ${
                    selectedCategory === category._id 
                      ? 'border-[#50B498] bg-[#DEF9C4] transform -translate-y-1 shadow-lg' 
                      : 'border-[#babfbc] hover:border-[#50B498] hover:shadow-lg'
                  }`}
                  onClick={() => handleCategoryChange(category._id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className="flex justify-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCategory === category._id 
                        ? 'bg-[#50B498] text-white' 
                        : 'bg-[#DEF9C4] text-[#50B498]'
                    }`}>
                      <i className={getCategoryIcon(category.categoryName)}></i>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#0b0e11] text-center">{category.categoryName}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8" ref={servicesRef}>
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
              <p className="text-red-700 flex-1">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="text-red-700 hover:text-red-900 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </Card>
        )}

        {/* Filter Section */}
        <Card className="mb-8 transition-all duration-300 hover:shadow-lg bg-white rounded-2xl">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <motion.h2 
                className="text-2xl font-bold text-[#0b0e11]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {viewMode === "provider" ? "Provider Services" : selectedCategoryName}
                {searchTerm && ` - "${searchTerm}"`}
              </motion.h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center">
                  <label htmlFor="sort-select" className="mr-2 text-[#727373]">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border border-[#939492] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#50B498] transition-all bg-[#ebf2f3]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center gap-2 bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11] font-medium"
                >
                  <i className="fas fa-sliders-h"></i> Filters
                  {(searchTerm || minPrice || maxPrice || tags) && (
                    <span className="w-2 h-2 bg-[#50B498] rounded-full animate-pulse"></span>
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  className="border-t border-[#babfbc] pt-6 mt-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[#0b0e11] mb-2 font-medium">Price Range:</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="Min ₹"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          containerClassName="flex-1"
                          className="bg-[#ebf2f3]"
                        />
                        <span className="text-[#727373]">to</span>
                        <Input
                          type="number"
                          placeholder="Max ₹"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          containerClassName="flex-1"
                          className="bg-[#ebf2f3]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#0b0e11] mb-2 font-medium">Tags (comma separated):</label>
                      <Input
                        type="text"
                        placeholder="e.g. emergency, weekend, certified"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="bg-[#ebf2f3]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={resetFilters}
                      className="flex items-center gap-2 bg-[#babfbc] hover:bg-[#939492] text-[#0b0e11]"
                    >
                      <i className="fas fa-times"></i> Reset Filters
                    </Button>
                    <Button
                      onClick={handlePriceFilter}
                      className="flex items-center gap-2 bg-[#50B498] hover:bg-[#468585] text-white"
                    >
                      <i className="fas fa-check"></i> Apply Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Services Results */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredListings.map((listing, index) => (
                    <ServiceCard key={listing._id} listing={listing} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11]"
                  >
                    <i className="fas fa-chevron-left mr-2"></i> Previous
                  </Button>

                  <div className="flex gap-1">
                    {renderPaginationButtons()}
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11]"
                  >
                    Next <i className="fas fa-chevron-right ml-2"></i>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center p-12 bg-white rounded-2xl">
              <div className="text-5xl text-[#babfbc] mb-6">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#0b0e11] mb-3">No Services Found</h3>
              <p className="text-[#727373] mb-2">We couldn't find any services matching your criteria.</p>
              <p className="text-[#727373] mb-6">Try adjusting your filters or search term to find what you're looking for.</p>
              <Button 
                onClick={resetFilters}
                className="bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white"
              >
                Reset Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;