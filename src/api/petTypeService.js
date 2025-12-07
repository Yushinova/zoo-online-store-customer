import {API_CONFIG} from '@/config/api'

export class PetTypeService{
     constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/pettype`;
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

      const petTypes = await response.json();
      console.log('Products fetched successfully:', petTypes);
      return petTypes;

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

async getAllWithCategoties(){
    try {
        const response = await fetch(`${this.baseUrl}/categories`, {
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

        const petTypes = await response.json();
        console.log('Products fetched successfully:', petTypes);
        return petTypes;

        } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
        }
    }

}

export const petTypeService = new PetTypeService();