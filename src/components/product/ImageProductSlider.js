'use client';
import { API_CONFIG } from '@/config/api';
import React, { useState } from 'react';
import styles from './ImageProductSlider.module.css';

const ImageProductSlider = ({ images, className = '', isModal = false }) => {
  const URL_IMAGE = `${API_CONFIG.YC_URL}/${API_CONFIG.YC_BACKET}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  //если нет картинок или пустой массив ставим заглушку
  if (!images || images.length === 0) {
    return (
      <div className={`${styles.container} ${className} ${isModal ? styles.modalSize : ''}`}>
        <div className={styles.noImageContainer}>
          <img 
            src="/notimage.jpeg" 
            alt="Изображение отсутствует"
            className={styles.image}
          />
          <div className={styles.noImageText}>Нет изображений</div>
        </div>
      </div>
    );
  }
  
  const currentImage = images[currentIndex];
  
  //след
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  //пред
  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  //переход к конкретному изображению
  const goToImage = (index, e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(index);
  };
  
  //ошибка загрузки изображения
  const handleImageError = (e) => {
    console.error('Ошибка загрузки изображения:', e.target.src);
    e.target.src = '/notimage.jpeg';
    e.target.onerror = null;
  };
  
  return (
    <div className={`${styles.container} ${className} ${isModal ? styles.modalSize : ''}`}>
      <div className={styles.sliderWrapper}>
        <img 
          src={`${URL_IMAGE}/${currentImage.imageName}`}
          alt={currentImage.altText || `Изображение ${currentIndex + 1}`}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
        
        {images.length > 1 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={prevImage}
              aria-label="Предыдущее изображение"
            >
              <svg className={styles.navIcon} viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
            </button>
            
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={nextImage}
              aria-label="Следующее изображение"
            >
              <svg className={styles.navIcon} viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </>
        )}
        
        {images.length > 1 && (
          <div className={styles.counter}>
            <span className={styles.counterCurrent}>{currentIndex + 1}</span>
            <span className={styles.counterSeparator}>/</span>
            <span className={styles.counterTotal}>{images.length}</span>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={(e) => goToImage(index, e)}
              aria-label={`Показать изображение ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageProductSlider;