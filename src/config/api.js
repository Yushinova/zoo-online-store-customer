export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  YC_URL: process.env.NEXT_PUBLIC_YC_PUBLIC_URL,
  YC_BACKET: process.env.NEXT_PUBLIC_YC_BUCKET_NAME,

  // 🔥 ДОБАВЛЯЕМ Яндекс Pay конфигурацию
  YANDEX_PAY: {
    MERCHANT_ID: '12f269a5-7f17-4fe5-b0b1-7663ee6dc8fd', // Ваш тестовый ID
    SANDBOX_URL: 'https://sandbox.pay.yandex.ru',
    PRODUCTION_URL: 'https://pay.yandex.ru',
    
    // Эндпоинты для работы с платежами
    CREATE_PAYMENT: '/api/payment/yandex/create',
    VERIFY_PAYMENT: '/api/payment/yandex/verify',
    CHECK_STATUS: (paymentId) => `/api/payment/yandex/status/${paymentId}`,
    
    // URL возврата (используем вашу переменную BASE_URL)
    RETURN_URL: (orderId) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${baseUrl}/payment/success?order=${orderId}`;
    },
    
    // Тестовые данные
    TEST_CARDS: {
      VISA_SUCCESS: '4444 4444 4444 4448',
      MASTERCARD_SUCCESS: '5555 5555 5555 4444',
      DECLINED: '4444 4444 4444 0002'
    }
  },

  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    AUTH: '/api/auth/user',
    GET: `/api/user`
  },
  
  ORDERS: {
    BY_ID: (id) => `/api/order/user/${id}`,
    CREATE: `/api/order/user`,
    
    // 🔥 ДОБАВЛЯЕМ связь с платежами
    UPDATE_STATUS: (orderId, status) => `/api/order/${orderId}/status?status=${status}`,
    GET_WITH_PAYMENT: (orderId) => `/api/order/${orderId}/with-payment`
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