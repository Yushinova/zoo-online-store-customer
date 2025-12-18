'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function YandexPayOfficial({ amount = '15980.00', orderId = 'test123' }) {
  const buttonContainerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Функция которая вызывается после загрузки SDK
  window.onYaPayLoad = function() {
    console.log('✅ Яндекс Pay SDK загружен');
    const YaPay = window.YaPay;
    
    if (!YaPay) {
      console.error('YaPay не найден в window');
      return;
    }
    
    // Данные платежа как в документации
    const paymentData = {
      env: YaPay.PaymentEnv.Sandbox, // Sandbox для тестов
      version: 4,
      currencyCode: YaPay.CurrencyCode.Rub,
      merchantId: '12f269a5-7f17-4fe5-b0b1-7663ee6dc8fd', // ТВОЙ ID
      totalAmount: amount,
      orderId: orderId,
      availablePaymentMethods: ['CARD', 'SPLIT'],
    };
    
    // Обработчик клика по кнопке
    async function onPayButtonClick() {
      console.log('Клик по кнопке Яндекс Pay');
      
      try {
        // 1. Создаем заказ на твоем бэкенде
        const response = await fetch('/api/payment/yandex/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            orderId: orderId,
            merchantId: paymentData.merchantId
          })
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
          // Возвращаем URL для оплаты
          return data.paymentUrl; // Должен быть вида 'https://pay.ya.ru/l/XXXXXX'
        } else {
          throw new Error('Не удалось получить paymentUrl');
        }
      } catch (error) {
        console.error('Ошибка создания заказа:', error);
        throw error;
      }
    }
    
    // Обработчик ошибок
    function onFormOpenError(reason) {
      console.error(`Ошибка Яндекс Pay: ${reason}`);
      alert(`Яндекс Pay временно недоступен: ${reason}`);
    }
    
    // Создаем платежную сессию
    YaPay.createSession(paymentData, {
      onPayButtonClick: onPayButtonClick,
      onFormOpenError: onFormOpenError,
    })
      .then(function(paymentSession) {
        console.log('✅ Платежная сессия создана');
        
        // Показываем кнопку Яндекс Pay
        if (buttonContainerRef.current) {
          paymentSession.mountButton(buttonContainerRef.current, {
            type: YaPay.ButtonType.Pay,
            theme: YaPay.ButtonTheme.Black,
            width: YaPay.ButtonWidth.Auto,
          });
          setIsLoaded(true);
        }
      })
      .catch(function(err) {
        console.error('❌ Ошибка создания сессии:', err);
        setIsLoaded(false);
      });
  };
  
  // Проверяем если SDK уже загружен
  useEffect(() => {
    if (window.YaPay && !isLoaded) {
      window.onYaPayLoad();
    }
  }, [isLoaded]);
  
  return (
    <div>
      {/* Подключаем SDK Яндекс Pay */}
      <Script
        src="https://pay.yandex.ru/sdk/v1/pay.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('SDK загружен, вызываем onYaPayLoad');
          if (window.onYaPayLoad) {
            window.onYaPayLoad();
          }
        }}
        onError={(e) => {
          console.error('Ошибка загрузки SDK Яндекс Pay:', e);
        }}
      />
      
      {/* Контейнер для кнопки Яндекс Pay */}
      <div ref={buttonContainerRef} className="yandex-pay-container">
        {!isLoaded && (
          <div className="loading-placeholder">
            Загрузка Яндекс Pay...
          </div>
        )}
      </div>
      
      {/* Информация о тестовом режиме */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Тестовый режим (Sandbox)</strong><br/>
          Для оплаты используйте тестовые карты Яндекс Pay
        </p>
      </div>
    </div>
  );
}