'use client';

import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api';
import { 
  addToCart, 
  getCartItemQuantity, 
  getCartItemsCount 
} from '@/utils/cart';
import styles from './ProductCard.module.css';

const YANDEX_CLOUD_BASE_URL = API_CONFIG.YC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = API_CONFIG.YC_BACKET || 'backet-online-storage';

export default function ProductCard({ 
  product, 
  onClick,
  onCartUpdate,
  size = 'medium'
}) {
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isMounted && product) {
      setCartQuantity(getCartItemQuantity(product.id));
    }
  }, [product, isMounted]);

  if (!product) return null;

  const getImageUrl = () => {
    if (!product.productImages || product.productImages.length === 0) {
      return '/notimage.jpeg';
    }
    
    const firstImage = product.productImages[0];
    return `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${firstImage.imageName}` || '/notimage.jpeg';
  };

  const handleClick = (e) => {
    if (e.target.closest(`.${styles.cartButton}`)) {
      return;
    }
    
    if (onClick && product.isActive) {
      onClick(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!product.isActive) {
      return;
    }

    //не добавляем больше, чем есть товара
    const availableQuantity = product.quantity || 0;
    const currentInCart = cartQuantity;
    
    if (currentInCart >= availableQuantity) {
      return; //ничего не делаем
    }

    try {
      setAddingToCart(true);
      
      addToCart(product.id, 1);
      const newQuantity = getCartItemQuantity(product.id);
      setCartQuantity(newQuantity);
      
      if (onCartUpdate) {
        onCartUpdate({
          productId: product.id,
          quantity: newQuantity,
          totalItems: getCartItemsCount()
        });
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={styles.starFull}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>★</span>);
      }
    }
    
    return stars;
  };

  const canAddMore = product.isActive && (product.quantity || 0) > cartQuantity;

  return (
    <div 
      className={`${styles.card} ${styles[size]} ${!product.isActive ? styles.inactive : ''}`}
      onClick={handleClick}
    >
      {product.isPromotion && (
        <div className={styles.promotionBadge}>
          Акция
        </div>
      )}

      {cartQuantity > 0 && (
        <div className={styles.inCartBadge}>
          В корзине: {cartQuantity}
        </div>
      )}

      <div className={styles.imageContainer}>
        <img 
          src={imageError ? '/notimage.jpeg' : getImageUrl()}
          alt={product.name}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
        
        {!product.isActive && (
          <div className={styles.inactiveOverlay}>
            <span>Нет в наличии</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name} title={product.name}>
          {product.name}
        </h3>

        {product.brand && (
          <div className={styles.brand}>
            {product.brand}
          </div>
        )}

        <div className={styles.rating}>
          {renderStars()}
          <span className={styles.ratingValue}>{product.rating?.toFixed(1) || '0.0'}</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.price}>
            {formatPrice(product.price)}
          </div>
          {product.costPrice > 0 && product.price < product.costPrice && (
            <div className={styles.oldPrice}>
              {formatPrice(product.costPrice)}
            </div>
          )}
        </div>

        {/*disabled если нельзя добавить больше */}
        {product.isActive && (
          <button 
            className={`${styles.cartButton} ${cartQuantity > 0 ? styles.inCart : ''}`}
            onClick={handleAddToCart}
            disabled={!canAddMore || addingToCart}
          >
            {addingToCart ? (
              <>
                <span className={styles.cartSpinner}></span>
                Добавляем...
              </>
            ) : cartQuantity > 0 ? (
              <>
                <svg className={styles.cartIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Добавлено ({cartQuantity})
              </>
            ) : product.quantity === 0 ? (
              'Товара временно нет'
            ) : (
              <>
                <svg className={styles.cartIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                В корзину
              </>
            )}
          </button>
        )}

        {product.quantity <= 10 && product.quantity > 0 && (
          <div className={styles.quantityWarning}>
            Осталось: {product.quantity} шт.
          </div>
        )}

        {product.petTypes && product.petTypes.length > 0 && (
          <div className={styles.petTypes}>
            {product.petTypes.slice(0, 2).map((petType, index) => (
              <span key={petType.id || index} className={styles.petTypeTag}>
                {petType.name}
              </span>
            ))}
            {product.petTypes.length > 2 && (
              <span className={styles.moreTag}>+{product.petTypes.length - 2}</span>
            )}
          </div>
        )}

        {product.category && (
          <div className={styles.categoryInfo}>
            Категория: {product.category.name}
          </div>
        )}
      </div>
    </div>
  );
}