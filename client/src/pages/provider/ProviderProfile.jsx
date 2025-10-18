import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
// Remove ProviderLayout import since it will be handled by App.jsx
import ChangePasswordModal from '../auth/ChangePassword';
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
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Prepare the data to send
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        businessName: profile.businessName,
        address: profile.businessAddress,
        description: profile.description
      };

      // Update the user profile
      const response = await api.put('/api/auth/updateprofile', updateData);

      if (response.data.success) {
        // Update local state
        setProfile(prev => ({ ...prev, ...updateData }));

        // Update the profile in localStorage to persist across refreshes
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        Object.assign(userData, updateData);
        localStorage.setItem('userData', JSON.stringify(userData));

        setSuccessMessage('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifyAccount = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Send verification request
      const response = await api.post('/api/providers/request-verification');

      if (response.data.success) {
        // Update local state
        setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
        setSuccessMessage('Verification request submitted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to submit verification request');
      }
    } catch (err) {
      console.error('Failed to submit verification request:', err);
      setError('Failed to submit verification request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const VerificationBadge = () => {
    const status = profile.verificationStatus?.toLowerCase();
    
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <i className="fas fa-check-circle mr-1"></i>
          Verified
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <i className="fas fa-clock mr-1"></i>
          Pending Verification
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <i className="fas fa-exclamation-circle mr-1"></i>
          Not Verified
        </span>
      );
    }
  };

  if (loading && !profile.firstName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isOwnProfile ? 'My Profile' : 'Provider Profile'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isOwnProfile ? 'Manage your service provider profile' : 'View provider information'}
              </p>
            </div>
            {isOwnProfile && (
              <div className="mt-4 md:mt-0">
                <VerificationBadge />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profile.profilePicture ? (
                        <img
                          className="w-full h-full object-cover"
                          src={profile.profilePicture}
                          alt={profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Provider'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: profile.profilePicture ? 'none' : 'flex'}}>
                        <i className="fas fa-user text-4xl"></i>
                      </div>
                    </div>
                    
                    {isOwnProfile && (
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50">
                        <i className="fas fa-camera text-gray-600"></i>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                  
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  
                  {isOwnProfile ? (
                    <p className="text-gray-500 mt-1">Service Provider</p>
                  ) : (
                    <div className="mt-2">
                      <VerificationBadge />
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <i className="fas fa-key mr-1.5"></i>
                      Change Password
                    </button>
                  )}
                </div>
                
                {isOwnProfile && profile.verificationStatus !== 'verified' && (
                  <div className="mt-6">
                    <button
                      onClick={handleVerifyAccount}
                      disabled={loading || profile.verificationStatus === 'pending'}
                      className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        profile.verificationStatus === 'pending' 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : profile.verificationStatus === 'pending' ? (
                        <>
                          <i className="fas fa-clock mr-2"></i>
                          Verification Pending
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shield-alt mr-2"></i>
                          Request Verification
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Verified accounts build trust with customers
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Details Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile.email}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      id="businessName"
                      value={profile.businessName}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                      Business Address
                    </label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      rows={3}
                      value={profile.businessAddress}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={profile.description}
                      onChange={handleInputChange}
                      disabled={!isOwnProfile || loading}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
              
              {isOwnProfile && services.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">My Services</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {services.slice(0, 4).map(service => (
                      <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
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
                              <div className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center text-gray-500" style={{display: service.serviceImage ? 'none' : 'flex'}}>
                                <i className="fas fa-image"></i>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{service.serviceTitle}</h4>
                            <p className="text-sm text-gray-500">₹{service.servicePrice?.toFixed(2)}</p>
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
                    ))}
                  </div>
                  {services.length > 4 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => navigate('/provider/services')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View all {services.length} services
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isOwnProfile && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
    // Remove ProviderLayout wrapper since it's handled by App.jsx
  );
}

export default ProviderProfile;