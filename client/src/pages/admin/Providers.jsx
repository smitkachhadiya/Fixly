import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const { token } = useAuth();

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Function to fetch providers with filters, search, sorting, and pagination
  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterVerification !== 'all') {
        queryParams += `&verificationStatus=${filterVerification}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log('Fetching providers with params:', queryParams);
      const response = await axios.get(
        `/api/providers?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Fetched providers:', response.data);
      setProviders(response.data.data || []);
      
      // Handle both pagination structures (nested and flat)
      const paginationData = response.data.pagination || response.data;
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        pages: paginationData.pages || Math.ceil((paginationData.total || 0) / prev.limit)
      }));
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load service providers. Please try again.');
      toast.error('Failed to load service providers');
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchProviders when dependencies change
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, pagination.limit, sortConfig.key, sortConfig.direction, filterVerification, filterStatus, searchTerm]);

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

  // Handle search input
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProviders();
  };

  // Handle verification status toggle
  const handleToggleVerification = async (provider) => {
    try {
      const toastId = toast.loading(`${provider.verificationStatus === 'Verified' ? 'Rejecting' : 'Verifying'} provider...`);

      const newStatus = provider.verificationStatus === 'Verified' ? 'Rejected' : 'Verified';

      const response = await axios.put(
        `/api/admin/providers/${provider._id}/verify`,
        { verificationStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProviders(providers.map(p =>
        p._id === provider._id ? response.data.data : p
      ));

      toast.update(toastId, {
        render: `Provider ${newStatus === 'Verified' ? 'verified' : 'rejected'} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setTimeout(() => fetchProviders(), 100);
    } catch (err) {
      console.error('Error toggling provider verification:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update provider verification status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (provider) => {
    setProviderToDelete(provider);
    setShowDeleteDialog(true);
  };

  // Handle delete provider
  const handleDeleteProvider = async () => {
    if (!providerToDelete) return;

    try {
      const toastId = toast.loading('Deleting provider...');

      await axios.delete(
        `/api/providers/${providerToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProviders(providers.filter(p => p._id !== providerToDelete._id));

      toast.update(toastId, {
        render: 'Provider deleted successfully',
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setShowDeleteDialog(false);
      setProviderToDelete(null);
      setTimeout(() => fetchProviders(), 100);
    } catch (err) {
      console.error('Error deleting provider:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete provider';
      toast.error(errorMessage);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Badge component
  const Badge = ({ type, text, icon }) => {
    const getBadgeStyles = () => {
      switch (type) {
        case 'verified':
        case 'active':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'rejected':
        case 'inactive':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeStyles()} transition-all duration-200`}>
        {icon && <i className={`fas fa-${icon} mr-1.5 text-xs`}></i>}
        {text}
      </span>
    );
  };

  // Pagination component
  const Pagination = ({ pagination, onPageChange }) => {
    const { page, pages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

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
    <AdminLayout title="Service Provider Management">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
                <p className="mt-2 text-gray-600">
                  Manage and monitor all service providers in your system
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="text-sm text-gray-500">Total Providers</div>
                  <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="text-sm text-gray-500">Verified</div>
                  <div className="text-2xl font-bold text-green-600">
                    {providers.filter(p => p.verificationStatus === 'Verified').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                className="mb-6 rounded-lg p-4 bg-green-50 border border-green-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-600 mr-3"></i>
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              </motion.div>
            )}

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

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900">Filter Providers</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <i className="fas fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input
                    type="text"
                    placeholder="Name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Verification Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Verification</label>
                <div className="relative">
                  <select
                    value={filterVerification}
                    onChange={(e) => setFilterVerification(e.target.value)}
                    className="w-full px-2 py-2 pr-6 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Account Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Status</label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2 py-2 pr-6 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Status</option>
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
                    setSearchTerm('');
                    setFilterVerification('all');
                    setFilterStatus('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                    setTimeout(() => fetchProviders(), 0);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={handleSearch}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Providers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Service Providers
                  {providers.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({pagination.total} total)
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(providers.length, pagination.limit)} of {pagination.total} providers
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
            ) : providers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-user-tie text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No service providers found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('userId.firstName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Provider</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'userId.firstName' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <span>Service Category</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <span>Experience</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort('verificationStatus')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Verification</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'verificationStatus' ? 
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
                    {providers.map((provider) => (
                      <motion.tr 
                        key={provider._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 mr-3">
                              {provider.userId?.profilePicture || provider.userId?.profileImage ? (
                                <>
                                  <img
                                    className="w-full h-full object-cover"
                                    src={provider.userId?.profilePicture || provider.userId?.profileImage}
                                    alt={`${provider.userId?.firstName || ''} ${provider.userId?.lastName || ''}`}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                    <i className="fas fa-user text-sm"></i>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  <i className="fas fa-user text-sm"></i>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {provider.userId?.firstName} {provider.userId?.lastName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                <i className="fas fa-envelope mr-1"></i>
                                {provider.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {provider.serviceCategory?.map(cat => cat.categoryName).join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {provider.experienceYears ? `${provider.experienceYears} years` : 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            type={provider.verificationStatus === 'Verified' ? 'verified' : provider.verificationStatus === 'Rejected' ? 'rejected' : 'pending'}
                            text={provider.verificationStatus || 'Pending'}
                            icon={provider.verificationStatus === 'Verified' ? 'check-circle' : provider.verificationStatus === 'Rejected' ? 'times-circle' : 'clock'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(provider.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSelectedProvider(provider);
                                setShowQuickView(true);
                              }}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                              title="Quick view"
                            >
                              <i className="fas fa-eye text-base"></i>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleToggleVerification(provider);
                              }}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                provider.verificationStatus === 'Verified' 
                                  ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" 
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                              title={provider.verificationStatus === 'Verified' ? "Reject provider" : "Verify provider"}
                            >
                              <i className={`fas fa-${provider.verificationStatus === 'Verified' ? 'ban' : 'check'} text-base`}></i>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                showDeleteConfirmation(provider);
                              }}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                              title="Delete provider"
                            >
                              <i className="fas fa-trash text-base"></i>
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
            {providers.length > 0 && (
              <Pagination 
                pagination={pagination} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>

          {/* Quick View Modal */}
          <AnimatePresence>
            {showQuickView && selectedProvider && (
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
                      <h3 className="text-xl font-bold text-gray-900">Provider Details</h3>
                      <button
                        onClick={() => setShowQuickView(false)}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                      >
                        <i className="fas fa-times text-xl"></i>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Provider Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {selectedProvider.userId?.profilePicture || selectedProvider.userId?.profileImage ? (
                            <>
                              <img
                                className="w-full h-full object-cover"
                                src={selectedProvider.userId?.profilePicture || selectedProvider.userId?.profileImage}
                                alt={`${selectedProvider.userId?.firstName || ''} ${selectedProvider.userId?.lastName || ''}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                <i className="fas fa-user text-sm"></i>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <i className="fas fa-user text-sm"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedProvider.userId?.firstName} {selectedProvider.userId?.lastName}
                          </h4>
                          <p className="text-gray-600">{selectedProvider.userId?.email}</p>
                          <div className="mt-2">
                            <Badge
                              type={selectedProvider.verificationStatus === 'Verified' ? 'verified' : selectedProvider.verificationStatus === 'Rejected' ? 'rejected' : 'pending'}
                              text={selectedProvider.verificationStatus || 'Pending'}
                              icon={selectedProvider.verificationStatus === 'Verified' ? 'check-circle' : selectedProvider.verificationStatus === 'Rejected' ? 'times-circle' : 'clock'}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Provider Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Service Categories</h5>
                          <p className="text-gray-900">
                            {selectedProvider.serviceCategory?.map(cat => cat.categoryName).join(', ') || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Experience</h5>
                          <p className="text-gray-900">
                            {selectedProvider.experienceYears ? `${selectedProvider.experienceYears} years` : 'Not specified'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Hourly Rate</h5>
                          <p className="text-gray-900">
                            {selectedProvider.hourlyRate ? `$${selectedProvider.hourlyRate}/hour` : 'Not specified'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Created</h5>
                          <p className="text-gray-900">
                            {formatDate(selectedProvider.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {selectedProvider.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Description</h5>
                          <p className="text-gray-900">{selectedProvider.description}</p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => {
                            setShowQuickView(false);
                            showDeleteConfirmation(selectedProvider);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Delete Provider
                        </button>
                        <button
                          onClick={() => {
                            setShowQuickView(false);
                            handleToggleVerification(selectedProvider);
                          }}
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                            selectedProvider.verificationStatus === 'Verified' 
                              ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500" 
                              : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                          }`}
                        >
                          <i className={`fas fa-${selectedProvider.verificationStatus === 'Verified' ? 'ban' : 'check'} mr-2`}></i>
                          {selectedProvider.verificationStatus === 'Verified' ? "Reject Provider" : "Verify Provider"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          {/* Delete Confirmation Dialog */}
          <AnimatePresence>
            {showDeleteDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <motion.div
                  className="bg-white rounded-xl shadow-xl max-w-md w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Delete Service Provider
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-gray-900">
                          {providerToDelete?.userId?.firstName} {providerToDelete?.userId?.lastName}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" 
                        onClick={() => {
                          setShowDeleteDialog(false);
                          setProviderToDelete(null);
                        }}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200" 
                        onClick={handleDeleteProvider}
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Delete Provider
                      </button>
                    </div>
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

export default Providers;