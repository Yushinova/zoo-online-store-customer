'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  // useRef для хранения кэша между рендерами
  const userCache = useRef({
    data: null,
    timestamp: 0
  });

  useEffect(() => {
    // 1. Загружаем пользователя при монтировании
    loadUserOnMount();
    
    // 2. Настраиваем перехватчик fetch для обработки 401 ошибок
    if (typeof window !== 'undefined') {
      setupFetchInterceptor();
    }
  }, []);

  // Настройка интерцептора fetch
  const setupFetchInterceptor = () => {
    if (typeof window === 'undefined') return;
    
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Проверяем статус 401
      if (response.status === 401) {
        handleFetchUnauthorized(response);
      }
      
      return response;
    };
  };

  // Обработка 401 ошибки из fetch
  const handleFetchUnauthorized = async (response) => {
    try {
      const errorData = await response.clone().json().catch(() => ({}));
      await handleUnauthorized(errorData);
    } catch (error) {
      console.error('Error handling 401:', error);
      await handleUnauthorized();
    }
  };

  // Общая функция для обработки неавторизованного доступа
  const handleUnauthorized = async (errorData = null) => {
    // Очищаем кэш
    userCache.current = { data: null, timestamp: 0 };
    
    // Очищаем на сервере
    try {
      await userService.logout();
    } catch (e) {
      // Игнорируем ошибки logout
    }
    
    // Очищаем локальное состояние
    clearAuth();
    
    // Удаляем куку на клиенте
    document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Редирект на страницу авторизации
    const redirectUrl = errorData?.redirect || '/auth';
    const message = errorData?.message 
      ? `?message=${encodeURIComponent(errorData.message)}`
      : '?message=Сессия%20истекла';
    
    // Ждем немного, чтобы состояние обновилось
    setTimeout(() => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = `${redirectUrl}${message}`;
      }
    }, 100);
  };

  const loadUserOnMount = async () => {
    // Проверяем кэш (5 минут)
    const now = Date.now();
    if (userCache.current.data && (now - userCache.current.timestamp) < 5 * 60 * 1000) {
      setState({
        user: userCache.current.data,
        loading: false,
        isClient: true
      });
      return;
    }

    // Загружаем API-ключ из localStorage
    const savedApiKey = userService.loadApiKeyFromStorage();
    
    if (savedApiKey) {
      userService.setApiKey(savedApiKey);
      await loadUser(savedApiKey);
    } else {
      setState(prev => ({ ...prev, loading: false, isClient: true }));
    }
  };

  const loadUser = async (apiKey) => {
    try {
      const userData = await userService.getUser(apiKey);
      
      // Сохраняем в кэш
      userCache.current = {
        data: userData,
        timestamp: Date.now()
      };
      
      setState({
        user: userData,
        loading: false,
        isClient: true
      });
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        await handleUnauthorized();
      } else {
        console.error('Failed to load user:', error);
        clearAuth();
      }
    }
  };

  const login = async (apiKey) => {
    userService.setApiKey(apiKey);
    await loadUser(apiKey);
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем кэш
      userCache.current = { data: null, timestamp: 0 };
      
      clearAuth();
      window.location.href = '/';
    }
  };

  const clearAuth = () => {
    setState({
      user: null,
      loading: false,
      isClient: true
    });
  };

  const refetch = () => {
    // Очищаем кэш и загружаем заново
    userCache.current = { data: null, timestamp: 0 };
    
    const apiKey = userService.loadApiKeyFromStorage();
    if (apiKey) loadUser(apiKey);
  };

  const contextValue = {
    user: state.isClient ? state.user : null,
    loading: state.isClient ? state.loading : true,
    login,
    logout,
    refetch,
    clearAuth
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);