import { API_CONFIG } from '@/config/api';
export class OrderService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async getByUserId(userId) {
    try {
      console.log(`Загрузка заказов для юзера ID: ${userId}`);
      console.log(`🔗 URL: ${this.baseUrl}${API_CONFIG.ORDERS.BY_ID(userId)}`);
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ORDERS.BY_ID(userId)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Статус ответа: ${response.status}`);
      
      if (response.status === 204) {
        console.log(`Нет заказов для юзера ${userId}`);
        return [];
      }
      
      if (response.status === 404) {
        console.log(`юзер ${userId} не найден или нет заказов`);
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
        return [];
      }

      const orders = await response.json();
      console.log(`заказы успешно загружены для юзера ${userId}:`, orders);
      
      if (!Array.isArray(orders)) {
        console.warn('Ожидался массив заказов, но получено:', typeof orders);
        return [];
      }
      
      return orders;

    } catch (error) {
      console.error(`Ошибка загрузки заказов для юзера ${userId}:`, error);
      return [];
    }
  }

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
  
  async updateOrderById(orderId, updateData) {
    try {

      console.log('🔄 Updating order:', orderId, updateData);

      const response = await fetch(
        `${this.baseUrl}/api/order/admin/${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
      }

      const updatedOrder = await response.json();
      console.log('✅ Order updated successfully:', updatedOrder);
      return updatedOrder;

    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
}
export const orderService = new OrderService();