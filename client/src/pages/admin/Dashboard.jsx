import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Card from '../../components/admin/shared/Card';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    listings: 0,
    bookings: 0,
    revenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    conversionRate: 0,
    avgBookingValue: 0,
    userGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let dateParams = '';
      if (dateRange.start && dateRange.end) {
        dateParams = `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      } else if (dateRange.start) {
        dateParams = `?startDate=${dateRange.start}`;
      } else if (dateRange.end) {
        dateParams = `?endDate=${dateRange.end}`;
      }

      const response = await axios.get(
        `/api/admin/dashboard${dateParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dashboardData = response.data.data;

      // Data for charts and recent activities removed
      setStats({
        users: dashboardData.counts.users,
        providers: dashboardData.counts.providers,
        listings: dashboardData.counts.listings,
        bookings: dashboardData.counts.bookings,
        revenue: dashboardData.financial.totalRevenue,
        pendingBookings: dashboardData.counts.pendingBookings,
        completedBookings: dashboardData.counts.completedBookings,
        cancelledBookings: dashboardData.counts.cancelledBookings,
        conversionRate: dashboardData.performance.conversionRate,
        avgBookingValue: dashboardData.financial.avgBookingValue,
        userGrowth: dashboardData.performance.userGrowth,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    let pollingInterval;
    if (isAutoRefresh) {
      pollingInterval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // 30 seconds
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [token, user, navigate, isAutoRefresh]);

  useEffect(() => {
    if (user && user.userType === 'admin') {
      fetchDashboardData();
    }
  }, [dateRange.start, dateRange.end]);

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm" role="alert">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-3 text-xl"></i>
            <div>
              <h3 className="font-bold text-lg">Error Loading Dashboard</h3>
              <p className="mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <i className="fas fa-redo-alt mr-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="bg-blue-100 rounded-xl shadow-lg">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-grey-900 font-bold ">Dashboard Overview</h1>
                <p className="text-blue-700 mt-1">Welcome back, manage your platform efficiently</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-50 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center text-grey-500 text-sm">
                    <i className="fas fa-clock mr-2"></i>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                  {isAutoRefresh && (
                    <div className="flex items-center text-green-500 text-xs mt-1">
                      <i className="fas fa-sync-alt animate-spin mr-1"></i>
                      Auto-refreshing every 30s
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleClearFilters}
                disabled={!dateRange.start && !dateRange.end}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-times mr-1"></i>
                Clear
              </button>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-1 ${
                  isAutoRefresh
                    ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 focus:ring-blue-500'
                }`}
              >
                <i className={`fas fa-${isAutoRefresh ? 'pause' : 'play'} mr-1`}></i>
                {isAutoRefresh ? 'Pause' : 'Enable'}
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <i className="fas fa-sync-alt mr-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-4 flex items-center" role="alert">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-red-500 ml-auto focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Card
            title="Total Users"
            value={stats.users.toString()}
            icon={<i className="fas fa-users"></i>}
            color="purple"
            trend={parseFloat(stats.userGrowth) >= 0 ? 'up' : 'down'}
            trendValue={`${parseFloat(stats.userGrowth) >= 0 ? '+' : ''}${stats.userGrowth}%`}
            subtitle="vs last month"
            onClick={() => navigate('/admin/users')}
          />

          <Card
            title="Service Providers"
            value={stats.providers.toString()}
            icon={<i className="fas fa-toolbox"></i>}
            color="indigo"
            trend="up"
            trendValue="+3%"
            subtitle="vs last month"
            onClick={() => navigate('/admin/providers')}
          />

          <Card
            title="Active Listings"
            value={stats.listings.toString()}
            icon={<i className="fas fa-list-alt"></i>}
            color="blue"
            trend="up"
            trendValue="+8%"
            subtitle="vs last month"
            onClick={() => navigate('/admin/listings')}
          />

          <Card
            title="Total Revenue"
            value={formatCurrency(stats.revenue)}
            icon={<i className="fas fa-rupee-sign"></i>}
            color="green"
            trend="up"
            trendValue="+12%"
            subtitle="vs last month"
            onClick={() => navigate('/admin/earnings')}
          />

          <Card
            title="Pending Bookings"
            value={stats.pendingBookings.toString()}
            icon={<i className="fas fa-clock"></i>}
            color="yellow"
            onClick={() => navigate('/admin/bookings?status=pending')}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
