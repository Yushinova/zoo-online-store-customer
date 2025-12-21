'use client';

import { useState, useEffect } from 'react';
import AddressInput from '@/components/yandex/AddressInput';
import { addressService } from '@/api/addressService';
import { orderService } from '@/api/orderService';
import { clearCart } from '@/utils/cart';
import styles from './CheckoutTab.module.css';

export default function CheckoutTab({ 
  checkoutData, 
  userData, 
  onConfirmOrder, 
  onCancelOrder, 
  userId 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressText, setSelectedAddressText] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Загружаем сохраненные адреса пользователя
  useEffect(() => {
    if (!userId) return;

    const loadAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const addresses = await addressService.getByUserId(userId);
        setUserAddresses(addresses || []);
        
        if (addresses && addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          setSelectedAddressText(addresses[0].fullAddress);
        }
      } catch (error) {
        console.error('Ошибка загрузки адресов:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [userId]);

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Расчет скидки
  const calculateDiscountedPrice = (total) => {
    if (userData.discont > 0) {
      const discount = total * (userData.discont / 100);
      return {
        original: total,
        discounted: total - discount,
        discount: discount
      };
    }
    return {
      original: total,
      discounted: total,
      discount: 0
    };
  };

  // Подготовка данных для OrderRequest
  const prepareOrderData = () => {
    const discountedTotal = userData.discont > 0 
      ? calculateDiscountedPrice(checkoutData.totalAmount).discounted 
      : checkoutData.totalAmount;

    const orderItems = checkoutData.items.map(item => ({
      quantity: item.quantity,
      unitPrice: item.product.price,
      price: item.product.price * item.quantity,
      ProductName: item.product.name,
      productId: item.product.id || 0,
      orderId: 0
    }));

    const orderData = {
      shippingCost: shippingCost,
      amount: discountedTotal + shippingCost,
      status: 'Pending',
      shippingAddress: selectedAddressText,
      userId: userId,
      orderItems: orderItems
    };

    return orderData;
  };

  // Обработчик выбора адреса
  const handleAddressSelect = (addressId, addressText) => {
    setSelectedAddressId(addressId);
    setSelectedAddressText(addressText);
    setUseNewAddress(false);
    calculateShippingCost(addressText);
  };

  // Обработчик выбора нового адреса
  const handleNewAddressSelect = (address) => {
    const addressText = address?.formattedAddress || address || '';
    setNewAddress(addressText);
    setSelectedAddressText(addressText);
    setUseNewAddress(true);
    calculateShippingCost(addressText);
  };

  // Расчет стоимости доставки
  const calculateShippingCost = (address) => {
    if (address && (address.includes('Москва') || address.includes('Санкт-Петербург'))) {
      setShippingCost(300);
    } else {
      setShippingCost(500);
    }
  };

  // Функция для создания платежа через Yandex Pay
  const createYandexPayment = async (orderId, totalAmount) => {
    try {
      const response = await fetch('/api/payment/yandex/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          items: checkoutData.items.map(item => ({
            productId: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            ProductName: item.product.name,
          })),
          totalAmount: totalAmount,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания платежа');
      }

      const data = await response.json();
      return data.paymentUrl;
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      throw error;
    }
  };

  // Обработчик подтверждения заказа
  const handleConfirm = async () => {
    if (!selectedAddressText) {
      alert('Пожалуйста, выберите или введите адрес доставки');
      return;
    }

    if (!confirm('Подтвердить оформление заказа?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = prepareOrderData();
      console.log('Отправка заказа на сервер:', orderData);

      // Создаем заказ в нашей системе
      const createdOrder = await orderService.create(orderData);
      console.log('Заказ успешно создан:', createdOrder);
      
      setCreatedOrder(createdOrder);
      clearCart();
      
      if (onConfirmOrder) {
        await onConfirmOrder(createdOrder);
      }

      alert(`Заказ успешно оформлен! Номер заказа: ${createdOrder.orderNumber || createdOrder.id}`);

    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert(`Ошибка при оформлении заказа: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик оплаты через Yandex Pay
  const handleYandexPayment = async () => {
    if (!createdOrder) {
      alert('Сначала оформите заказ');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Получаем paymentUrl от Yandex Pay
      const paymentUrl = await createYandexPayment(
        createdOrder.id,
        totalWithShipping
      );
      
      // Перенаправляем на страницу оплаты Yandex Pay
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Ошибка при оплате:', error);
      alert(`Ошибка при оплате: ${error.message}`);
      setIsProcessingPayment(false);
    }
  };

  const finalAmount = calculateDiscountedPrice(checkoutData.totalAmount).discounted;
  const discountAmount = calculateDiscountedPrice(checkoutData.totalAmount).discount;
  const totalWithShipping = finalAmount + shippingCost;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Оформление заказа</h3>
        <button onClick={onCancelOrder} className={styles.backButton}>
          ← Вернуться в корзину
        </button>
      </div>

      {/* Информация о покупателе */}
      <div className={styles.userInfo}>
        <div className={styles.infoCard}>
          <h4>Информация о покупателе</h4>
          <p><strong>Имя:</strong> {userData.name || 'Не указано'}</p>
          <p><strong>Телефон:</strong> {userData.phone || 'Не указан'}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          {userData.discont > 0 && (
            <p className={styles.discountBadge}>
              Ваша скидка: {userData.discont}%
            </p>
          )}
        </div>

        <div className={styles.infoCard}>
          <h4>Информация о заказе</h4>
          <p><strong>Товаров:</strong> {checkoutData.totalItems} шт.</p>
          <p><strong>Дата:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
        </div>
      </div>

      {/* Состав заказа */}
      <div className={styles.orderSummary}>
        <h4>Состав заказа:</h4>
        <div className={styles.itemsList}>
          {checkoutData.items.map((item, index) => (
            <div key={index} className={styles.orderItem}>
              <div className={styles.itemImagePlaceholder}>
                {item.product.name?.charAt(0) || 'Т'}
              </div>
              <div className={styles.itemDetails}>
                <h5>{item.product.name}</h5>
                <div className={styles.itemMeta}>
                  <span>Количество: {item.quantity}</span>
                  <span>Цена: {formatPrice(item.product.price)}</span>
                  <span>Сумма: {formatPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Итоговая сумма */}
        <div className={styles.totalSummary}>
          <div className={styles.totalRow}>
            <span>Сумма товаров:</span>
            <span>{formatPrice(checkoutData.totalAmount)}</span>
          </div>
          
          {userData.discont > 0 && (
            <div className={styles.totalRow}>
              <span>Скидка {userData.discont}%:</span>
              <span className={styles.discount}>
                -{formatPrice(discountAmount)}
              </span>
            </div>
          )}

          <div className={styles.totalRow}>
            <span>Стоимость доставки:</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.finalPriceLabel}>Итого к оплате:</span>
            <span className={styles.finalPrice}>
              {formatPrice(totalWithShipping)}
            </span>
          </div>
        </div>
      </div>

      {/* Выбор адреса доставки */}
      <div className={styles.deliverySection}>
        <h4>Выберите адрес доставки:</h4>
        
        {/* Сохраненные адреса */}
        {!loadingAddresses && userAddresses.length > 0 && (
          <div className={styles.savedAddresses}>
            <h5>Ваши сохраненные адреса:</h5>
            <div className={styles.addressesList}>
              {userAddresses.map(address => (
                <div 
                  key={address.id}
                  className={`${styles.addressCard} ${selectedAddressId === address.id && !useNewAddress ? styles.selected : ''}`}
                  onClick={() => handleAddressSelect(address.id, address.fullAddress)}
                >
                  <div className={styles.radio}>
                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={selectedAddressId === address.id && !useNewAddress}
                      onChange={() => handleAddressSelect(address.id, address.fullAddress)}
                    />
                  </div>
                  <div className={styles.addressText}>
                    {address.fullAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Выбор нового адреса */}
        <div className={styles.newAddressSection}>
          <div 
            className={`${styles.addressOption} ${useNewAddress ? styles.selected : ''}`}
            onClick={() => setUseNewAddress(true)}
          >
            <div className={styles.radio}>
              <input
                type="radio"
                name="deliveryAddress"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
              />
            </div>
            <span>Использовать новый адрес</span>
          </div>

          {useNewAddress && (
            <div className={styles.addressInputWrapper}>
              <AddressInput
                onAddressSelect={handleNewAddressSelect}
                placeholder="Введите новый адрес доставки..."
                className={styles.addressInput}
              />
              {newAddress && (
                <div className={styles.selectedAddressPreview}>
                  <p><strong>Выбранный адрес:</strong> {newAddress}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {loadingAddresses && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка ваших адресов...</p>
          </div>
        )}

        {!loadingAddresses && userAddresses.length === 0 && (
          <div className={styles.noAddresses}>
            <p>У вас нет сохраненных адресов. Введите адрес доставки:</p>
            <AddressInput
              onAddressSelect={handleNewAddressSelect}
              placeholder="Введите адрес доставки..."
              className={styles.addressInput}
            />
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className={styles.actionButtons}>
        {!createdOrder ? (
          <>
            <button
              onClick={onCancelOrder}
              className={styles.cancelButton}
              disabled={isProcessing}
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing || !selectedAddressText}
              className={styles.confirmButton}
            >
              {isProcessing ? 'Оформляем заказ...' : `Оформить заказ за ${formatPrice(totalWithShipping)}`}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onCancelOrder}
              className={styles.cancelButton}
              disabled={isProcessingPayment}
            >
              Вернуться в корзину
            </button>
            <button
              onClick={handleYandexPayment}
              disabled={isProcessingPayment}
              className={styles.paymentButton}
            >
              {isProcessingPayment ? 'Подготовка оплаты...' : `Оплатить через Яндекс.Пэй ${formatPrice(totalWithShipping)}`}
            </button>
            <div className={styles.orderCreatedInfo}>
              <p>✅ Заказ #{createdOrder.orderNumber || createdOrder.id} оформлен</p>
              <p className={styles.hint}>Нажмите "Оплатить" для перехода к оплате</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}