import api from './api';
import { handleApiError } from '../utils/formatters';

export const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user');
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch users');
    }
  }
};
