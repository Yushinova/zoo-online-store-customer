'use client';
import React, { useState } from 'react';
import { feedbackService } from '@/api/feedbackService';
import { useUser } from '@/app/providers/UserProvider'; // ⭐ ИМПОРТИРУЕМ
import styles from './AddReviewModal.module.css';

const AddReviewModal = ({ productId, productName, onClose, onReviewAdded }) => {
  const { user } = useUser(); // ⭐ ПОЛУЧАЕМ ЮЗЕРА ИЗ КОНТЕКСТА
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Валидация
  const [errors, setErrors] = useState({
    content: '',
    rating: ''
  });

  // Звезды рейтинга
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
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Оценить ${i} звезд${i > 1 ? 'ы' : 'а'}`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  // Валидация формы
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

  // Отправка отзыва
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // ⭐ ПРОВЕРЯЕМ user ИЗ КОНТЕКСТА
    if (!user) {
      setError('Для написания отзыва необходимо авторизоваться');
      return;
    }

    // ⭐ НАХОДИМ userId В ОБЪЕКТЕ USER
    // Проверяем разные возможные поля
    const userId = user.id || user.userId || user.uuid;
    
    if (!userId) {
      console.error('User object:', user);
      setError('ID пользователя не найден');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reviewData = {
        content: content.trim(),
        rating,
        userId: userId, // ⭐ ПЕРЕДАЕМ НАЙДЕННЫЙ userId
        productId
      };

      console.log('Отправка отзыва:', reviewData); // Для отладки
      
      await feedbackService.create(reviewData);
      
      // Успешно - закрываем модалку и обновляем данные
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
          {/* ⭐ МОЖНО ДОБАВИТЬ ИНФО О ЮЗЕРЕ ДЛЯ ОТЛАДКИ */}
          {user && (
            <div className={styles.userInfo}>
              <small>Пользователь: {user.name || 'Неизвестно'}</small>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          {/* Поле рейтинга */}
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

          {/* Поле отзыва */}
          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.formLabel}>
              Ваш отзыв
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
              placeholder="Поделитесь вашим мнением о товаре..."
              rows={6}
              maxLength={1000}
            />
            <div className={styles.charCount}>
              {content.length}/1000 символов
            </div>
            {errors.content && (
              <p className={styles.errorText}>{errors.content}</p>
            )}
          </div>

          {/* Советы по написанию отзыва */}
          <div className={styles.tips}>
            <p className={styles.tipsTitle}>Советы по написанию хорошего отзыва:</p>
            <ul className={styles.tipsList}>
              <li>Расскажите о качестве товара</li>
              <li>Поделитесь вашим опытом использования</li>
              <li>Отметьте достоинства и недостатки</li>
              <li>Будьте объективны и вежливы</li>
            </ul>
          </div>

          {/* Общая ошибка */}
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinnerSmall}></div>
                  Отправка...
                </>
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