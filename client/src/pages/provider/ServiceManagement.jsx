import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(6); // 6 services per page
  
  const { token } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // Use the correct API endpoint for both development and production
        const response = await axios.get('/api/providers/me/listings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched services:', response.data.data);
        setServices(response.data.data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchServices();
    }
  }, [token]);

  const handleToggleActive = async (serviceId, currentStatus) => {
    console.log(`Toggling service ${serviceId} from ${currentStatus} to ${!currentStatus}`);
    try {
      const response = await axios.put(`/api/listings/${serviceId}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Toggle response:', response.data);

      // Update local state
      setServices(services.map(service =>
        service._id === serviceId
          ? { ...service, isActive: !currentStatus }
          : service
      ));
    } catch (err) {
      console.error('Error updating service status:', err);
      setError('Failed to update service status. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`/api/listings/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setServices(services.filter(service => service._id !== serviceId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    }
  };

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Filter by active status
      if (filterActive === 'active') return service.isActive;
      if (filterActive === 'inactive') return !service.isActive;
      return true;
    })
    .filter(service => {
      // Filter by search term
      if (!searchTerm) return true;
      return service.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (service.serviceDetails && service.serviceDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (service.categoryId?.categoryName && service.categoryId.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => {
      // Sort services
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priceHigh') return (b.servicePrice || 0) - (a.servicePrice || 0);
      if (sortBy === 'priceLow') return (a.servicePrice || 0) - (b.servicePrice || 0);
      if (sortBy === 'nameAZ') return a.serviceTitle.localeCompare(b.serviceTitle);
      if (sortBy === 'nameZA') return b.serviceTitle.localeCompare(a.serviceTitle);
      if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0);
      return 0;
    });

  // Get current services for pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your service listings</p>
        </div>
        <Link 
          to="/provider/services/new" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i> Add New Service
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative rounded-md shadow-sm flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Services</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
              <option value="bookings">Most Booked</option>
            </select>

            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                  viewMode === 'list'
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      ) : currentServices.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-list-alt text-gray-300 text-5xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterActive !== 'all' 
              ? "No services match your current filters." 
              : "You haven't created any services yet."}
          </p>
          <Link 
            to="/provider/services/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-plus mr-2"></i> Add Your First Service
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map(service => (
                <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {service.serviceImage ? (
                        <img
                          className="w-full h-full object-cover"
                          src={service.serviceImage}
                          alt={service.serviceTitle}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: service.serviceImage ? 'none' : 'flex'}}>
                        <i className="fas fa-image text-4xl"></i>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge isActive={service.isActive} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">{service.serviceTitle}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {service.categoryId?.categoryName || 'Uncategorized'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{service.servicePrice?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">per service</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {service.serviceDetails || 'No description provided'}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link
                          to={`/provider/services/edit/${service._id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(service._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <i className="fas fa-trash mr-1"></i> Delete
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggleActive(service._id, service.isActive)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          service.isActive
                            ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                        }`}
                      >
                        {service.isActive ? (
                          <>
                            <i className="fas fa-pause mr-1"></i> Deactivate
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play mr-1"></i> Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {currentServices.map(service => (
                  <li key={service._id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                            {service.serviceImage ? (
                              <img
                                className="w-full h-full object-cover"
                                src={service.serviceImage}
                                alt={service.serviceTitle}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: service.serviceImage ? 'none' : 'flex'}}>
                              <i className="fas fa-image"></i>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {service.serviceTitle}
                              </h3>
                              <StatusBadge isActive={service.isActive} />
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {service.categoryId?.categoryName || 'Uncategorized'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {service.serviceDetails || 'No description provided'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{service.servicePrice?.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              per service
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/provider/services/edit/${service._id}`}
                              className="inline-flex items-center px-2.5 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(service._id)}
                              className="inline-flex items-center px-2.5 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <button
                            onClick={() => handleToggleActive(service._id, service.isActive)}
                            className={`inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              service.isActive
                                ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                                : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                            }`}
                          >
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstService + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastService, filteredServices.length)}</span> of{' '}
                    <span className="font-medium">{filteredServices.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this service? This action cannot be undone.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteService(confirmDelete)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    // Remove ProviderLayout wrapper since it's handled by App.jsx
  );
}

export default ServiceManagement;