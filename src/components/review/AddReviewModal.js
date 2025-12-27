'use client';
import React, { useState, useEffect } from 'react';
import { feedbackService } from '@/api/feedbackService';
import { useUser } from '@/app/providers/UserProvider';
import styles from './AddReviewModal.module.css';

const AddReviewModal = ({ productId, productName, onClose, onReviewAdded }) => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  //пПроверка существования отзыва
  const [checking, setChecking] = useState(true);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  
  const [errors, setErrors] = useState({
    content: '',
    rating: ''
  });

  useEffect(() => {
    const checkReview = async () => {
      if (!productId || !user) return;
      
      try {
        setChecking(true);
        const result = await feedbackService.checkUserFeedback(productId);
        
        if (result.exists) {
          setHasExistingReview(true);
        }
      } catch (err) {
        console.error('Ошибка проверки:', err);
      } finally {
        setChecking(false);
      }
    };

    checkReview();
  }, [productId, user]);

  //звезды рейтинга
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${styles.starButton} ${
            i <= (hoverRating || rating) ? styles.starSelected : styles.starEmpty
          }`}
          onClick={() => !hasExistingReview && setRating(i)}
          onMouseEnter={() => !hasExistingReview && setHoverRating(i)}
          onMouseLeave={() => !hasExistingReview && setHoverRating(0)}
          aria-label={`Оценить ${i} звезд${i > 1 ? 'ы' : 'а'}`}
          disabled={hasExistingReview || loading}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const validateForm = () => {
    const newErrors = { content: '', rating: '' };
    let isValid = true;

    if (!content.trim()) {
      newErrors.content = 'Пожалуйста, напишите отзыв';
      isValid = false;
    } else if (content.trim().length < 10) {
      newErrors.content = 'Отзыв должен содержать минимум 10 символов';
      isValid = false;
    }

    if (rating === 0) {
      newErrors.rating = 'Пожалуйста, оцените товар';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (hasExistingReview) {
      setError('Вы уже оставляли отзыв на этот товар');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('Для написания отзыва необходимо авторизоваться');
      return;
    }

    const userId = user.id || user.userId;
    
    if (!userId) {
      setError('Ошибка: не найден ID пользователя');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reviewData = {
        content: content.trim(),
        rating,
        userId: userId,
        productId
      };
      
      await feedbackService.create(reviewData);
      
      //успешно
      onReviewAdded && onReviewAdded();
      onClose();
      
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      setError(err.message || 'Произошла ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Оставить отзыв о товаре</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>"{productName}"</h3>
          
          {checking ? (
            <div className={styles.statusMessage}>
              <small>Проверяем...</small>
            </div>
          ) : hasExistingReview ? (
            <div className={`${styles.statusMessage} ${styles.error}`}>
              <strong>⛔ Вы уже оставляли отзыв на этот товар</strong>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                Нельзя оставить более одного отзыва на товар
              </p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ваша оценка</label>
            <div className={styles.ratingContainer}>
              <div className={styles.starsContainer}>
                {renderStars()}
              </div>
              <div className={styles.ratingValue}>
                {rating > 0 && <span>{rating}.0</span>}
              </div>
            </div>
            {errors.rating && (
              <p className={styles.errorText}>{errors.rating}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.formLabel}>
              Ваш отзыв
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => !hasExistingReview && setContent(e.target.value)}
              className={`${styles.textarea} ${errors.content ? styles.error : ''} ${
                hasExistingReview ? styles.disabled : ''
              }`}
              placeholder={
                hasExistingReview 
                  ? "Вы уже оставляли отзыв на этот товар" 
                  : "Поделитесь вашим мнением о товаре..."
              }
              rows={6}
              maxLength={1000}
              disabled={hasExistingReview || loading}
            />
            <div className={styles.charCount}>
              {content.length}/1000 символов
            </div>
            {errors.content && (
              <p className={styles.errorText}>{errors.content}</p>
            )}
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Закрыть
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={hasExistingReview || loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinnerSmall}></div>
                  Отправка...
                </>
              ) : hasExistingReview ? (
                'Отзыв уже оставлен'
              ) : (
                'Отправить отзыв'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;