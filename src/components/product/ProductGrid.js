'use client';
import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import ProductModal from '@/components/product/ProductModal';
import { ProductQueryParameters } from '@/models/product';
import { productService } from '@/api/productService';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ 
  filters = {},
  showLoadMore = true,
  pageSize = 8,
  title = "Товары"
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  //новое/////

  //для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  //для модального окна
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //загрузка товаров
  const loadProducts = useCallback(async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const params = new ProductQueryParameters();
      params.page = page;
      params.pageSize = pageSize;
      
      if (filters.isPromotion !== undefined && filters.isPromotion !== null) {
        params.isPromotion = filters.isPromotion;
      }
      
      if (filters.categoryId !== undefined && filters.categoryId !== null) {
        params.categoryId = filters.categoryId;
      }
      
      if (filters.petTypeId !== undefined && filters.petTypeId !== null) {
        params.petTypeId = filters.petTypeId;
      }
      
      if (filters.name !== undefined && filters.name !== null && filters.name !== '') {
        params.name = filters.name;
      }
      
      if (filters.rating !== undefined && filters.rating !== null) {
        params.rating = filters.rating;
      }
      
      if (filters.brand !== undefined && filters.brand !== null && filters.brand !== '') {
        params.brand = filters.brand;
      }
      
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        params.minPrice = filters.minPrice;
      }
      
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        params.maxPrice = filters.maxPrice;
      }
      
      if (filters.isActive !== undefined && filters.isActive !== null) {
        params.isActive = filters.isActive;
      }
      
      if (filters.sortBy) {
        applySorting(params, filters.sortBy);
      }
      
      console.log('Loading products with params:', params);
      
      const productsData = await productService.getAllWithFilterAndPagination(params);
      
      if (Array.isArray(productsData)) {
        if (page === 1) {
          setProducts(productsData);
        } else {
          setProducts(prev => [...prev, ...productsData]);
        }
        
        if (productsData.length === 0 || productsData.length < pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
        if (productsData.length > 0) {
          setCurrentPage(page);
        }
        
      } else {
        if (productsData && Array.isArray(productsData.items)) {
          if (page === 1) {
            setProducts(productsData.items);
          } else {
            setProducts(prev => [...prev, ...productsData.items]);
          }
          
          if (productsData.items.length === 0 || productsData.items.length < pageSize) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
          
          setCurrentPage(page);
        } else {
          if (page === 1) {
            setProducts([]);
          }
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Ошибка загрузки товаров');
      if (page === 1) {
        setProducts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize, filters]);

  //при изменении фильтров сбрасываем на первую страницу
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1, true);
  }, [filters]);

  //первая загрузка
  useEffect(() => {
    loadProducts(1, true);
  }, []);

  //открытие модального окна
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
     setIsModalOpen(false);
  setSelectedProduct(null);
  document.body.style.overflow = 'unset';
  };

  //обновление корзины из ProductCard
  const handleCartUpdate = (cartData) => {
    console.log('Cart updated:', cartData);
  };

  //сортировка
  const applySorting = (params, sortOption) => {
    switch(sortOption) {
      case 'price_asc':
        params.sortBy = 'price';
        params.sortDirection = 'asc';
        break;
      case 'price_desc':
        params.sortBy = 'price';
        params.sortDirection = 'desc';
        break;
      case 'rating_desc':
        params.sortBy = 'rating';
        params.sortDirection = 'desc';
        break;
      case 'name_asc':
        params.sortBy = 'name';
        params.sortDirection = 'asc';
        break;
      case 'newest':
      default:
        params.sortBy = 'createdDate';
        params.sortDirection = 'desc';
        break;
    }
  };

  //следующая страница
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1);
    }
  };

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка товаров...</p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => loadProducts(1, true)}
          >
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyMessage}>Товары не найдены</p>
          <p className={styles.emptySubmessage}>Попробуйте изменить параметры поиска</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className={styles.productCount}>
            Найдено товаров: {products.length}
            {hasMore && currentPage > 1 && ` (страница ${currentPage})`}
          </div>
          
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick} //передаем весь объект товара
                onCartUpdate={handleCartUpdate} //коллбэк для обновления корзины
                size="medium"
              />
            ))}
          </div>
          
          {showLoadMore && hasMore && (
            <div className={styles.loadMoreContainer}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Загрузка...
                  </>
                ) : (
                  'Загрузить еще'
                )}
              </button>
            </div>
          )}
          
          {!hasMore && products.length > 0 && (
            <div className={styles.noMoreContainer}>
              <p className={styles.noMoreText}>Все товары загружены</p>
            </div>
          )}
        </>
      )}

      {/*модалка с товаром*/}
      {isModalOpen && selectedProduct && (
        <ProductModal
          productId={selectedProduct.id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}