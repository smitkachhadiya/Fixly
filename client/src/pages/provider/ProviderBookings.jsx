import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10); // 10 bookings per page
  
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // Use the correct API endpoint for both development and production
        const response = await axios.get('/api/bookings/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    setStatusMessage({ type: '', message: '' });

    try {
      await axios.put(`/api/bookings/${bookingId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, bookingStatus: newStatus }
          : booking
      ));

      setStatusMessage({
        type: 'success',
        message: `Booking status updated to ${newStatus} successfully!`
      });

      // Close modal if open
      if (isModalOpen && selectedBooking?._id === bookingId) {
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to update booking status. Please try again.'
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'pending') return booking.bookingStatus === 'Pending';
    if (activeTab === 'confirmed') return booking.bookingStatus === 'Confirmed';
    if (activeTab === 'completed') return booking.bookingStatus === 'Completed';
    if (activeTab === 'cancelled') return booking.bookingStatus === 'Cancelled';
    return true;
  });

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your service bookings</p>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Pending').length}</span>
                <span className="ml-1">Pending</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Confirmed').length}</span>
                <span className="ml-1">Confirmed</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="font-bold">{bookings.filter(b => b.bookingStatus === 'Completed').length}</span>
                <span className="ml-1">Completed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.type && (
          <div className={`rounded-md p-4 ${statusMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <i className={`fas ${statusMessage.type === 'success' ? 'fa-check-circle text-green-400' : 'fa-exclamation-circle text-red-400'}`}></i>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {statusMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('pending');
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              Pending
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('confirmed');
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              Confirmed
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('completed');
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              Completed
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('cancelled');
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              Cancelled
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              All Bookings
            </button>
          </nav>
        </div>

        {/* Bookings Count */}
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to <span className="font-medium">
              {Math.min(indexOfLastBooking, filteredBookings.length)}
            </span> of <span className="font-medium">{filteredBookings.length}</span> bookings
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="flex justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
            </div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <i className="fas fa-calendar-times text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">There are no bookings in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Bookings Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                    {currentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Customer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.customerId?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.serviceListingId?.serviceTitle || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {booking.serviceListingId?.categoryId?.categoryName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(booking.serviceDateTime)}</div>
                          <div className="text-sm text-gray-500">{formatTime(booking.serviceDateTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{booking.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={booking.bookingStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <i className="fas fa-eye mr-1.5"></i> View
                            </button>
                            {booking.bookingStatus === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                                  disabled={statusUpdateLoading}
                                  className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                  <i className="fas fa-check mr-1.5"></i> Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                                  disabled={statusUpdateLoading}
                                  className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  <i className="fas fa-times mr-1.5"></i> Cancel
                                </button>
                              </>
                            )}
                            {booking.bookingStatus === 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                                disabled={statusUpdateLoading}
                                className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                <i className="fas fa-check-circle mr-1.5"></i> Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                      Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to <span className="font-medium">
                        {Math.min(indexOfLastBooking, filteredBookings.length)}
                      </span> of <span className="font-medium">{filteredBookings.length}</span> results
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

        {/* Booking Details Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Details</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="mt-4 border-t border-gray-200">
                  <div className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                        <div className="mt-2 flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {selectedBooking.customerId?.profilePicture ? (
                              <img
                                className="w-full h-full object-cover"
                                src={selectedBooking.customerId.profilePicture}
                                alt={selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName}` : 'Customer'}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: selectedBooking.customerId?.profilePicture ? 'none' : 'flex'}}>
                              <i className="fas fa-user"></i>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName}` : 'Customer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedBooking.customerId?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Service</h4>
                        <p className="mt-2 text-sm text-gray-900">
                          {selectedBooking.serviceListingId?.serviceTitle || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedBooking.serviceListingId?.categoryId?.categoryName || 'N/A'}
                        </p>
                      </div>

                      {/* Date & Time */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                        <p className="mt-2 text-sm text-gray-900">
                          {formatDate(selectedBooking.serviceDateTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(selectedBooking.serviceDateTime)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <div className="mt-2">
                          <StatusBadge status={selectedBooking.bookingStatus} />
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                        <p className="mt-2 text-sm text-gray-900">
                          ₹{selectedBooking.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>

                      {/* Payment Status */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Payment</h4>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBooking.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedBooking.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500">Service Address</h4>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBooking.serviceAddress || 'N/A'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Close
                      </button>
                      {selectedBooking.bookingStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              handleUpdateStatus(selectedBooking._id, 'Cancelled');
                              closeModal();
                            }}
                            disabled={statusUpdateLoading}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <i className="fas fa-times mr-1.5"></i> Cancel Booking
                          </button>
                          <button
                            onClick={() => {
                              handleUpdateStatus(selectedBooking._id, 'Confirmed');
                              closeModal();
                            }}
                            disabled={statusUpdateLoading}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <i className="fas fa-check mr-1.5"></i> Confirm Booking
                          </button>
                        </>
                      )}
                      {selectedBooking.bookingStatus === 'Confirmed' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(selectedBooking._id, 'Completed');
                            closeModal();
                          }}
                          disabled={statusUpdateLoading}
                          className="inline-flex items-center px-2.5 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <i className="fas fa-check-circle mr-1.5"></i> Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}

export default ProviderBookings;