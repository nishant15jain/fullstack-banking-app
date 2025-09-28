import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';

// Query keys
export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (filters) => [...transactionKeys.lists(), { filters }],
  history: (accountNumber) => [...transactionKeys.all, 'history', accountNumber],
  historyPaginated: (accountNumber, page, size, sortBy, sortDir) => [
    ...transactionKeys.all, 
    'history-paginated', 
    accountNumber, 
    { page, size, sortBy, sortDir }
  ],
  limits: (accountNumber) => [...transactionKeys.all, 'limits', accountNumber],
};

// Hook to get transaction history for an account
export const useTransactionHistory = (accountNumber) => {
  return useQuery({
    queryKey: transactionKeys.history(accountNumber),
    queryFn: () => transactionService.getTransactionHistory(accountNumber),
    enabled: !!accountNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time to reduce calls
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Hook to get paginated transaction history
export const useTransactionHistoryPaginated = (accountNumber, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  return useQuery({
    queryKey: transactionKeys.historyPaginated(accountNumber, page, size, sortBy, sortDir),
    queryFn: () => transactionService.getTransactionHistoryPaginated(accountNumber, page, size, sortBy, sortDir),
    enabled: !!accountNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time to reduce calls
    refetchOnWindowFocus: false, // Don't refetch on window focus
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

// Hook to get daily limits for an account
export const useDailyLimits = (accountNumber) => {
  return useQuery({
    queryKey: transactionKeys.limits(accountNumber),
    queryFn: () => transactionService.getDailyLimits(accountNumber),
    enabled: !!accountNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to make a deposit
export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountNumber, transactionData }) => 
      transactionService.deposit(accountNumber, transactionData),
    onSuccess: (data, variables) => {
      // Invalidate ALL transaction-related queries for immediate updates
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false // This will invalidate all transaction queries
      });
      
      // Invalidate accounts to update balance
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Hook to make a withdrawal
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountNumber, transactionData }) => 
      transactionService.withdraw(accountNumber, transactionData),
    onSuccess: (data, variables) => {
      // Invalidate ALL transaction-related queries for immediate updates
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false // This will invalidate all transaction queries
      });
      
      // Invalidate accounts to update balance
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Hook to make a transfer
export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceAccountNumber, destinationAccountNumber, transactionData }) => 
      transactionService.transfer(sourceAccountNumber, destinationAccountNumber, transactionData),
    onSuccess: (data, variables) => {
      // Invalidate ALL transaction-related queries for immediate updates
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'],
        exact: false // This will invalidate all transaction queries
      });
      
      // Invalidate accounts to update balances
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Hook to update daily limits
export const useUpdateDailyLimits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountNumber, transactionType, newLimit, newTransactionCountLimit }) => 
      transactionService.updateDailyLimits(accountNumber, transactionType, newLimit, newTransactionCountLimit),
    onSuccess: (data, variables) => {
      // Invalidate and refetch limits
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.limits(variables.accountNumber) 
      });
    },
  });
};
