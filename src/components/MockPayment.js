'use client';

import { useState } from 'react';
import styles from './MockPayment.module.css';

export default function MockPayment({ 
  amount, 
  onSuccess, 
  onCancel,
  orderId = null 
}) {
  const [step, setStep] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Тестовые данные карт
  const testCards = [
    { number: '4111 1111 1111 1111', name: 'Visa Test - Успех' },
    { number: '5555 5555 5555 4444', name: 'Mastercard Test - Успех' },
    { number: '4000 0000 0000 0002', name: 'Visa - Отказ банка' },
  ];

  const handleTestCardSelect = (cardNumber) => {
    setCardNumber(cardNumber);
    setCardExpiry('12/25');
    setCardCvv('123');
  };

  const handlePay = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv) {
      setError('Заполните все поля');
      return;
    }

    setProcessing(true);
    setError('');
    
    // Симуляция запроса на сервер
    setTimeout(() => {
      setProcessing(false);
      
      // Проверяем номер тестовой карты
      if (cardNumber.includes('4000 0000 0000 0002')) {
        setError('Банк отказал в проведении операции');
        return;
      }
      
      setStep('success');
      
      // Вызываем коллбэк через 2 секунды
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            success: true,
            amount: amount,
            orderId: orderId || `mock_${Date.now()}`,
            transactionId: `tr_${Date.now()}`,
            timestamp: new Date().toISOString()
          });
        }
      }, 2000);
    }, 2000);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      {/* Шаг 1: Ввод данных карты */}
      {step === 'card' && (
        <div className={styles.paymentForm}>
          <div className={styles.header}>
            <h3>Тестовый платеж</h3>
            <p className={styles.amount}>{formatAmount(amount)}</p>
            {orderId && <p className={styles.orderId}>Заказ №{orderId}</p>}
          </div>
          
          <div className={styles.testCardsSection}>
            <p className={styles.sectionTitle}>Тестовые карты:</p>
            <div className={styles.testCardsList}>
              {testCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleTestCardSelect(card.number)}
                  className={styles.testCardButton}
                >
                  <span className={styles.cardNumber}>{card.number}</span>
                  <span className={styles.cardName}>{card.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label>Номер карты</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className={styles.input}
                maxLength={19}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Срок действия</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="ММ/ГГ"
                  className={styles.input}
                  maxLength={5}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>CVV</label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  className={styles.input}
                  maxLength={3}
                />
              </div>
            </div>
            
            {error && (
              <div className={styles.error}>
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
          
          <div className={styles.buttons}>
            <button 
              onClick={onCancel} 
              className={styles.cancelButton}
              disabled={processing}
            >
              Отмена
            </button>
            
            <button
              onClick={handlePay}
              disabled={processing || !cardNumber || !cardExpiry || !cardCvv}
              className={styles.payButton}
            >
              {processing ? (
                <>
                  <span className={styles.spinner}></span>
                  Обработка...
                </>
              ) : `Оплатить ${formatAmount(amount)}`}
            </button>
          </div>
          
          <div className={styles.disclaimer}>
            <p>💳 <strong>Тестовый режим</strong></p>
            <p>Деньги не списываются. Это имитация платежа для тестирования.</p>
          </div>
        </div>
      )}
      
      {/* Шаг 2: Успешная оплата */}
      {step === 'success' && (
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>✅</div>
          <h3>Платеж успешно завершен!</h3>
          
          <div className={styles.successDetails}>
            <div className={styles.detailRow}>
              <span>Сумма:</span>
              <span className={styles.detailValue}>{formatAmount(amount)}</span>
            </div>
            {orderId && (
              <div className={styles.detailRow}>
                <span>Заказ:</span>
                <span className={styles.detailValue}>№{orderId}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span>Статус:</span>
              <span className={styles.statusSuccess}>Оплачено</span>
            </div>
            <div className={styles.detailRow}>
              <span>Дата:</span>
              <span className={styles.detailValue}>
                {new Date().toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => onSuccess && onSuccess({
              success: true,
              amount: amount,
              orderId: orderId
            })}
            className={styles.continueButton}
          >
            Продолжить
          </button>
          
          <div className={styles.testNote}>
            <p>Это тестовый платеж. Настоящие деньги не списывались.</p>
          </div>
        </div>
      )}
    </div>
  );
}