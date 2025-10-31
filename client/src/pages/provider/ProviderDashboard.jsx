import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';
import api from '../../config/api';

function ProviderDashboard() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Fetch provider's listings
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/providers/me/listings');
        setListings(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load your listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      setIsStatsLoading(true);
      try {
        // Get booking stats
        const bookingsResponse = await api.get('/api/bookings/provider');

        const bookings = bookingsResponse.data.data || [];

        // Calculate stats from bookings
        const stats = {
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.bookingStatus === 'Pending').length,
          confirmedBookings: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
          completedBookings: bookings.filter(b => b.bookingStatus === 'Completed').length,
          totalEarnings: bookings
            .filter(b => b.bookingStatus === 'Completed' && b.isPaid)
            .reduce((sum, booking) => sum + (booking.providerEarning || booking.price || 0), 0)
        };

        setDashboardStats(stats);

        // Get recent bookings (last 5)
        const recentBookings = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentBookings(recentBookings);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchListings();
    fetchDashboardStats();
  }, [token, user, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
          return 'bg-blue-100 text-blue-800';
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening with your services today.</p>
          </div>
          <Link 
            to="/provider/services/new" 
            className="inline-flex items-center justify-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <i className="fas fa-plus mr-1.5"></i> Add New Service
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <i className="fas fa-calendar-check text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isStatsLoading ? (
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          dashboardStats.totalBookings
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isStatsLoading ? (
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          dashboardStats.pendingBookings
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <i className="fas fa-check-circle text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isStatsLoading ? (
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          dashboardStats.confirmedBookings
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <i className="fas fa-tasks text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isStatsLoading ? (
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          dashboardStats.completedBookings
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <i className="fas fa-rupee-sign text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isStatsLoading ? (
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          formatCurrency(dashboardStats.totalEarnings)
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
                  <Link 
                    to="/provider/bookings" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View All
                  </Link>
                </div>
              </div>

              {isStatsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="fas fa-calendar-times text-gray-300 text-3xl mb-3"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings yet</h3>
                  <p className="text-gray-500">Your recent bookings will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentBookings.map(booking => (
                    <li key={booking._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              {booking.customerId?.profilePicture ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={booking.customerId.profilePicture}
                                  alt={booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Customer'}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: booking.customerId?.profilePicture ? 'none' : 'flex'}}>
                                <i className="fas fa-user"></i>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Customer'}
                              </p>
                              <StatusBadge status={booking.bookingStatus} />
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {booking.serviceListingId?.serviceTitle || 'Service'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{booking.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(booking.serviceDateTime)}
                            </p>
                          </div>
                          <Link 
                            to={`/provider/bookings?id=${booking._id}`} 
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* My Services */}
          <div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">My Services</h2>
                  <Link 
                    to="/provider/services" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Manage Services
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="p-6">
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
                </div>
              ) : listings.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="fas fa-list-alt text-gray-300 text-3xl mb-3"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No services yet</h3>
                  <p className="text-gray-500 mb-4">Add your first service to start receiving bookings.</p>
                  <Link 
                    to="/provider/services/new" 
                    className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <i className="fas fa-plus mr-1.5"></i> Add New Service
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {listings.slice(0, 3).map(listing => (
                    <div key={listing._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                              {listing.serviceImage ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={listing.serviceImage}
                                  alt={listing.serviceTitle}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center text-gray-500" style={{display: listing.serviceImage ? 'none' : 'flex'}}>
                                <i className="fas fa-image"></i>
                              </div>
                            </div>
                            <span className={`absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${
                              listing.isActive ? 'bg-green-400' : 'bg-gray-400'
                            }`}></span>
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {listing.serviceTitle}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              listing.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {listing.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            ₹{listing.servicePrice?.toFixed(2)}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <Link 
                              to={`/provider/services/edit/${listing._id}`} 
                              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500"
                            >
                              <i className="fas fa-edit mr-1"></i> Edit
                            </Link>
                            <Link 
                              to={`/listing/${listing._id}`} 
                              className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-500"
                            >
                              <i className="fas fa-external-link-alt mr-1"></i> View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {listings.length > 3 && (
                    <div className="px-4 py-4 sm:px-6">
                      <Link 
                        to="/provider/services" 
                        className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>View all {listings.length} services</span>
                        <i className="fas fa-chevron-right ml-1 text-xs"></i>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

export default ProviderDashboard;