'use client';
import React, { useState, useEffect } from 'react';
import { feedbackService } from '@/api/feedbackService';
import styles from './ReviewsModal.module.css'; // Создадим отдельный CSS-модуль

const ReviewsModal = ({ productId, productName, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const pageSize = 5; // По 5 отзывов на страницу

  // Загрузка отзывов
  const loadReviews = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const newReviews = await feedbackService.getTopByProductId(
        productId, 
        pageNum, 
        pageSize
      );
      
      if (pageNum === 1) {
        setReviews(newReviews);
        // Проверяем, есть ли еще отзывы
        setHasMore(newReviews.length === pageSize);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
        setHasMore(newReviews.length === pageSize);
      }
      
      // Если загружаем первую страницу, получаем общее количество отзывов
      if (pageNum === 1) {
        const allReviews = await feedbackService.getByProductId(productId);
        setTotalReviews(allReviews.length);
      }
      
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      setError('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Загрузка при открытии
  useEffect(() => {
    if (productId) {
      loadReviews(1);
    }
  }, [productId]);

  // Загрузка следующих отзывов
  const loadMoreReviews = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, true);
  };

  // Рендер звезд рейтинга
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className={styles.starFull}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>☆</span>);
      }
    }
    return stars;
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!productId) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Отзывы о товаре "{productName}"
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalContent}>
          {loading && page === 1 ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Загрузка отзывов...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => loadReviews(1)}
              >
                Повторить
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>
                Пока нет отзывов на этот товар.
              </p>
              <button 
                className={styles.writeFirstReviewButton}
                onClick={() => console.log('Написать первый отзыв')}
              >
                Написать первый отзыв
              </button>
            </div>
          ) : (
            <>
              <div className={styles.reviewsInfo}>
                <span className={styles.totalReviews}>
                  Всего отзывов: {totalReviews}
                </span>
              </div>

              <div className={styles.reviewsList}>
                {reviews.map((review, index) => (
                  <div 
                    key={`${review.id}-${index}`} 
                    className={styles.reviewItem}
                  >
                    <div className={styles.reviewHeader}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {review.user?.name || 'Анонимный пользователь'}
                        </span>
                        <div className={styles.reviewRating}>
                          {renderStars(review.rating)}
                          <span className={styles.ratingValue}>
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <p className={styles.reviewContent}>
                      {review.content}
                    </p>
                    
                    {/* Можно добавить кнопки "Полезно" и т.д. */}
                  </div>
                ))}
              </div>

              {/* Кнопка "Загрузить еще" */}
              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <button 
                    className={styles.loadMoreButton}
                    onClick={loadMoreReviews}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className={styles.spinnerSmall}></div>
                        Загрузка...
                      </>
                    ) : (
                      'Показать еще отзывы'
                    )}
                  </button>
                </div>
              )}

              {/* Кнопка написать отзыв */}
              <div className={styles.writeReviewContainer}>
                <button 
                  className={styles.writeReviewButton}
                  onClick={() => console.log('Написать отзыв')}
                >
                  Написать отзыв
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;