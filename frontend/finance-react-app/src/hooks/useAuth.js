import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

// Query keys
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  currentUser: () => [...authKeys.user(), 'current'],
};

export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
};

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if user is not authenticated
  });
};

// Hook to get user by ID
export const useUser = (userId) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get all users (admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userService.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      
      // Set user data in cache if available
      if (data.user) {
        queryClient.setQueryData(authKeys.currentUser(), data.user);
      }
      
      // Invalidate all user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Hook for registration
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};
