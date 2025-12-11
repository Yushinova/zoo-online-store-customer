import { API_CONFIG } from '@/config/api';

export class FeedbackService {
  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/feedback`;
  }
  
  async getByProductId(productId) {
    try {
      console.log(`Загрузка отзывов для товара ID: ${productId}`);
      
      const response = await fetch(`${this.baseUrl}/product/${productId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Статус ответа: ${response.status}`);
      
      // Если статус 204 - нет контента (отзывов нет)
      if (response.status === 204) {
        console.log(`Нет отзывов для товара ${productId}`);
        return [];
      }
      
      // Если статус 404 - товар не найден или нет отзывов
      if (response.status === 404) {
        console.log(`Товар ${productId} не найден или нет отзывов`);
        return [];
      }
      
      if (!response.ok) {
        // Пробуем получить текст ошибки
        let errorMessage = `Ошибка HTTP! статус: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.Message || errorData.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Если не удалось прочитать текст ошибки
        }
        console.error(`Ошибка загрузки отзывов: ${errorMessage}`);
        // Возвращаем пустой массив вместо выброса ошибки
        return [];
      }

      const feedbacks = await response.json();
      console.log(`Отзывы успешно загружены для товара ${productId}:`, feedbacks);
      
      // Проверяем, что пришел массив
      if (!Array.isArray(feedbacks)) {
        console.warn('Ожидался массив отзывов, но получено:', typeof feedbacks);
        return [];
      }
      
      return feedbacks;

    } catch (error) {
      console.error(`Ошибка загрузки отзывов для товара ${productId}:`, error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }
  
  // Метод для создания отзыва
  async create(feedbackData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        let errorMessage = `Ошибка HTTP! статус: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.Message || errorData.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Если не удалось прочитать текст ошибки
        }
        throw new Error(errorMessage);
      }

      const createdFeedback = await response.json();
      console.log('Отзыв успешно создан:', createdFeedback);
      
      return createdFeedback;

    } catch (error) {
      console.error('Ошибка создания отзыва:', error);
      throw error;
    }
  }
  async getTopByProductId(productId, page = 1, pageSize = 5) {
    try {
      console.log(`Загрузка топ отзывов для товара ID: ${productId}, страница: ${page}, размер: ${pageSize}`);
      
      // Создаем URL с query параметрами
      const url = new URL(`${this.baseUrl}/product/top/${productId}`);
      url.searchParams.append('page', page);
      url.searchParams.append('pageSize', pageSize);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Статус ответа: ${response.status}`);
      
      // Если статус 204 - нет контента (отзывов нет)
      if (response.status === 204) {
        console.log(`Нет отзывов для товара ${productId}`);
        return [];
      }
      
      // Если статус 404 - товар не найден или нет отзывов
      if (response.status === 404) {
        console.log(`Товар ${productId} не найден или нет отзывов`);
        return [];
      }
      
      if (!response.ok) {
        let errorMessage = `Ошибка HTTP! статус: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.Message || errorData.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Если не удалось прочитать текст ошибки
        }
        console.error(`Ошибка загрузки топ отзывов: ${errorMessage}`);
        return [];
      }

      const feedbacks = await response.json();
      console.log(`Топ отзывы успешно загружены для товара ${productId}:`, feedbacks);
      
      // Проверяем, что пришел массив
      if (!Array.isArray(feedbacks)) {
        console.warn('Ожидался массив отзывов, но получено:', typeof feedbacks);
        return [];
      }
      
      return feedbacks;

    } catch (error) {
      console.error(`Ошибка загрузки топ отзывов для товара ${productId}:`, error);
      return [];
    }
  }  
 
  async checkUserReview(productId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/check/${productId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // ⭐ Токен в куках отправится автоматически
        }
      );

      console.log('Response status:', response.status);
    
        if (!response.ok) {
          // Ошибки авторизации и т.д.
          if (response.status === 401) {
            console.log('User not authenticated');
          }
          setHasExistingReview(false);
          return;
        }
        
        // ⭐ БЕЗОПАСНЫЙ ПАРСИНГ
        let data = null;
        try {
          const text = await response.text();
          console.log('Response text:', text);
          
          if (text && text.trim() !== '') {
            data = JSON.parse(text);
          }
        } catch (parseError) {
          console.log('Empty or invalid JSON response');
        }
        
        console.log('Parsed data:', data);
        
        // Проверяем что получили
        if (data && data.id) {
          // Есть отзыв с ID
          setHasExistingReview(true);
          setContent(data.comment || '');
          setRating(data.rating || 0);
        } else if (data && data.exists === false) {
          // Явно указано что отзыва нет
          setHasExistingReview(false);
        } else if (data === null || data === undefined) {
          // Пустой ответ или null
          setHasExistingReview(false);
        } else {
          // Любой другой случай
          setHasExistingReview(false);
        }
    
      } catch (err) {
        console.error('Network error:', err);
        setHasExistingReview(false);
      } finally {
        setChecking(false);
      }
  }
}

// Экспортируем экземпляр сервиса
export const feedbackService = new FeedbackService();