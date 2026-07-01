import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = pb.authStore.model;
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    try {
      const data = { email, password, passwordConfirm: password, name };
      const record = await pb.collection('customers').create(data, { $autoCancel: false });
      await login(email, password);
      return { success: true, user: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('customers').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    try {
      await pb.collection('customers').requestPasswordReset(email, { $autoCancel: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = pb.authStore.isValid && currentUser !== null;

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout,
    requestPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};