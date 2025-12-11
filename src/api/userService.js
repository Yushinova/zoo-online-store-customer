import { API_CONFIG } from '@/config/api';
import { UserResponse } from '@/models/user';

export class UserService {
  constructor() {
    this.apiKey = null;
    this.currentUser = null; // Только в памяти
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('apiKey', apiKey); // ⭐ Только API ключ
    }
  }

  // ⭐ УБИРАЕМ localStorage! Данные только в памяти
  setCurrentUser(user) {
    this.currentUser = user;
    // НИКАКОГО localStorage.setItem('userData', ...)
  }

  async register(userData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USER.REGISTER}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiKey = await response.text();
      this.setApiKey(apiKey);
      
      return apiKey;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async login(loginData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USER.LOGIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiKey = await response.text();
      this.setApiKey(apiKey);
      
      return apiKey;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  async getUser(apiKey) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USER.GET}`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const userResponseData = await response.json();
      const userResponse = new UserResponse();
      Object.assign(userResponse, userResponseData);
      
      this.setCurrentUser(userResponse); // ⭐ Только в памяти
      
      return userResponse;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  // ⭐ УБИРАЕМ loadFromStorage - не восстанавливаем user данные
  // Восстанавливаем только apiKey
  loadApiKeyFromStorage() {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('apiKey');
    }
    return null;
  }

  async logout() {
    this.apiKey = null;
    this.currentUser = null; // ⭐ Очищаем память

    try {
      // Вызываем logout на бэкенде чтобы удалить cookies
      await fetch(`${API_CONFIG.BASE_URL}/api/user/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Backend logout error:', error);
    } finally {
      // Очищаем фронтенд в любом случае
      this.apiKey = null;
      this.currentUser = null;
      
      // ⭐ УБИРАЕМ localStorage.removeItem('userData');
      
      // Очищаем sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('apiKey');
      }
      
      // Удаляем cookies на фронтенде
      document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}

export const userService = new UserService();

// ⭐ УБИРАЕМ userService.loadFromStorage();
// Восстанавливаем только apiKey при необходимости
const savedApiKey = userService.loadApiKeyFromStorage();
if (savedApiKey) {
  userService.setApiKey(savedApiKey);
  // НЕ загружаем user автоматически - пусть компоненты делают это когда нужно
}