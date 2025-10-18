import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// Remove ProviderLayout import since it will be handled by App.jsx

function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    serviceTitle: '',
    serviceCategory: '',
    serviceDescription: '',
    price: '',
    duration: '',
    serviceLocation: '',
    serviceImages: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const categories = [
    'Home Cleaning',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Appliance Repair',
    'Pest Control',
    'Gardening',
    'Interior Design',
    'Moving & Packing',
    'Beauty & Spa',
    'Computer Repair',
    'Tutoring',
    'Event Planning',
    'Photography',
    'Other'
  ];

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/listings/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const serviceData = response.data.data;
        console.log('Fetched service data:', serviceData);

        // Make sure we have all the data we need
        if (!serviceData) {
          throw new Error('No service data returned from the server');
        }

        setFormData({
          serviceTitle: serviceData.serviceTitle || '',
          serviceCategory: serviceData.categoryId?.categoryName || '',
          serviceDescription: serviceData.serviceDetails || '',
          price: serviceData.servicePrice ? serviceData.servicePrice.toString() : '',
          duration: serviceData.duration ? serviceData.duration.toString() : '',
          serviceLocation: serviceData.serviceLocation || '',
          serviceImages: []
        });

        if (serviceData.serviceImage) {
          setExistingImages([serviceData.serviceImage]);
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && serviceId) {
      fetchServiceDetails();
    }
  }, [token, serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Preview images
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newImagePreviews]);

    // Store files for upload
    setFormData({
      ...formData,
      serviceImages: [...formData.serviceImages, ...files]
    });
  };

  const removeNewImage = (index) => {
    const updatedPreviews = [...imagePreview];
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);

    const updatedImages = [...formData.serviceImages];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      serviceImages: updatedImages
    });
  };

  const removeExistingImage = (index) => {
    const updatedExistingImages = [...existingImages];
    updatedExistingImages.splice(index, 1);
    setExistingImages(updatedExistingImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceTitle.trim()) {
      setError('Service title is required');
      return;
    }
    if (!formData.serviceCategory) {
      setError('Please select a category');
      return;
    }
    if (!formData.serviceDescription.trim()) {
      setError('Service description is required');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    // Log what we're submitting for debugging
    console.log('Submitting form data:', formData);

    setIsSubmitting(true);
    setError(null);

    try {
      // Log what we're submitting
      console.log('Form data being submitted:', formData);

      // Create form data for file upload
      const serviceData = new FormData();
      serviceData.append('serviceTitle', formData.serviceTitle);
      serviceData.append('serviceDetails', formData.serviceDescription);

      // Make sure price is a valid number
      if (formData.price) {
        const priceValue = parseFloat(formData.price);
        if (!isNaN(priceValue)) {
          console.log('Appending valid price:', priceValue);
          serviceData.append('servicePrice', priceValue.toString());
        } else {
          console.log('Invalid price value:', formData.price);
        }
      }

      // Make sure duration is a valid number
      if (formData.duration) {
        const durationValue = parseInt(formData.duration);
        if (!isNaN(durationValue)) {
          serviceData.append('duration', durationValue.toString());
        }
      }

      serviceData.append('serviceLocation', formData.serviceLocation || '');

      // Add tags if needed
      serviceData.append('tags', '');

      // Handle image if needed
      if (existingImages.length > 0) {
        serviceData.append('serviceImage', existingImages[0]);
      } else if (formData.serviceImages.length > 0) {
        serviceData.append('serviceImage', formData.serviceImages[0]);
      }

      // Check if we have any file uploads
      const hasFileUploads = formData.serviceImages && formData.serviceImages.length > 0;

      let response;

      if (hasFileUploads) {
        // If we're uploading a new image, use FormData
        response = await axios.put(`/api/listings/${serviceId}`, serviceData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // If we're not uploading a new image, use JSON
        const jsonData = {
          serviceTitle: formData.serviceTitle,
          serviceDetails: formData.serviceDescription,
          servicePrice: parseFloat(formData.price) || 0,
          duration: parseInt(formData.duration) || 0,
          serviceLocation: formData.serviceLocation || '',
          serviceImage: existingImages[0] || null
        };

        response = await axios.put(`/api/listings/${serviceId}`, jsonData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Service updated successfully:', response.data);
      navigate('/provider/services');
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || 'Failed to update service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    // Remove ProviderLayout wrapper since it's handled by App.jsx
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
        <p className="mt-1 text-sm text-gray-600">Update your service listing details</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="serviceTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Service Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="serviceTitle"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="e.g. Professional Home Cleaning"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="serviceCategory"
            name="serviceCategory"
            value={formData.serviceCategory}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="serviceDescription"
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your service in detail..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              placeholder="60"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="serviceLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Service Location
          </label>
          <input
            type="text"
            id="serviceLocation"
            name="serviceLocation"
            value={formData.serviceLocation}
            onChange={handleChange}
            placeholder="e.g. Mumbai, Delhi, etc."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {existingImages.length > 0 || imagePreview.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img 
                        src={image} 
                        alt="Existing" 
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                  {imagePreview.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt mx-auto h-12 w-12 text-gray-400"></i>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="serviceImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input 
                        id="serviceImage" 
                        name="serviceImage" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/provider/services')}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Update Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    // Remove ProviderLayout wrapper since it's handled by App.jsx
  );
}

export default EditService;