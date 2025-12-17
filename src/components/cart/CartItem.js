'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/config/api';
import styles from './CartItem.module.css';

const YANDEX_CLOUD_BASE_URL = API_CONFIG.YC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = API_CONFIG.YC_BACKET || 'backet-online-storage';

const CartItem = ({ 
  product, 
  initialQuantity = 1,
  onQuantityChange,
  onRemove
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [imageError, setImageError] = useState(false);
  
  // Получаем URL изображения или заглушку - ТАК ЖЕ КАК В ProductCard
  const getImageUrl = () => {
    if (!product.productImages || product.productImages.length === 0) {
      return '/notimage.jpeg';
    }
    
    const firstImage = product.productImages[0];
    // Используем imageName или imageUrl в зависимости от того, что есть
    const imageName = firstImage.imageName || firstImage.imageUrl;
    
    if (!imageName) {
      return '/notimage.jpeg';
    }
    
    return `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${imageName}` || '/notimage.jpeg';
  };

  const imageUrl = getImageUrl();

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(product.id, newQuantity);
    }
  };
  
  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(product.id, newQuantity);
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(product.id);
    }
  };
  
  // Форматируем цену
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.cartItem}>
      {/* Контейнер изображения - ТАК ЖЕ КАК В ProductCard */}
      <div className={styles.imageContainer}>
        <img 
          src={imageError ? '/notimage.jpeg' : imageUrl}
          alt={product.name}
          className={styles.productImage}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      
      <div className={styles.details}>
        <h3 className={styles.productName}>{product.name}</h3>
        
        {product.brand && (
          <div className={styles.brand}>{product.brand}</div>
        )}
        
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}
        
        <div className={styles.priceSection}>
          <div className={styles.price}>
            {formatPrice(product.price)}
            {product.isPromotion && (
              <span className={styles.promotionBadge}>Акция</span>
            )}
          </div>
          
          {product.costPrice > 0 && product.price < product.costPrice && (
            <div className={styles.originalPrice}>
              {formatPrice(product.costPrice)}
            </div>
          )}
        </div>
        
        <div className={styles.quantityControls}>
          <button 
            onClick={handleDecrease}
            className={styles.quantityBtn}
            disabled={quantity <= 1}
            aria-label="Уменьшить количество"
          >
            -
          </button>
          
          <span className={styles.quantityValue}>{quantity}</span>
          
          <button 
            onClick={handleIncrease}
            className={styles.quantityBtn}
            aria-label="Увеличить количество"
          >
            +
          </button>
          
          <div className={styles.totalPrice}>
            Итого: {formatPrice(product.price * quantity)}
          </div>

          {/* Кнопка удаления */}
          <button 
            onClick={handleRemove}
            className={styles.removeButton}
            title="Удалить из корзины"
            aria-label="Удалить из корзины"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {product.petTypes && product.petTypes.length > 0 && (
          <div className={styles.petTypes}>
            Для: {product.petTypes.map(pet => pet.name).join(', ')}
          </div>
        )}
        
        {product.rating > 0 && (
          <div className={styles.rating}>
            Рейтинг: {product.rating.toFixed(1)} ⭐
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;