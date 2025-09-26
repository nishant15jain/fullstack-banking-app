import api from './api';
import { handleApiError } from '../utils/formatters';

export const transactionService = {
  // Get transaction history for an account
  getTransactionHistory: async (accountNumber) => {
    try {
      const response = await api.get(`/transactions/account/${accountNumber}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch transactions');
    }
  },

  // Get paginated transaction history
  getTransactionHistoryPaginated: async (accountNumber, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await api.get(`/transactions/account/${accountNumber}/paginated`, {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch transactions');
    }
  },

  // Deposit money
  deposit: async (accountNumber, transactionData) => {
    try {
      const response = await api.post(`/transactions/deposit/${accountNumber}`, transactionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Deposit failed');
    }
  },

  // Withdraw money
  withdraw: async (accountNumber, transactionData) => {
    try {
      const response = await api.post(`/transactions/withdraw/${accountNumber}`, transactionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Withdrawal failed');
    }
  },

  // Transfer money
  transfer: async (sourceAccountNumber, destinationAccountNumber, transactionData) => {
    try {
      const response = await api.post(`/transactions/transfer/${sourceAccountNumber}/to/${destinationAccountNumber}`, transactionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Transfer failed');
    }
  },


  // Get daily limits for account
  getDailyLimits: async (accountNumber) => {
    try {
      const response = await api.get(`/transactions/limits/${accountNumber}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch limits');
    }
  },

  // Update daily limits
  updateDailyLimits: async (accountNumber, transactionType, newLimit, newTransactionCountLimit) => {
    try {
      const response = await api.put(`/transactions/limits/${accountNumber}`, null, {
        params: { transactionType, newLimit, newTransactionCountLimit }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to update limits');
    }
  }
};
