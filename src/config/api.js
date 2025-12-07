export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  YC_URL: process.env.NEXT_PUBLIC_YC_PUBLIC_URL,
  YC_BACKET: process.env.NEXT_PUBLIC_YC_BUCKET_NAME,
  
 USER: {
    LOGIN: '/api/admin/login',
    REGISTER: '/api/admin/register',
    AUTH: '/api/auth/admin',
    GET: `/api/admin`
  },
  
  ORDERS: {
    BY_ID: (id) => `/api/orders/${id}`,
    UPDATE: (id) => `/api/order/admin/${id}`,
    GET_SORTED: (page, pageSize) => `/api/order/admin?page=${page}&pageSize=${pageSize}`
  },
  
  PRODUCTS: {
    BASE: '/api/product',
    PRODUCT_CREATE: '/api/product',
    BY_ID: (id) => `/api/product/${id}`,
    GET_FILTERED: (params) => {
      const queryString = new URLSearchParams();
      
      // Добавляем только те параметры, которые не null/undefined
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryString.append(key, params[key]);
        }
      });
      
      return `/api/products?${queryString.toString()}`;
    },

  },
  
  CATEGORIES: {
    BASE: '/api/category',
  },
  
  PET_TYPES: {
    BASE: '/api/pettype',
  }
};