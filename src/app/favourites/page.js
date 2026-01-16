'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import ProductModal from '@/components/product/ProductModal';
import { 
  getFavouritesCount, 
  loadFavouriteProducts,
  removeFromFavourites,
  clearFavourites 
} from '@/utils/favourites';
import styles from './page.module.css';
import { productService } from '@/api/productService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export default function FavouritesPage() {
  const router = useRouter();
  const [favouriteProducts, setFavouriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  //загружаем избранные товары
  const loadFavourites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const products = await loadFavouriteProducts(productService);
      setFavouriteProducts(products);
      
    } catch (error) {
      console.error('Error loading favourites:', error);
      setError('Не удалось загрузить избранные товары');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadFavourites();
    
    //слушаем обновления избранного
    const handleFavouritesUpdate = () => {
      loadFavourites();
    };
    
    window.addEventListener('favouritesUpdated', handleFavouritesUpdate);
    window.addEventListener('storage', handleFavouritesUpdate);
    
    return () => {
      window.removeEventListener('favouritesUpdated', handleFavouritesUpdate);
      window.removeEventListener('storage', handleFavouritesUpdate);
    };
  }, []);
  
  //обработчик клика по товару - открываем модалку с productId
  const handleProductClick = (product) => {
    if (product.error || !product.isActive) return;
    setSelectedProductId(product.id);
    setShowModal(true);
  };
  
  //закрытие модалки
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProductId(null);
  };
  
  //обработчик обновления товара (например, после добавления в корзину в модалке)
  const handleProductUpdated = () => {
    console.log('Товар обновлен в модалке');
  };
  
  //обработчик обновления корзины
  const handleCartUpdate = (data) => {
    window.dispatchEvent(new Event('cartUpdated'));
  };
  const handleToCart = ()=>{
    router.push('/cart');
  }
  //удалить товар из избранного
  const handleRemoveFromFavourites = (productId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Удалить товар из избранного?')) {
      removeFromFavourites(productId);
      // Если удаляем товар, который сейчас открыт в модалке - закрываем модалку
      if (selectedProductId === productId) {
        setShowModal(false);
        setSelectedProductId(null);
      }
    }
  };
  
  //очистка всех избранных
  const handleClearAll = () => {
    if (favouriteProducts.length === 0) return;
    
    if (window.confirm(`Удалить все товары (${favouriteProducts.length} шт.) из избранного?`)) {
      clearFavourites();
      // Закрываем модалку, если она была открыта
      if (showModal) {
        setShowModal(false);
        setSelectedProductId(null);
      }
    }
  };
  
  //перезагрузить избранное
  const handleRetry = () => {
    loadFavourites();
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href="/" className={styles.homeLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            На главную
          </Link>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загружаем избранные товары...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link href="/" className={styles.homeLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            На главную
          </Link>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={handleRetry}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  const favouritesCount = getFavouritesCount();
  const loadedCount = favouriteProducts.length;
  
  return (
    <div className={styles.container}>
      {/* Навигация */}
      <div className={styles.navigation}>
        <Link href="/" className={styles.homeLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          На главную
        </Link>
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Избранные товары</h1>
        <div className={styles.count}>
          {favouritesCount} {getWordForm(favouritesCount)}
        </div>
      </div>
      
      {favouritesCount === 0 ? (
        <EmptyFavourites />
      ) : (
        <>
          <div className={styles.controls}>
            <button 
              className={styles.clearButton}
              onClick={handleClearAll}
              disabled={favouritesCount === 0}
            >
              Очистить все ({favouritesCount})
            </button>
            <button
               className={styles.cartButton}
               onClick={handleToCart}>
              В корзину
            </button>
          </div>
          
          {loadedCount < favouritesCount && (
            <div className={styles.unavailableWarning}>
              <p>
                Некоторые товары временно недоступны ({favouritesCount - loadedCount} шт.)
              </p>
            </div>
          )}
          
          <div className={styles.productsGrid}>
            {favouriteProducts.map((product) => (
              <ProductItem 
                key={product.id} 
                product={product}
                onRemove={handleRemoveFromFavourites}
                onClick={() => handleProductClick(product)}
                onCartUpdate={handleCartUpdate}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Модальное окно просмотра товара */}
      {showModal && selectedProductId && (
        <ProductModal
          productId={selectedProductId} // Передаем ID вместо объекта
          onClose={handleCloseModal}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}

//компонент товара в избранном
function ProductItem({ product, onRemove, onClick, onCartUpdate }) {
  return (
    <div className={styles.productItem}>
      <button 
        className={styles.removeButton}
        onClick={(e) => onRemove(product.id, e)}
        title="Удалить из избранного"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#ff6b6b" />
          <path d="M8 8L16 16M8 16L16 8" stroke="white" strokeWidth="2" />
        </svg>
      </button>
      
      <ProductCard
        product={product}
        onClick={onClick}
        onCartUpdate={onCartUpdate}
        size="medium"
      />
      
      {product.favouriteAddedAt && (
        <div className={styles.addedDate}>
          Добавлено: {formatDate(product.favouriteAddedAt)}
        </div>
      )}
    </div>
  );
}

//компонент пустого состояния
function EmptyFavourites() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      <h2 className={styles.emptyTitle}>Нет избранных товаров</h2>
      <p className={styles.emptyText}>
        Добавляйте товары в избранное, чтобы вернуться к ним позже
      </p>
      <Link href="/" className={styles.browseButton}>
        Перейти к покупкам
      </Link>
    </div>
  );
}

//вспомогательные функции
function getWordForm(number) {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'товаров';
  }
  
  if (lastDigit === 1) {
    return 'товар';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  }
  
  return 'товаров';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дня назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`;
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}