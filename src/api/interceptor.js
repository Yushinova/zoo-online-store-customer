import { userService } from '@/api/userService';

class ApiInterceptor {
  constructor() {
    this.init();
  }

  init() {
    // Сохраняем оригинальный fetch
    const originalFetch = window.fetch;

    // Переопределяем fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Если получили 401 ошибку
      if (response.status === 401) {
        // Пытаемся получить JSON с сообщением об ошибке
        try {
          const errorData = await response.clone().json();
          
          // Если это наша кастомная ошибка с редиректом
          if (errorData.error === 'unauthorized' && errorData.redirect) {
            await this.handleUnauthorized(errorData);
            return response; // Возвращаем оригинальный response
          }
        } catch (e) {
          // Если не удалось распарсить JSON
          console.warn('Не удалось обработать 401 ошибку:', e);
        }
        
        // Для обычных 401 ошибок
        await this.handleUnauthorized();
      }
      
      return response;
    };
  }

  async handleUnauthorized(errorData = null) {
    // Очищаем авторизацию
    await userService.logout();
    
    // Удаляем куку на клиенте
    document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Перенаправляем на страницу авторизации
    const redirectUrl = errorData?.redirect || '/auth';
    const message = errorData?.message 
      ? `?message=${encodeURIComponent(errorData.message)}`
      : '';
    
    window.location.href = `${redirectUrl}${message}`;
  }
}

// Экспортируем синглтон
export const apiInterceptor = new ApiInterceptor();