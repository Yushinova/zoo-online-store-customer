import { API_CONFIG } from '@/config/api';
export class AddressService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async getByUserId(userId) {
    try {
      console.log(`Загрузка адресов для юзера ID: ${userId}`);
      
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ADDRESSES.BY_ID(userId)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Статус ответа: ${response.status}`);
      
      //обработка ошибок
      if (response.status === 204) {
        console.log(`Нет адресов для юзера ${userId}`);
        return [];
      }
      
      if (response.status === 404) {
        console.log(`юзер ${userId} не найден или нет адресов`);
        return [];
      }
      
      if (!response.ok) {
        //пробуем получить текст ошибки
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
          //не удалось прочитать текст ошибки
        }
        console.error(`Ошибка загрузки адресов: ${errorMessage}`);
        //пустой массив вместо выброса ошибки
        return [];
      }

      const addresses = await response.json();
      console.log(`адреса успешно загружены для юзера ${userId}:`, addresses);
      
      //проверяем, что пришел массив
      if (!Array.isArray(addresses)) {
        console.warn('Ожидался массив заказов, но получено:', typeof addresses);
        return [];
      }
      
      return addresses;

    } catch (error) {
      console.error(`Ошибка загрузки заказов для юзера ${userId}:`, error);
      return [];
    }
  }
  
  async create(addressData) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ADDRESSES.BASE}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData)
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

      console.log('Адрес добавлен успешно');
      return { success: true, message: 'Адрес добавлен успешно!' };

    } catch (error) {
      console.error('Ошибка создания адреса:', error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      console.log('Deleting address with ID:', id);

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ADDRESSES.BY_ADDRESS_ID(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.Message || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      console.log('address deleted successfully');
      return { success: true, message: 'address deleted successfully' };

    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}
export const addressService = new AddressService();