'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers/UserProvider';
import UserAddresses from '@/components/address/UserAddresses';
import CheckoutTab from '@/components/checkout/CheckoutTab';
import OrdersTab from '@/components/orders/OrdersTab';
import styles from './page.module.css';
import Link from 'next/link';

export default function PersonalPage() {
  const router = useRouter();
  const { user, loading, logout } = useUser();
  const [checkoutData, setCheckoutData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    id: 0,
    phone: '',
    email: '',
    name: '',
    discont: 0,
    totalOrders: 0
  });
  
  const [ymaps3, setYmaps3] = useState(null);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const [ymapsError, setYmapsError] = useState(null);

  // Загружаем Yandex Maps API
  useEffect(() => {
    if (window.ymaps3) {
      console.log('✅ ymaps3 уже загружен');
      setYmaps3(window.ymaps3);
      setYmapsLoading(false);
      return;
    }

    console.log('🔄 Загружаем ymaps3...');
    
    // Проверяем, не загружается ли уже скрипт
    if (document.getElementById('yandex-maps-api')) {
      console.log('📦 Скрипт уже загружается...');
      return;
    }

    const script = document.createElement('script');
    script.id = 'yandex-maps-api';
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Скрипт ymaps3 загружен');
      
      // Проверяем доступность suggest через небольшой таймаут
      setTimeout(() => {
        if (window.ymaps3?.suggest) {
          console.log('✅ ymaps3.suggest доступен');
          setYmaps3(window.ymaps3);
          setYmapsLoading(false);
        } else {
          console.error('❌ ymaps3.suggest не найден');
          setYmapsError('Сервис подсказок недоступен');
          setYmapsLoading(false);
        }
      }, 1000);
    };
    
    script.onerror = (error) => {
      console.error('❌ Ошибка загрузки ymaps3:', error);
      setYmapsError('Не удалось загрузить карты');
      setYmapsLoading(false);
    };

    document.head.appendChild(script);

    // Очистка при размонтировании
    return () => {
      const existingScript = document.getElementById('yandex-maps-api');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    // Проверяем авторизацию
    if (!loading && !user) {
      router.push('/login?returnUrl=/personal');
      return;
    }

    // Загружаем данные пользователя
    if (user) {
      setUserData({
        id: user.id,
        phone: user.phone || '',
        email: user.email || '',
        name: user.name || '',
        discont: user.discont || 0,
        totalOrders: user.totalOrders || 0
      });
    }

    // Получаем данные из sessionStorage
    const savedData = sessionStorage.getItem('checkoutData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCheckoutData(parsedData);
        setActiveTab('checkout');
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    }
  }, [user, loading, router]);

  const handleConfirmOrder = async (orderData) => {
    if (!orderData || !user) return;
    
    setIsProcessing(true);
      try {
        console.log('Подтверждение заказа с данными:', orderData);
        
        // Очищаем данные после успешного оформления
        sessionStorage.removeItem('checkoutData');
        setCheckoutData(null);
        
        // Переключаем на вкладку заказов
        setActiveTab('orders');
        
        // Можно показать уведомление или редирект
        // alert('Заказ успешно оформлен!');
        
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setIsProcessing(false);
        }
      };

        const handleCancelOrder = () => {
        if (confirm('Отменить оформление заказа и вернуться в корзину?')) {
            sessionStorage.removeItem('checkoutData');
            setCheckoutData(null);
            router.push('/cart'); // Переход на страницу корзины
        }
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Хедер с информацией пользователя */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'П'}
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.userName}>
              {userData.name || 'Пользователь'}
            </h2>
            <p className={styles.userEmail}>{userData.email}</p>
            {userData.phone && (
              <p className={styles.userPhone}>{userData.phone}</p>
            )}
            <div className={styles.userStats}>
              <span className={styles.statItem}>
                Заказов: <strong>{userData.totalOrders}</strong>
              </span>
              {userData.discont > 0 && (
                <span className={styles.statItem}>
                  Скидка: <strong>{userData.discont}%</strong>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
            <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
            </button>
            <Link href="/" className={styles.homeButton}>
            Главная
            </Link>
       </div>
      </header>

      {/* Навигационные вкладки */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'address' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Адрес доставки
        </button>
        {checkoutData && (
          <button
            className={`${styles.tab} ${activeTab === 'checkout' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('checkout')}
          >
            Оформление заказа
            <span className={styles.badge}>Новый</span>
          </button>
        )}
      </nav>

      {/* Содержимое вкладок */}
      <main className={styles.content}>
        {/* Вкладка "Профиль" */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Личные данные</h3>
            <div className={styles.profileInfo}>
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ID:</span>
                  <span className={styles.infoValue}>{userData.id}</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Имя:</span>
                  <span className={styles.infoValue}>
                    {userData.name || 'Не указано'}
                  </span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{userData.email}</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Телефон:</span>
                  <span className={styles.infoValue}>
                    {userData.phone || 'Не указан'}
                  </span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Количество заказов:</span>
                  <span className={styles.infoValue}>{userData.totalOrders}</span>
                </div>
              </div>

              {userData.discont > 0 && (
                <div className={styles.infoCard}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Ваша скидка:</span>
                    <span className={styles.infoValueHighlight}>
                      {userData.discont}%
                    </span>
                  </div>
                  <p className={styles.discountInfo}>
                    Скидка применяется ко всем вашим заказам
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/*Orders*/}
        {activeTab === 'orders' && user && (
        <div className={styles.tabContent}>
            <OrdersTab userId={user.id} />
        </div>
        )}
        {/* Вкладка "Адрес доставки" */}
        {activeTab === 'address' && (
        <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>Адрес доставки</h3>
            
            <div className={styles.addressSection}>
            <p className={styles.addressHint}>
                Управляйте вашими сохраненными адресами доставки
            </p>
            
            {/* Передаем числовой id, а не uuid */}
            {user && user.id && (
                <UserAddresses userId={user.id} />
            )}
            
            {/* Если у юзера нет id (например, еще не загрузился) */}
            {user && !user.id && (
                <div className={styles.errorMessage}>
                Не удалось загрузить ID пользователя. Пожалуйста, обновите страницу.
                </div>
            )}
            
            {/* Блок с инструкцией для оформления заказа */}
            <div className={styles.deliveryInstructions}>
                <h4>Как использовать адреса при оформлении заказа:</h4>
                <ul className={styles.instructionsList}>
                <li>✅ Сохраните часто используемые адреса заранее</li>
                <li>✅ При оформлении заказа выберите сохраненный адрес</li>
                <li>✅ Или введите новый адрес при оформлении</li>
                <li>✅ Адреса сохраняются в вашем профиле</li>
                </ul>
            </div>
            </div>
        </div>
        )}

       
        {/* Вкладка "Оформление заказа" */}
        {activeTab === 'checkout' && checkoutData && user && (
        <div className={styles.tabContent}>
            <CheckoutTab
            checkoutData={checkoutData}
            userData={userData}
            userId={user.id}
            onConfirmOrder={handleConfirmOrder}
            onCancelOrder={handleCancelOrder}
            />
        </div>
        )}
      </main>
    </div>
  );
}