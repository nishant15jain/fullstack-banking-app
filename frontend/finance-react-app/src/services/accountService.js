import api from './api';
import { handleApiError } from '../utils/formatters';

export const accountService = {
  // Get all accounts for current user
  getUserAccounts: async () => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch accounts');
    }
  },

  // Get paginated accounts for current user
  getUserAccountsPaginated: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await api.get('/accounts/paginated', {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch accounts');
    }
  },

  // Create new account
  createAccount: async (accountData) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create account');
    }
  },

  // Get account by account number (if needed)
  getAccountByNumber: async (accountNumber) => {
    try {
      const response = await api.get(`/accounts/${accountNumber}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch account');
    }
  },

  // Delete account
  deleteAccount: async (accountNumber) => {
    try {
      const response = await api.delete(`/accounts/${accountNumber}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to delete account');
    }
  },

  // Suspend account
  suspendAccount: async (accountNumber) => {
    try {
      const response = await api.patch(`/accounts/${accountNumber}/suspend`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to suspend account');
    }
  },

  // Activate account
  activateAccount: async (accountNumber) => {
    try {
      const response = await api.patch(`/accounts/${accountNumber}/activate`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to activate account');
    }
  }
};
