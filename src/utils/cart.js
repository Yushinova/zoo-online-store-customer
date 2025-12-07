const CART_KEY = 'pet_shop_cart';

// Функция для отправки события обновления корзины
const dispatchCartUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Также отправляем storage event для других вкладок
    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_KEY,
      newValue: localStorage.getItem(CART_KEY)
    }));
  }
};

// Получить корзину из localStorage
export const getCart = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

// Сохранить корзину в localStorage
const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    dispatchCartUpdateEvent(); // Отправляем событие
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Добавить товар в корзину
export const addToCart = (productId, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    // Увеличиваем количество, если товар уже в корзине
    existingItem.quantity += quantity;
  } else {
    // Добавляем новый товар
    cart.push({
      productId,
      quantity,
      addedAt: new Date().toISOString()
    });
  }
  
  saveCart(cart);
  return cart;
};

// Удалить товар из корзины
export const removeFromCart = (productId) => {
  const cart = getCart();
  const newCart = cart.filter(item => item.productId !== productId);
  saveCart(newCart);
  return newCart;
};

// Изменить количество товара
export const updateCartItemQuantity = (productId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity = quantity;
    saveCart(cart);
  }
  
  return cart;
};

// Очистить корзину
export const clearCart = () => {
  saveCart([]);
  return [];
};

// Получить общее количество товаров в корзине
export const getCartItemsCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Получить массив ID товаров в корзине
export const getCartProductIds = () => {
  const cart = getCart();
  return cart.map(item => item.productId);
};

// Проверить, есть ли товар в корзине
export const isInCart = (productId) => {
  const cart = getCart();
  return cart.some(item => item.productId === productId);
};

// Получить количество конкретного товара в корзине
export const getCartItemQuantity = (productId) => {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  return item ? item.quantity : 0;
};

// Получить все данные корзины
export const getCartWithDetails = async () => {
  const cart = getCart();
  
  // Здесь можно добавить загрузку деталей товаров по ID
  // из API или другого источника данных
  const cartWithDetails = await Promise.all(
    cart.map(async (item) => {
      try {
        // Пример загрузки данных товара
        // const response = await fetch(`/api/products/${item.productId}`);
        // const productData = await response.json();
        
        return {
          ...item,
          // product: productData
        };
      } catch (error) {
        console.error(`Error loading product ${item.productId}:`, error);
        return item;
      }
    })
  );
  
  return cartWithDetails;
};

// Получить общую сумму корзины
export const getCartTotal = async () => {
  const cart = getCart();
  
  // Здесь нужно будет загрузить цены товаров
  // Для примера возвращаем 0
  return 0;
};