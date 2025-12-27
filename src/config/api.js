export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  YC_URL: process.env.NEXT_PUBLIC_YC_PUBLIC_URL,
  YC_BACKET: process.env.NEXT_PUBLIC_YC_BUCKET_NAME,

  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    AUTH: '/api/auth/user',
    GET: `/api/user`
  },
  
  ORDERS: {
    BY_ID: (id) => `/api/order/user/${id}`,
    CREATE: `/api/order/user`
  },
  
  PRODUCTS: {
    BASE: '/api/product',
    PRODUCT_CREATE: '/api/product',
    BY_ID: (id) => `/api/product/${id}`,
    GET_FILTERED: (params) => {
      const queryString = new URLSearchParams();
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
  },

  ADDRESSES: {
    BASE: '/api/address',
    BY_ID: (id) => `/api/address/${id}`,
    BY_ADDRESS_ID: (id) => `/api/address/${id}`
  }
};