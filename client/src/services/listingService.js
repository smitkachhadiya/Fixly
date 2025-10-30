import api from '../config/api';

export const listingService = {
  getListings: async (params = {}) => {
    const response = await api.get('/api/listings', { params });
    return response.data;
  },

  getListingById: async (id) => {
    const response = await api.get(`/api/listings/${id}`);
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  },
}