import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  // Function to fetch users with filters, search, sorting, and pagination
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterRole !== 'all') {
        queryParams += `&role=${filterRole}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log('Fetching users with params:', queryParams);
      const response = await axios.get(
        `/api/users?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Fetched users:', response.data);
      setUsers(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchUsers when dependencies change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, pagination.limit, sortConfig.key, sortConfig.direction, filterRole, filterStatus, searchTerm]);

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
    fetchUsers();
  };

  // Show delete confirmation
  const showDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const toastId = toast.loading('Deleting user...');

      await axios.delete(
        `/api/users/${userToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.filter(u => u._id !== userToDelete._id));

      toast.update(toastId, {
        render: 'User deleted successfully',
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setShowDeleteDialog(false);
      setUserToDelete(null);
      setTimeout(() => fetchUsers(), 100);
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user) => {
    try {
      const toastId = toast.loading(`${user.isActive ? 'Deactivating' : 'Activating'} user...`);

      const response = await axios.put(
        `/api/users/${user._id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(u =>
        u._id === user._id ? response.data.data : u
      ));

      const statusMessage = response.data.data.isActive ? 'activated' : 'deactivated';
      toast.update(toastId, {
        render: `User ${statusMessage} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setTimeout(() => fetchUsers(), 100);
    } catch (err) {
      console.error('Error toggling user status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user status';
      setError(errorMessage);
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
        case 'admin':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'service_provider':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'user':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'active':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'inactive':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
        {icon && <i className={`fas fa-${icon} mr-1`}></i>}
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
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
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
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <i className="fas fa-chevron-right h-5 w-5"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="User Management">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage and monitor all users in your system
                </p>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                onClick={() => window.location.href = '/admin/users/create'}
              >
                <i className="fas fa-plus mr-2"></i>
                Create User
              </button>
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
              <h3 className="text-md font-semibold text-gray-900">Filter Users</h3>
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

              {/* Role Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User Role</label>
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-2 py-2 pr-6 text-xs border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="service_provider">Provider</option>
                    <option value="user">User</option>
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
                    setFilterRole('all');
                    setFilterStatus('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                    setTimeout(() => fetchUsers(), 0);
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

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Users
                  {users.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({pagination.total} total)
                    </span>
                  )}
                </h2>
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
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-users text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('firstName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'firstName' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('userType')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Role</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'userType' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'isActive' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          <i className={`fas fa-sort ${sortConfig.key === 'createdAt' ? 
                            sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : ''} text-gray-400`}></i>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <motion.tr 
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 mr-3">
                              {user.profilePicture ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={user.profilePicture}
                                  alt={`${user.firstName || ''}`}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: user.profilePicture ? 'none' : 'flex'}}>
                                <i className="fas fa-user text-sm"></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                <i className="fas fa-envelope mr-1"></i>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            type={user.userType || 'user'}
                            text={user.userType === 'service_provider' ? 'Provider' : user.userType || 'User'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            type={user.isActive ? 'active' : 'inactive'}
                            text={user.isActive ? 'Active' : 'Inactive'}
                            icon={user.isActive ? 'check-circle' : 'times-circle'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleToggleStatus(user);
                              }}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                user.isActive 
                                  ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" 
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                              title={user.isActive ? "Deactivate user" : "Activate user"}
                            >
                              <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                showDeleteConfirmation(user);
                              }}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                              title="Delete user"
                            >
                              <i className="fas fa-trash"></i>
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
            {users.length > 0 && (
              <Pagination 
                pagination={pagination} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>

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
                        Delete User
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-gray-900">
                          {userToDelete?.firstName} {userToDelete?.lastName}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" 
                        onClick={() => {
                          setShowDeleteDialog(false);
                          setUserToDelete(null);
                        }}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200" 
                        onClick={handleDeleteUser}
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Delete User
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

export default Users;
