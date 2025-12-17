'use client';
import React, { useState, useEffect } from 'react';
import { productService } from '@/api/productService';
import { categoryService } from '@/api/categoryService';
import { feedbackService } from '@/api/feedbackService';
import ImageProductSlider from '@/components/product/ImageProductSlider';
import ReviewsModal from '../review/ReviewsModal';
import AddReviewModal from '../review/AddReviewModal';
import { 
  addToCart, 
  getCartItemQuantity 
} from '@/utils/cart';
import styles from './ProductModal.module.css';

const ProductModal = ({ productId, onClose, onProductUpdated }) => {
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0); // Состояние для общего количества отзывов
  const [loadingReviews, setLoadingReviews] = useState(false); // Состояние для загрузки отзывов
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (productId) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      fetchProductData(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      setCartQuantity(getCartItemQuantity(product.id));
      fetchTotalReviews(product.id);
    }
  }, [product]);

  const fetchProductData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productService.getByIdWithAllInfo(id);
      setProduct(productData);
      
      if (productData?.categoryId) {
        try {
          const categoryData = await categoryService.getById(productData.categoryId);
          setCategory(categoryData);
        } catch (catError) {
          console.warn('Не удалось загрузить категорию:', catError);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки товара:', err);
      setError('Не удалось загрузить информацию о товаре');
    } finally {
      setLoading(false);
    }
  };
  //рефркш
 // Убедитесь, что refreshProductData возвращает обновленный товар:
const refreshProductData = async () => {
  if (!productId) return null;
  
  try {
    setRefreshing(true);
    const updatedProduct = await productService.getByIdWithAllInfo(productId);
    setProduct(updatedProduct);
    return updatedProduct; // ← ВАЖНО: возвращаем товар
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    return null;
  } finally {
    setRefreshing(false);
  }
};
// Функция для загрузки общего количества отзывов
  const fetchTotalReviews = async (productId) => {
    try {
      setLoadingReviews(true);
      // Используем существующий метод getByProductId для получения всех отзывов
      const reviews = await feedbackService.getByProductId(productId);
      // Устанавливаем количество отзывов
      setTotalReviews(reviews.length);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      setTotalReviews(0); // При ошибке показываем 0
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Добавление в корзину
  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();
    
    if (!product || !product.isActive) {
      showNotification('Товар временно недоступен', 'error');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Добавляем товар в корзину
      addToCart(product.id, 1);
      
      // Обновляем локальное состояние
      setCartQuantity(getCartItemQuantity(product.id));
      
      // Показываем уведомление
      showNotification('Товар добавлен в корзину!');
      
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showNotification('Ошибка при добавлении в корзину', 'error');
    } finally {
      setAddingToCart(false);
    }
  };
 
  //новое///
  const handleReviewAdded = () => {
  console.log('🎯 Отзыв добавлен, обновляем данные товара...');
  
  // Обновляем данные товара
  refreshProductData().then(updatedProduct => {
    if (updatedProduct) {
      console.log('✅ Товар обновлен, новый рейтинг:', updatedProduct.rating);
      
      // ВАЖНО: Передаем обновленный товар родителю
      if (onProductUpdated && typeof onProductUpdated === 'function') {
        console.log('📤 Передаем обновленный товар в ProductGrid');
        onProductUpdated(updatedProduct);
      }
    }
    
    showNotification('Отзыв успешно добавлен!', 'success');
  });
};

  const handleBuyNow = () => {
    if (!product || !product.isActive) {
      showNotification('Товар временно недоступен', 'error');
      return;
    }

    // Добавляем в корзину если еще нет
    if (cartQuantity === 0) {
      addToCart(product.id, 1);
      setCartQuantity(getCartItemQuantity(product.id));
    }
    
    // Закрываем модальное окно
    handleClose();
    
    // Можно сделать переход к оформлению заказа
    console.log('Переход к оформлению заказа');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const showNotification = (message, type = 'success') => {
  if (typeof window === 'undefined') return;
  
  const notification = document.createElement('div');
  notification.className = `${styles.notification} ${styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
  notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={styles.starFull}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>☆</span>);
      }
    }
    return stars;
  };

 const handleReadReviews = () => {
  setIsReviewsModalOpen(true);
};

  const handleWriteReview = () => {
     const currentUserId = 1; // Нужно реализовать получение userId
  if (!currentUserId) {
    // Можно перенаправить на страницу авторизации
    // или показать уведомление
    showNotification('Для написания отзыва необходимо авторизоваться', 'error');
    return;
  }

  setIsAddReviewModalOpen(true);
  };

  if (!isVisible || !productId) return null;

  return (
    <div 
      className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        className={`${styles.modalContainer} ${isVisible ? styles.visible : ''}`}
        onClick={handleModalClick}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Загрузка товара...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={() => fetchProductData(productId)}>
              Повторить
            </button>
          </div>
        ) : product ? (
          <div className={styles.productContent}>
            <div className={styles.productGrid}>
              {/* Левая колонка - изображения и рейтинг */}
              <div className={styles.leftColumn}>
                <div className={styles.sliderContainer}>
                  <ImageProductSlider 
                    images={product.productImages || []}
                    className={styles.productSlider}
                    isModal={true}
                  />
                </div>

                {/* Рейтинг и отзывы под изображением */}
                <div className={styles.ratingSection}>
                  <div className={styles.ratingHeader}>
                    <h3 className={styles.ratingTitle}>Рейтинг и отзывы</h3>
                    <div className={styles.ratingValueContainer}>
                      <div className={styles.ratingStars}>
                        {renderStars(product.rating)}
                        <span className={styles.ratingNumber}>{product.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reviewActions}>
                    <button 
                      className={styles.readReviewsButton}
                      onClick={handleReadReviews}
                    >
                      <svg className={styles.reviewIcon} viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                      Читать все отзывы
                    </button>
                    <button 
                      className={styles.writeReviewButton}
                      onClick={handleWriteReview}
                    >
                      <svg className={styles.reviewIcon} viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      Написать отзыв
                    </button>
                  </div>

                  <div className={styles.reviewsStats}>
                    <div className={styles.reviewStat}>
                      <span className={styles.statLabel}>Всего отзывов:</span>
                      <span className={styles.statValue}>
                        {loadingReviews ? (
                          <span className={styles.loadingText}>...</span>
                        ) : (
                          totalReviews
                        )}
                      </span>
                    </div>
                    <div className={styles.reviewStat}>
                      <span className={styles.statLabel}>Средняя оценка:</span>
                      <span className={styles.statValue}>{product.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая колонка - основная информация */}
              <div className={styles.rightColumn}>
                <h1 className={styles.productTitle}>{product.name}</h1>
                
                {/* Цена и акция */}
                <div className={styles.priceSection}>
                  <div className={styles.currentPrice}>
                    {formatPrice(product.price)}
                  </div>
                  {product.isPromotion && (
                    <div className={styles.promotionBadge}>
                      <span className={styles.promotionText}>АКЦИЯ</span>
                      <span className={styles.promotionDiscount}>-20%</span>
                    </div>
                  )}
                </div>

                {/* Наличие */}
                <div className={styles.stockInfo}>
                  <div className={styles.stockStatusContainer}>
                    <span className={`${styles.stockIndicator} ${
                      product.quantity > 0 ? styles.inStock : styles.outOfStock
                    }`}></span>
                    <span className={styles.stockLabel}>
                      {product.quantity > 0 
                        ? `В наличии (${product.quantity} шт.)` 
                        : 'Нет в наличии'}
                    </span>
                  </div>
                  {product.quantity > 0 && product.quantity <= 10 && (
                    <div className={styles.lowStockWarning}>
                      <svg className={styles.warningIcon} viewBox="0 0 24 24">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                      </svg>
                      Осталось мало!
                    </div>
                  )}
                </div>

                {/* Основные характеристики */}
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <span className={styles.featureLabel}>Бренд:</span>
                    <span className={styles.featureValue}>{product.brand || 'Не указан'}</span>
                  </div>
                  
                  {category && (
                    <div className={styles.feature}>
                      <span className={styles.featureLabel}>Категория:</span>
                      <span className={styles.featureValue}>{category.name}</span>
                    </div>
                  )}
                  
                  <div className={styles.feature}>
                    <span className={styles.featureLabel}>Артикул:</span>
                    <span className={styles.featureValue}>{product.id}</span>
                  </div>
                </div>

                {/* Типы животных */}
                {product.petTypes && product.petTypes.length > 0 && (
                  <div className={styles.petTypesSection}>
                    <h3 className={styles.sectionTitle}>Для кого подходит:</h3>
                    <div className={styles.petTypesList}>
                      {product.petTypes.map(petType => (
                        <span key={petType.id} className={styles.petTypeTag}>
                          {petType.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Описание */}
                <div className={styles.descriptionSection}>
                  <h3 className={styles.sectionTitle}>Описание товара</h3>
                  <div className={styles.descriptionText}>
                    {product.description || 'Описание отсутствует'}
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className={styles.actionButtons}>
                  <div className={styles.mainActions}>
                    <button 
                      className={`${styles.addToCartButton} ${addingToCart ? styles.loading : ''} ${cartQuantity > 0 ? styles.inCart : ''}`}
                      onClick={handleAddToCart}
                      disabled={addingToCart || !product.isActive}
                    >
                      {addingToCart ? (
                        <>
                          <div className={styles.spinnerSmall}></div>
                          Добавляем...
                        </>
                      ) : cartQuantity > 0 ? (
                        <>
                          <svg className={styles.cartIcon} viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          В корзине ({cartQuantity})
                        </>
                      ) : (
                        <>
                          <svg className={styles.cartIcon} viewBox="0 0 24 24">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                          Добавить в корзину
                        </>
                      )}
                    </button>
                    <button 
                      className={styles.buyButton}
                      onClick={handleBuyNow}
                      disabled={!product.isActive}
                    >
                      <svg className={styles.buyIcon} viewBox="0 0 24 24">
                        <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                      </svg>
                      Купить сейчас
                    </button>
                  </div>
                  
                  <div className={styles.secondaryActions}>
                    <button className={styles.favoriteButton}>
                      <svg className={styles.heartIcon} viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      В избранное
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {isReviewsModalOpen && product && (
      <ReviewsModal
        productId={product.id}
        productName={product.name}
        onClose={() => setIsReviewsModalOpen(false)}
      />
      )}

      {isAddReviewModalOpen && product && (
      <AddReviewModal
        productId={product.id}
        productName={product.name}
        onClose={() => setIsAddReviewModalOpen(false)}
        onReviewAdded={handleReviewAdded}
      />
    )}
    </div>
  );
};

export default ProductModal;