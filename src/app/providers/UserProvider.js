'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/api/userService';

const UserContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refetch: () => {}
});

export function UserProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    loading: true,
    isClient: false
  });

  useEffect(() => {
    // Первый рендер на клиенте
    const savedApiKey = userService.loadApiKeyFromStorage();
    
    if (savedApiKey) {
      userService.setApiKey(savedApiKey);
      loadUser(savedApiKey);
    } else {
      setState(prev => ({ ...prev, loading: false, isClient: true }));
    }
  }, []);

  const loadUser = async (apiKey) => {
    try {
      const userData = await userService.getUser(apiKey);
      setState({
        user: userData,
        loading: false,
        isClient: true
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      clearAuth();
    }
  };

  const login = async (apiKey) => {
    userService.setApiKey(apiKey);
    await loadUser(apiKey);
  };

  const logout = async () => {
    await userService.logout();
    clearAuth();
    window.location.href = '/';
  };

  const clearAuth = () => {
    setState({
      user: null,
      loading: false,
      isClient: true
    });
  };

  // ⭐ Возвращаем user только когда isClient = true
  const contextValue = {
    user: state.isClient ? state.user : null,
    loading: state.isClient ? state.loading : true,
    login,
    logout,
    refetch: () => {
      const apiKey = userService.loadApiKeyFromStorage();
      if (apiKey) loadUser(apiKey);
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);