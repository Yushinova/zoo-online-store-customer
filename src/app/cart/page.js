'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  getCartItemsCount,
  getCartTotal 
} from '@/utils/cart';
import { productService } from '@/api/productService';
import { useUser } from '@/app/providers/UserProvider';
import CartItem from '@/components/cart/CartItem';
import styles from './page.module.css';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Загружаем данные корзины
  const loadCartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cart = getCart();
      setTotalItems(getCartItemsCount());
      
      if (cart.length === 0) {
        setCartItems([]);
        setTotalAmount(0);
        return;
      }

      // Загружаем детали всех товаров в корзине
      const itemsWithDetails = await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await productService.getByIdWithAllInfo(item.productId);
            return {
              ...item,
              product: {
                ...product,
                id: product.id || item.productId,
                name: product.name || `Товар ${item.productId}`,
                description: product.description || '',
                price: product.price || 0,
                brand: product.brand || '',
                rating: product.rating || 0,
                isPromotion: product.isPromotion || false,
                isActive: product.isActive !== undefined ? product.isActive : true,
                productImages: product.productImages || [],
                petTypes: product.petTypes || []
              }
            };
          } catch (err) {
            console.error(`Error loading product ${item.productId}:`, err);
            return {
              ...item,
              product: {
                id: item.productId,
                name: `Товар ${item.productId} (недоступен)`,
                description: 'Товар временно недоступен',
                price: 0,
                brand: '',
                rating: 0,
                isPromotion: false,
                isActive: false,
                productImages: [],
                petTypes: []
              }
            };
          }
        })
      );

      setCartItems(itemsWithDetails);
      calculateTotal(itemsWithDetails);
      
    } catch (error) {
      console.error('Error loading cart data:', error);
      setError('Не удалось загрузить данные корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartData();
    
    window.addEventListener('cartUpdated', loadCartData);
    
    return () => {
      window.removeEventListener('cartUpdated', loadCartData);
    };
  }, [loadCartData]);

  // Расчет общей суммы
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    setTotalAmount(total);
  };

  // Обработчик оформления заказа
  const handleCheckout = async () => {
    if (userLoading) return;
    
    if (!user) {
      // Пользователь не авторизован - перенаправляем на страницу входа
      // Можно сохранить текущий URL для возврата после авторизации
      const returnUrl = encodeURIComponent('/cart');
      router.push(`/auth`);
      return;
    }

    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Подготавливаем данные для передачи
      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            productImages: item.product.productImages
          }
        })),
        totalAmount,
        totalItems,
        timestamp: new Date().toISOString()
      };

      // Сохраняем данные в sessionStorage для передачи на следующую страницу
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      // Альтернативно, можно использовать параметры URL для небольших данных
      // const queryString = `?items=${encodeURIComponent(JSON.stringify(checkoutData.items))}&total=${totalAmount}`;
      
      // Переходим на страницу оформления заказа
      router.push('/personal');

    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Произошла ошибка при оформлении заказа');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Обработчик изменения количества
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      updateCartItemQuantity(productId, newQuantity);
      
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        calculateTotal(updatedItems);
        setTotalItems(getCartItemsCount());
        return updatedItems;
      });
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Ошибка при обновлении количества');
    }
  };

  // Удаление товара из корзины
  const handleRemoveItem = (productId) => {
    if (confirm('Удалить товар из корзины?')) {
      removeFromCart(productId);
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.productId !== productId);
        calculateTotal(updatedItems);
        setTotalItems(getCartItemsCount());
        return updatedItems;
      });
      
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Очистка корзины
  const handleClearCart = () => {
    if (confirm('Очистить всю корзину?')) {
      clearCart();
      setCartItems([]);
      setTotalAmount(0);
      setTotalItems(0);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Отображаем текст кнопки в зависимости от состояния
  const getCheckoutButtonText = () => {
    if (checkoutLoading) return 'Загрузка...';
    if (!user) return 'Войти для оформления';
    return 'Перейти к оформлению';
  };

  if (loading || userLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загружаем корзину...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={loadCartData} className={styles.retryButton}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Корзина покупок</h1>
        <div className={styles.cartStats}>
          <span>Товаров: {totalItems}</span>
          <button 
            onClick={handleClearCart}
            disabled={cartItems.length === 0}
            className={styles.clearButton}
          >
            Очистить корзину
          </button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары из каталога, чтобы продолжить покупки</p>
          <Link href="/" className={styles.shopButton}>
            Перейти к покупкам
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartContent}>
            {/* Список товаров */}
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.productId}
                  product={item.product}
                  initialQuantity={item.quantity}
                  onQuantityChange={(productId, quantity) => 
                    handleQuantityChange(productId, quantity)
                  }
                  onRemove={() => handleRemoveItem(item.productId)}
                />
              ))}
            </div>

            {/* Боковая панель с итогами */}
            <div className={styles.sidebar}>
              <div className={styles.summary}>
                <h3>Ваш заказ</h3>
                
                <div className={styles.summaryRow}>
                  <span>Товары ({totalItems} шт.)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Доставка</span>
                  <span>Рассчитывается при оформлении</span>
                </div>
                
                <div className={styles.summaryTotal}>
                  <span>Итого</span>
                  <span className={styles.totalPrice}>{formatPrice(totalAmount)}</span>
                </div>

                <button 
                  className={`${styles.checkoutButton} ${!user ? styles.checkoutButtonDisabled : ''}`}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || checkoutLoading || !user}
                >
                  {getCheckoutButtonText()}
                </button>

                {!user && (
                  <div className={styles.authWarning}>
                    <p>Для оформления заказа необходимо войти в систему</p>
                    <Link href="/auth" className={styles.loginLink}>
                      Войти в аккаунт
                    </Link>
                  </div>
                )}

                <div className={styles.promoSection}>
                  <input
                    type="text"
                    placeholder="Промокод"
                    className={styles.promoInput}
                  />
                  <button className={styles.promoButton}>Применить</button>
                </div>

                <div className={styles.continueShopping}>
                  <Link href="/">← Продолжить покупки</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Мобильная версия итогов */}
          <div className={styles.mobileSummary}>
            <div className={styles.mobileTotal}>
              <span>Итого: {formatPrice(totalAmount)}</span>
              <button 
                className={`${styles.mobileCheckout} ${!user ? styles.mobileCheckoutDisabled : ''}`}
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || checkoutLoading || !user}
              >
                {getCheckoutButtonText()}
              </button>
            </div>
            {!user && (
              <div className={styles.mobileAuthWarning}>
                <p>Для оформления заказа необходимо войти</p>
                <Link href="/login" className={styles.mobileLoginLink}>
                  Войти
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
