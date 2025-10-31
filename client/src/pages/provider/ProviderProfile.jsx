import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import ProviderLayout from './ProviderLayout';
import ChangePasswordModal from '../auth/ChangePassword';
import Navbar from '../../components/common/Navbar';
// Remove the CSS import since we'll use Tailwind classes
// import './ProviderProfile.css';

function ProviderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    description: '',
    profilePicture: '',
    verificationStatus: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(!id);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

   useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let userData = null;

        if (id) {
          // Fetching another provider's profile
          setIsOwnProfile(false);

          // Get provider data by ID
          const providerResponse = await api.get(`/api/providers/${id}`);
          console.log('Provider data from API:', providerResponse.data);

          if (providerResponse.data.success) {
            userData = providerResponse.data.data;

            // Also fetch services by this provider
            try {
              // Use the correct endpoint for fetching services by provider ID
              const servicesResponse = await api.get(`/api/listings/provider/${id}`);
              console.log('Provider services from API:', servicesResponse.data);
              if (servicesResponse.data.success) {
                setServices(servicesResponse.data.data);
              }
            } catch (err) {
              console.error('Error fetching provider services:', err);
            }
          } else {
            throw new Error('Provider not found');
          }
        } else {
          // Fetching own profile
          setIsOwnProfile(true);

          // First, check if we have user data in localStorage
          const cachedUserData = localStorage.getItem('userData');

          if (cachedUserData) {
            userData = JSON.parse(cachedUserData);
            console.log('Using cached user data:', userData);

            // Set profile from cached data while we fetch the latest
            setProfile({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              businessName: userData.businessName || '',
              businessAddress: userData.address || '',
              description: userData.description || '',
              profilePicture: userData.profilePicture || '',
              verificationStatus: userData.verificationStatus || userData.isVerified ? 'verified' : 'pending'
            });
          }

          // Get fresh user data from the auth endpoint using cached API
          const userResponse = await api.getCurrentUser();

          console.log('Fresh user data from API:', userResponse.data);
          userData = userResponse.data.data || userResponse.data;

          // Store the user data in localStorage for persistence
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Extract all necessary information from the user data
        if (id) {
          // For public provider profile
          setProfile(userData);
        } else {
          // For own profile
          setProfile({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            businessName: userData.businessName || '',
            businessAddress: userData.address || '',
            description: userData.description || '',
            profilePicture: userData.profilePicture || '',
            // Check if verification status is available in user data
            verificationStatus: userData.verificationStatus || userData.isVerified ? 'verified' : 'pending'
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
        setError('Failed to load profile');
        setLoading(false);
      }
    };



    if (id) {
      // We can fetch other provider profiles without being logged in
      fetchProfile();
    } else if (token) {
      // For own profile, we need to be logged in
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [token, navigate, logout]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError('');

        // Show uploading message
        setSuccessMessage('Uploading image...');

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        console.log('Image uploaded to Cloudinary:', imageUrl);

        if (!imageUrl) {
          throw new Error('Failed to get image URL from Cloudinary');
        }

        // Update the user profile with the new image URL
        const response = await axios.put(
          process.env.NODE_ENV === 'production' ? '' : '/api/auth/updateprofile',
          { profilePicture: imageUrl }, // Only send the profile picture field
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Profile update response:', response.data);

        if (response.data.success) {
          // Update local state with the new image URL
          setProfile(prev => ({ ...prev, profilePicture: imageUrl }));

          // Update the profile picture in localStorage to persist across refreshes
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          setSuccessMessage('Profile image updated successfully');
        } else {
          throw new Error('Failed to update profile on server');
        }
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setError('Failed to upload profile image: ' + (err.response?.data?.message || err.message));
        setSuccessMessage('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Prepare data for update
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        businessName: profile.businessName,
        address: profile.businessAddress,
        description: profile.description
      };

      // Update profile
      const response = await api.put('/api/auth/updateprofile', updateData);

      if (response.data.success) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        Object.assign(userData, updateData);
        localStorage.setItem('userData', JSON.stringify(userData));

        setSuccessMessage('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getVerificationStatusBadge = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <i className="fas fa-check-circle mr-1"></i> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <i className="fas fa-times-circle mr-1"></i> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <i className="fas fa-clock mr-1"></i> Pending
          </span>
        );
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOwnProfile ? 'My Profile' : 'Provider Profile'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isOwnProfile 
                ? 'Manage your profile information' 
                : 'View provider details'}
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-key mr-1 text-xs"></i> Change Password
            </button>
          )}
        </div>

        {/* Messages */}
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

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                        {profile.profilePicture ? (
                          <>
                            <img
                              src={profile.profilePicture}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                              <i className="fas fa-user text-4xl"></i>
                            </div>
                          </>
                        ) : (
                          <i className="fas fa-user text-4xl text-gray-400"></i>
                        )}
                      </div>
                      {isOwnProfile && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                          <i className="fas fa-camera text-white text-sm"></i>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="mt-2">
                      {getVerificationStatusBadge()}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.businessName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Address</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.businessAddress || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form and Services */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Form */}
              {isOwnProfile && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Update your personal and business information</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={profile.firstName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={profile.lastName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profile.email}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={profile.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                            Business Name
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            id="businessName"
                            value={profile.businessName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                            Business Address
                          </label>
                          <textarea
                            name="businessAddress"
                            id="businessAddress"
                            rows={3}
                            value={profile.businessAddress}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={4}
                            value={profile.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="ml-3 inline-flex justify-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1 text-xs"></i> Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-1 text-xs"></i> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Services */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Services</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isOwnProfile 
                      ? 'Your service listings' 
                      : `${profile.firstName}'s service listings`}
                  </p>
                </div>
                <div className="p-6">
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-list-alt text-3xl text-gray-300 mb-3"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No services listed</h3>
                      <p className="text-gray-500">
                        {isOwnProfile 
                          ? 'You haven\'t created any services yet.' 
                          : 'This provider hasn\'t created any services yet.'}
                      </p>
                      {isOwnProfile && (
                        <a
                          href="/provider/services/new"
                          className="mt-4 inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <i className="fas fa-plus mr-1 text-xs"></i> Add Service
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {services.map(service => (
                        <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                {service.serviceImage ? (
                                  <>
                                    <img
                                      src={service.serviceImage}
                                      alt={service.serviceTitle}
                                      className="w-16 h-16 rounded-md object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                                      <i className="fas fa-image text-xl"></i>
                                    </div>
                                  </>
                                ) : (
                                  <i className="fas fa-image text-gray-400 text-xl"></i>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{service.serviceTitle}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {service.serviceDetails || 'No description provided'}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  ₹{service.servicePrice?.toFixed(2)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  service.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
          />
        )}
      </div>
    </ProviderLayout>
  );
}

export default ProviderProfile;