import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';

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
    <ProviderLayout>
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
                <option value="bookings">Most Bookings</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {/* Services Count */}
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{indexOfFirstService + 1}</span> to <span className="font-medium">
              {Math.min(indexOfLastService, filteredServices.length)}
            </span> of <span className="font-medium">{filteredServices.length}</span> services
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="flex justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
            </div>
            <p className="mt-2 text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <i className="fas fa-list-alt text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
            <p className="text-gray-500 mb-6">Get started by creating a new service.</p>
            <Link 
              to="/provider/services/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-plus mr-2"></i> Add New Service
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              /* Grid View */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentServices.map(service => (
                    <div key={service._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <div className="h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {service.serviceImage ? (
                            <img
                              className="h-full w-full object-cover"
                              src={service.serviceImage}
                              alt={service.serviceTitle}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: service.serviceImage ? 'none' : 'flex'}}>
                            <i className="fas fa-image text-2xl"></i>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <StatusBadge isActive={service.isActive} />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{service.serviceTitle}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {service.categoryId?.categoryName || 'Uncategorized'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{service.servicePrice?.toFixed(2)}</p>
                            {service.bookingCount > 0 && (
                              <p className="text-xs text-gray-500">{service.bookingCount} bookings</p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {service.serviceDetails || 'No description provided'}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Link
                              to={`/provider/services/edit/${service._id}`}
                              className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <i className="fas fa-edit mr-1.5"></i> Edit
                            </Link>
                            <button
                              onClick={() => handleToggleActive(service._id, service.isActive)}
                              className={`inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                service.isActive
                                  ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                                  : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                              }`}
                            >
                              <i className={`fas fa-${service.isActive ? 'ban' : 'check'} mr-1.5`}></i>
                              {service.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                          <button
                            onClick={() => setConfirmDelete(service._id)}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <i className="fas fa-trash mr-1.5"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* List View */
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {currentServices.map(service => (
                    <li key={service._id} className="hover:bg-gray-50 transition-colors">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                {service.serviceImage ? (
                                  <img
                                    className="h-full w-full object-cover"
                                    src={service.serviceImage}
                                    alt={service.serviceTitle}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="h-full w-full rounded-md bg-gray-200 flex items-center justify-center text-gray-500" style={{display: service.serviceImage ? 'none' : 'flex'}}>
                                  <i className="fas fa-image"></i>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {service.serviceTitle}
                                </h3>
                                <StatusBadge isActive={service.isActive} />
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {service.categoryId?.categoryName || 'Uncategorized'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {service.serviceDetails || 'No description provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">₹{service.servicePrice?.toFixed(2)}</p>
                              {service.bookingCount > 0 && (
                                <p className="text-xs text-gray-500">{service.bookingCount} bookings</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/provider/services/edit/${service._id}`}
                                className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Edit service"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                onClick={() => handleToggleActive(service._id, service.isActive)}
                                className={`inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  service.isActive
                                    ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                                }`}
                                title={service.isActive ? 'Deactivate service' : 'Activate service'}
                              >
                                <i className={`fas fa-${service.isActive ? 'ban' : 'check'}`}></i>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(service._id)}
                                className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                title="Delete service"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
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
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstService + 1}</span> to <span className="font-medium">
                        {Math.min(indexOfLastService, filteredServices.length)}
                      </span> of <span className="font-medium">{filteredServices.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first, last, current, and nearby pages
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
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
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          // Show ellipsis for skipped pages
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
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
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Service</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this service? This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-32 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                    onClick={() => handleDeleteService(confirmDelete)}
                  >
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-md w-32 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}

export default ServiceManagement;