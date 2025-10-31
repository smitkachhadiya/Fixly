import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'serviceTitle', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const { token } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`/api/admin/services?page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.data);
      setPagination(prev => ({ ...prev, total: response.data.total }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.response?.data?.message || 'Failed to fetch services');
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    // Trigger a new fetch with updated sort
    fetchServices();
  };

  if (loading) {
    return (
      <AdminLayout title="Services Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Services Management">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6" role="alert">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-3 text-red-500"></i>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services Management">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Services Overview</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage all service listings across the platform.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <i className="fas fa-plus mr-2"></i>
                Add Service
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('serviceTitle')}
                >
                  <div className="flex items-center">
                    Service Name
                    {sortConfig.key === 'serviceTitle' && (
                      <span className="ml-1 text-blue-600">
                        {sortConfig.direction === 'asc' ? (
                          <i className="fas fa-chevron-up"></i>
                        ) : (
                          <i className="fas fa-chevron-down"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.serviceTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {service._id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.categoryId?.categoryName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.serviceProviderId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                          service.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200">
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-colors duration-200">
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-inbox text-3xl text-gray-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
                      <p className="text-gray-500">Get started by adding your first service.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here if needed */}
        {services.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {services.length} service{services.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Services;