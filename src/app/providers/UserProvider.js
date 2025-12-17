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
    // 1. Загружаем пользователя
    const savedApiKey = userService.loadApiKeyFromStorage();
    
    if (savedApiKey) {
      userService.setApiKey(savedApiKey);
      loadUser(savedApiKey);
    } else {
      setState(prev => ({ ...prev, loading: false, isClient: true }));
    }

    // 2. Настраиваем перехватчик fetch для обработки 401 ошибок
    if (typeof window !== 'undefined') {
      setupFetchInterceptor();
    }
  }, []);

  // Настройка интерцептора fetch
  const setupFetchInterceptor = () => {
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
      // Пытаемся получить данные ошибки
      const errorData = await response.clone().json().catch(() => ({}));
      
      // Вызываем общую функцию очистки
      await handleUnauthorized(errorData);
    } catch (error) {
      console.error('Error handling 401:', error);
      // Если не получилось распарсить JSON, все равно очищаем
      await handleUnauthorized();
    }
  };

  const loadUser = async (apiKey) => {
    try {
      const userData = await userService.getUser(apiKey);
      setState({
        user: userData,
        loading: false,
        isClient: true
      });
    } catch (error) {
      // Проверяем 401 ошибку
      if (error?.status === 401 || error?.response?.status === 401) {
        await handleUnauthorized();
      } else {
        console.error('Failed to load user:', error);
        clearAuth();
      }
    }
  };

  // Общая функция для обработки неавторизованного доступа
  const handleUnauthorized = async (errorData = null) => {
    // Очищаем на сервере (если есть API для logout)
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