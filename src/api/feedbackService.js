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
      
      if (response.status === 204) {
        console.log(`Нет отзывов для товара ${productId}`);
        return [];
      }
      
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

        }
        console.error(`Ошибка загрузки отзывов: ${errorMessage}`);
        //возвращаем пустой массив вместо выброса ошибки
        return [];
      }

      const feedbacks = await response.json();
      console.log(`Отзывы успешно загружены для товара ${productId}:`, feedbacks);
      
      if (!Array.isArray(feedbacks)) {
        console.warn('Ожидался массив отзывов, но получено:', typeof feedbacks);
        return [];
      }
      
      return feedbacks;

    } catch (error) {
      console.error(`Ошибка загрузки отзывов для товара ${productId}:`, error);
      return [];
    }
  }

  //проверка есть ли уже отзыв на данный товар
  async checkUserFeedback(productId) {
    try {
      const res = await fetch(`${this.baseUrl}/check/${productId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.status === 401) {
        return { exists: false, isAuth: false };
      }

      if (res.status === 200) {
        const data = await res.json();
        
        //если есть id - это отзыв, если message - отзыва нет
        return data.id 
          ? { exists: true, feedback: data, isAuth: true }
          : { exists: false, isAuth: true, message: data.message };
      }

      console.error('Ошибка проверки:', res.status);
      return { exists: false, isAuth: true };

    } catch (error) {
      console.error('Ошибка:', error);
      return { exists: false, isAuth: false };
    }
  }

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
      
      //создаем URL с query параметрами
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
      
      if (response.status === 204) {
        console.log(`Нет отзывов для товара ${productId}`);
        return [];
      }
      
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

        }
        console.error(`Ошибка загрузки топ отзывов: ${errorMessage}`);
        return [];
      }

      const feedbacks = await response.json();
      console.log(`Топ отзывы успешно загружены для товара ${productId}:`, feedbacks);
      
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
 
  
}

export const feedbackService = new FeedbackService();