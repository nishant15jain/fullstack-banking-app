import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../services/accountService';

// Query keys
export const accountKeys = {
  all: ['accounts'],
  lists: () => [...accountKeys.all, 'list'],
  list: (filters) => [...accountKeys.lists(), { filters }],
  details: () => [...accountKeys.all, 'detail'],
  detail: (accountNumber) => [...accountKeys.details(), accountNumber],
};

// Hook to get all user accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: accountService.getUserAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get paginated accounts
export const useAccountsPaginated = (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  return useQuery({
    queryKey: accountKeys.list({ page, size, sortBy, sortDir }),
    queryFn: () => accountService.getUserAccountsPaginated(page, size, sortBy, sortDir),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get account by number
export const useAccount = (accountNumber) => {
  return useQuery({
    queryKey: accountKeys.detail(accountNumber),
    queryFn: () => accountService.getAccountByNumber(accountNumber),
    enabled: !!accountNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create account
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.createAccount,
    onSuccess: (newAccount) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      
      // Optionally, add the new account to the cache
      queryClient.setQueryData(accountKeys.lists(), (oldData) => {
        return oldData ? [...oldData, newAccount] : [newAccount];
      });
    },
  });
};

// Hook to delete account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.deleteAccount,
    onSuccess: (_, deletedAccountNumber) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      
      // Remove the deleted account from cache
      queryClient.setQueryData(accountKeys.lists(), (oldData) => {
        return oldData ? oldData.filter(account => account.accountNumber !== deletedAccountNumber) : [];
      });
      
      // Remove the specific account detail from cache
      queryClient.removeQueries({ queryKey: accountKeys.detail(deletedAccountNumber) });
    },
  });
};

// Hook to suspend account
export const useSuspendAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.suspendAccount,
    onSuccess: (updatedAccount, accountNumber) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      
      // Update the specific account in cache
      queryClient.setQueryData(accountKeys.detail(accountNumber), updatedAccount);
    },
  });
};

// Hook to activate account
export const useActivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountService.activateAccount,
    onSuccess: (updatedAccount, accountNumber) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      
      // Update the specific account in cache
      queryClient.setQueryData(accountKeys.detail(accountNumber), updatedAccount);
    },
  });
};
