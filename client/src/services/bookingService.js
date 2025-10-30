import api from '../config/api';

export const bookingService = {
  
  
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

}