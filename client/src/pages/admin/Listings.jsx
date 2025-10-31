import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Import local placeholder image
import PlaceholderImg from '../../assets/plumbing.png';

function Listings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete'
  const [sortConfig, setSortConfig] = useState({ key: 'serviceTitle', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, [token, pagination.page, sortConfig, filterCategory, filterStatus]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}&admin=true`;

      if (filterCategory !== 'all') {
        queryParams += `&category=${filterCategory}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus === 'active' ? 'true' : 'false'}`;
      }

      const response = await axios.get(`/api/listings?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setListings(response.data.data || []);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || response.data.total || 0,
        pages: response.data.pagination?.pages || Math.ceil((response.data.total || 0) / pagination.limit)
      }));
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load service listings. Please try again.');
      toast.error('Failed to load service listings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle view listing details
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Handle edit listing
  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle toggle listing status
  const handleToggleStatus = async (listing) => {
    try {
      // Use the admin-specific endpoint for updating listing status
      await axios.put(`/api/admin/listings/${listing._id}/status`, {
        isActive: !listing.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setListings(listings.map(item =>
        item._id === listing._id
          ? { ...item, isActive: !item.isActive }
          : item
      ));

      // Show success message
      toast.success(`Listing ${!listing.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status. Please try again.');
      toast.error('Failed to update listing status');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Badge component for status
  const StatusBadge = ({ isActive }) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isActive 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200'
      } transition-all duration-200`}>
        <i className={`fas fa-${isActive ? 'check-circle' : 'times-circle'} mr-1.5 text-xs`}></i>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Pagination component
  const Pagination = ({ pagination, onPageChange }) => {
    const { page, pages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (pages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left h-5 w-5"></i>
            </button>
            
            {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  pageNum === page
                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                } transition-colors duration-200`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right h-5 w-5"></i>
            </button>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Listings</h1>
                <p className="mt-2 text-gray-600">
                  Manage all service listings in the platform
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 rounded-lg p-4 bg-red-50 border border-red-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-600 mr-3"></i>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900">Filter Listings</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    id="category-filter"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-2 py-2 pr-6 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2 py-2 pr-6 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                    setTimeout(() => fetchListings(), 0);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={fetchListings}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Listings
                  {listings.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({pagination.total} total)
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(listings.length, pagination.limit)} of {pagination.total} listings
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-list text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('serviceTitle')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Service</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'serviceTitle' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <span>Provider</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <span>Category</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('servicePrice')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Price</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'servicePrice' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'isActive' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'createdAt' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <motion.tr 
                        key={listing._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={listing.serviceImage || PlaceholderImg}
                                alt={listing.serviceTitle}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = PlaceholderImg;
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{listing.serviceTitle}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{listing.serviceDetails?.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {listing.serviceProviderId?.userId?.profilePicture || listing.serviceProviderId?.userId?.profileImage ? (
                                <>
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={listing.serviceProviderId.userId.profilePicture || listing.serviceProviderId.userId.profileImage}
                                    alt={`${listing.serviceProviderId.userId.firstName || 'Provider'}`}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                    <i className="fas fa-user text-sm"></i>
                                  </div>
                                </>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  <i className="fas fa-user text-sm"></i>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {listing.serviceProviderId?.userId?.firstName} {listing.serviceProviderId?.userId?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {listing.serviceProviderId?.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {listing.categoryId?.categoryName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(listing.servicePrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge isActive={listing.isActive} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(listing.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewListing(listing)}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                              title="View Details"
                            >
                              <i className="fas fa-eye text-base"></i>
                            </button>
                            <button
                              onClick={() => handleEditListing(listing)}
                              className="p-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors duration-200"
                              title="Edit"
                            >
                              <i className="fas fa-edit text-base"></i>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(listing)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                listing.isActive 
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                              title={listing.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <i className={`fas ${listing.isActive ? 'fa-times-circle' : 'fa-check-circle'} text-base`}></i>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {listings.length > 0 && (
              <Pagination 
                pagination={pagination} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>

          {/* View/Edit Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <motion.div
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{modalMode === 'view' ? 'Listing Details' : 'Edit Listing'}</h3>
                      <button
                        onClick={handleCloseModal}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                      >
                        <i className="fas fa-times text-xl"></i>
                      </button>
                    </div>
                    
                    {selectedListing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={selectedListing.serviceImage || PlaceholderImg}
                              alt={selectedListing.serviceTitle}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PlaceholderImg;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{selectedListing.serviceTitle}</h3>
                            <p className="text-sm text-gray-500 mt-1">{selectedListing.serviceDetails}</p>
                            <div className="mt-2">
                              <StatusBadge isActive={selectedListing.isActive} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Category</h5>
                            <p className="text-gray-900">
                              {selectedListing.categoryId?.categoryName || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Price</h5>
                            <p className="text-gray-900 font-medium">
                              {formatCurrency(selectedListing.servicePrice)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Created</h5>
                            <p className="text-gray-900">
                              {formatDate(selectedListing.createdAt)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h5>
                            <p className="text-gray-900">
                              {formatDate(selectedListing.updatedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Provider</h5>
                          <div className="mt-1 flex items-center">
                            <div className="flex-shrink-0">
                              {selectedListing.serviceProviderId?.userId?.profilePicture ? (
                                <>
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={selectedListing.serviceProviderId.userId.profilePicture}
                                    alt={selectedListing.serviceProviderId.userId.firstName}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                    <i className="fas fa-user text-sm"></i>
                                  </div>
                                </>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  <i className="fas fa-user text-sm"></i>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedListing.serviceProviderId?.userId?.firstName} {selectedListing.serviceProviderId?.userId?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedListing.serviceProviderId?.userId?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            Close
                          </button>
                          {modalMode === 'view' && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalMode('edit');
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Edit
                            </button>
                          )}
                          {modalMode === 'edit' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(selectedListing)}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                                  selectedListing.isActive
                                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                }`}
                              >
                                <i className={`fas ${selectedListing.isActive ? 'fa-times-circle' : 'fa-check-circle'} mr-2`}></i>
                                {selectedListing.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCloseModal}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                              >
                                <i className="fas fa-save mr-2"></i>
                                Save
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Listings;