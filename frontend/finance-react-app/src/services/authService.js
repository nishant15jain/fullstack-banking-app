import api from './api';
import { handleApiError } from '../utils/formatters';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // You might want to decode the JWT to get user info
        return response.data;
      }
      
      throw new Error('No token received');
    } catch (error) {
      throw handleApiError(error, 'Login failed');
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Registration failed');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Get user info from API
  getCurrentUser: async () => {
    try {
      // First try to get from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      
      // If not in localStorage, extract user ID from token and fetch
      const token = localStorage.getItem('authToken');
      if (token) {
        const userId = authService.getUserIdFromToken(token);
        if (userId) {
          const { userService } = await import('./userService');
          const userData = await userService.getUserById(userId);
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  // Extract user ID from JWT token (simple implementation)
  getUserIdFromToken: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub; // Assuming the user ID is in the 'sub' claim
    } catch (error) {
      return null;
    }
  }
};
