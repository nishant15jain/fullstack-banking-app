import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLogin, useRegister, useLogout, useCurrentUser } from '../hooks/useAuth';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // React Query hooks
  const { data: user, isLoading: loading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Determine authentication status
  const isAuthenticated = authService.isAuthenticated() && !!user;

  const login = async (email, password) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerMutation.mutateAsync(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
