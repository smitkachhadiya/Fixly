import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';

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
        // Use FormData for file uploads
        console.log('Using FormData for file upload');

        // Log the FormData (this won't show the actual data, just an empty object)
        console.log('Service data FormData:', serviceData);

        response = await axios.put(`/api/listings/${serviceId}`, serviceData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Use JSON for regular data updates
        console.log('Using JSON for data update');

        // Create a regular JSON object
        const jsonData = {
          serviceTitle: formData.serviceTitle,
          serviceDetails: formData.serviceDescription,
          servicePrice: parseFloat(formData.price),
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          serviceLocation: formData.serviceLocation || '',
          tags: ''
        };

        // If we have existing images, include them
        if (existingImages.length > 0) {
          jsonData.serviceImage = existingImages[0];
        }

        console.log('JSON data being sent:', jsonData);

        response = await axios.put(`/api/listings/${serviceId}`, jsonData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Update response:', response.data);

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
      <ProviderLayout>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <div className="flex justify-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
          </div>
          <p className="mt-2 text-gray-600">Loading service details...</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
          <p className="mt-1 text-sm text-gray-600">Update your service details</p>
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
              rows="5"
              placeholder="Describe your service in detail..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
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
                placeholder="e.g. 500"
                min="0"
                step="0.01"
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
                placeholder="e.g. 60"
                min="0"
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
              placeholder="e.g. Customer's home, My shop, etc."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Images
            </label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {existingImages.map((src, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={src}
                      alt={`Service ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add New Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="space-y-1 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <i className="fas fa-cloud-upload-alt text-blue-600 text-xl"></i>
                </div>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="serviceImages" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload images</span>
                    <input
                      type="file"
                      id="serviceImages"
                      name="serviceImages"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>

              {imagePreview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={src}
                        alt={`New preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => navigate('/provider/services')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1 text-xs"></i> Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1 text-xs"></i> Update Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProviderLayout>
  );
}

export default EditService;