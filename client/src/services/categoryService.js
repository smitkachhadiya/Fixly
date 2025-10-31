import api from '../config/api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },


};