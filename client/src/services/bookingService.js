import api from '../config/api';

export const bookingService = {
  
  getBookings: async (params = {}) => {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },
  
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

}