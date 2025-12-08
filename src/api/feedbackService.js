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
  
  // Метод для подсчета среднего рейтинга
  async getAverageRating(productId) {
    try {
      const feedbacks = await this.getByProductId(productId);
      
      if (!feedbacks || feedbacks.length === 0) {
        return 0;
      }
      
      const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalRating / feedbacks.length;
      
      return parseFloat(averageRating.toFixed(1)); // Округляем до 1 знака после запятой
      
    } catch (error) {
      console.error(`Ошибка расчета среднего рейтинга для товара ${productId}:`, error);
      return 0;
    }
  }
}

// Экспортируем экземпляр сервиса
export const feedbackService = new FeedbackService();