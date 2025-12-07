import {API_CONFIG} from '@/config/api'

export class CategoryService{
     constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/category`;
  }

  async getAll(){
     try {
      const response = await fetch(this.baseUrl, {
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

      const categories = await response.json();
      console.log('Products fetched successfully:', categories);
      return categories;

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

    async getById(id){
    try {
        const response = await fetch(`${this.baseUrl}/${id}`, {
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

        const category = await response.json();
        console.log('Category fetched successfully:', category);
        return category;

        } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
        }
    }
   
    async getByPetTypeId(id){
    try {
        const response = await fetch(`${this.baseUrl}/pettype/${id}`, {
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

        const categories = await response.json();
        console.log('Category fetched successfully:', categories);
        return categories;

        } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
        }
    }
}
export const categoryService = new CategoryService();