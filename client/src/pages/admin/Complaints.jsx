import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Table from '../../components/admin/shared/Table';
import Modal from '../../components/admin/shared/Modal';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('In Progress');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterStatus, setFilterStatus] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, [token, pagination.page, sortConfig, filterStatus]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      // Use the correct API endpoint for admin
      const response = await axios.get(`/api/complaints/admin?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setIsLoading(false);
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

  // Handle filter status change
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.resolutionNotes || '');
    setResponseStatus(complaint.complaintStatus || 'Pending');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setAdminResponse('');
    setResponseStatus('In Progress');
  };

  const handleSubmitResponse = async () => {
    try {
      await axios.put(`/api/complaints/${selectedComplaint._id}`, {
        complaintStatus: responseStatus,
        resolutionNotes: adminResponse
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint._id === selectedComplaint._id
          ? { ...complaint, resolutionNotes: adminResponse, complaintStatus: responseStatus }
          : complaint
      ));

      handleCloseModal();
    } catch (err) {
      console.error('Error updating complaint:', err);
      setError('Failed to update complaint. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Customer',
      accessor: 'customerId',
      Cell: (complaint) => (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {complaint.customerId?.firstName} {complaint.customerId?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {complaint.customerId?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'bookingId',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {complaint.bookingId?.serviceListingId?.serviceTitle || 'N/A'}
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'complaintType',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {complaint.complaintType}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {formatDate(complaint.createdAt)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'complaintStatus',
      Cell: (complaint) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(complaint.complaintStatus)}`}>
          {complaint.complaintStatus || 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (complaint) => (
        <button
          onClick={() => handleViewComplaint(complaint)}
          className="text-blue-600 hover:text-blue-900"
        >
          <i className="fas fa-eye mr-1"></i> View Details
        </button>
      )
    }
  ];

  // Render modal content
  const renderModalContent = () => {
    if (!selectedComplaint) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="text-sm">
              {selectedComplaint.customerId?.firstName} {selectedComplaint.customerId?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{selectedComplaint.customerId?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service</p>
            <p className="text-sm">
              {selectedComplaint.bookingId?.serviceListingId?.serviceTitle || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Provider</p>
            <p className="text-sm">
              {selectedComplaint.bookingId?.serviceProviderId?.userId?.firstName} {selectedComplaint.bookingId?.serviceProviderId?.userId?.lastName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Complaint Type</p>
            <p className="text-sm">{selectedComplaint.complaintType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date Submitted</p>
            <p className="text-sm">{formatDate(selectedComplaint.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Complaint Text</p>
          <p className="text-sm bg-gray-50 p-3 rounded mt-1">
            {selectedComplaint.complaintText}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-500">Admin Response</p>
          <textarea
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows="4"
            placeholder="Enter your response to this complaint..."
          ></textarea>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <select
            value={responseStatus}
            onChange={(e) => setResponseStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    );
  };

  // Render modal footer
  const renderModalFooter = () => {
    return (
      <>
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
          onClick={handleCloseModal}
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={handleSubmitResponse}
        >
          Save Response
        </button>
      </>
    );
  };

  return (
    <AdminLayout title="Complaint Management">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6" role="alert">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-3 text-red-500"></i>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Customer Complaints</h2>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Status:</label>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-2 pr-6 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={complaints}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No complaints found"
        />
      </div>

      {/* Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Complaint Details"
        footer={renderModalFooter()}
        size="lg"
      >
        {renderModalContent()}
      </Modal>
      </div>
    </AdminLayout>
  );
}

export default Complaints;