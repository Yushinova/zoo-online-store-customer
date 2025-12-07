import {ProductQueryParameters} from "@/models/product";
import { API_CONFIG } from '@/config/api';

export class ProductService {
  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/product`;
  }

  //GET /api/product-получить все продукты с фильтрами и пагинацией
  async getAllWithFilterAndPagination(parameters = new ProductQueryParameters()) {
    try {
      //cтроим query string из параметров
      const queryParams = new URLSearchParams();
      
      Object.keys(parameters).forEach(key => {
        if (parameters[key] !== null && parameters[key] !== undefined) {
          queryParams.append(key, parameters[key]);
        }
      });

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      console.log('Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
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

      const products = await response.json();
      console.log('Products fetched successfully:', products);
      return products;

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  //GET /api/product/{id} -получить продукт по ID
  async getByIdWithAllInfo(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
        }
        if (response.status === 204) {
        throw new Error('Product not found');
      }
      const product = await response.json();
      console.log('Product fetched successfully:', product);
      return product;

    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  //методы для работы с параметрами запроса
  createQueryParameters(params = {}) {
    const queryParams = new ProductQueryParameters();
    return { ...queryParams, ...params };
  }

}

export const productService = new ProductService();