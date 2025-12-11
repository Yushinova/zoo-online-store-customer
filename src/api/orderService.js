import { API_CONFIG } from '@/config/api';
export class OrderService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async getByUserId(userId) {
    try {
      console.log(`Загрузка заказов для юзера ID: ${userId}`);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ORDERS.BY_ID(userId)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Статус ответа: ${response.status}`);
      
      // Если статус 204 - нет контента (заказов нет)
      if (response.status === 204) {
        console.log(`Нет заказов для юзера ${userId}`);
        return [];
      }
      
      // Если статус 404 - юзер не найден или нет заказов
      if (response.status === 404) {
        console.log(`юзер ${userId} не найден или нет заказов`);
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

      const orders = await response.json();
      console.log(`заказы успешно загружены для юзера ${userId}:`, orders);
      
      // Проверяем, что пришел массив
      if (!Array.isArray(orders)) {
        console.warn('Ожидался массив заказов, но получено:', typeof orders);
        return [];
      }
      
      return orders;

    } catch (error) {
      console.error(`Ошибка загрузки заказов для юзера ${userId}:`, error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }
  
  // Метод для создания заказа
  async create(orderData) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ORDERS.CREATE}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
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

      const createdOrder = await response.json();
      console.log('Отзыв успешно создан:', createdOrder);
      
      return createdOrder;

    } catch (error) {
      console.error('Ошибка создания отзыва:', error);
      throw error;
    }
  }
}
export const orderService = new OrderService();