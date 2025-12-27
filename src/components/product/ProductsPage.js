'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import SidebarFilters from '@/components/sidebar/SidebarFilters';
import ProductGrid from '@/components/product/ProductGrid';
import styles from './ProductsPage.module.css';

export default function ProductsPage({ initialFilters = {} }) {
  const isInitialMount = useRef(true);
  const [filters, setFilters] = useState({
    isPromotion: null,
    categoryId: '',
    categoryName: '',
    petTypeId: '',
    petTypeName: '',
    name: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    isActive: '',
    filterType: ''
  });

  useEffect(() => {
    if (!isInitialMount.current) {
      setFilters(prev => ({
        ...prev,
        isPromotion: initialFilters.isPromotion ?? null,
        categoryId: initialFilters.categoryId ?? '',
        categoryName: initialFilters.categoryName ?? '',
        petTypeId: initialFilters.petTypeId ?? '',
        petTypeName: initialFilters.petTypeName ?? '',
        filterType: initialFilters.filterType?? ''
      }));
    }
    isInitialMount.current = false;
  }, [initialFilters]);

  //функция для генерации заголовка на основе фильтров
  const generateTitle = useMemo(() => {
    if (!filters.isPromotion && 
      !filters.categoryId && 
      !filters.petTypeId && 
      !filters.name && 
      !filters.brand && 
      !filters.rating && 
      !filters.minPrice && 
      !filters.maxPrice && 
      !filters.isActive) {
      return "Все товары";
    }
    
    const parts = [];
    
    //1-Тип животного
    if (filters.petTypeName) {
      parts.push(filters.petTypeName);
    }
    
    //2- Категория
    if (filters.categoryName) {
      parts.push(filters.categoryName);
    }
    
    //3-Поиск по названию
    if (filters.name) {
      parts.push(`поиск: "${filters.name}"`);
    }
    
    //4-Бренд
    if (filters.brand) {
      parts.push(`бренд: ${filters.brand}`);
    }
    
    //5-Рейтинг
    if (filters.rating) {
      parts.push(`рейтинг ${filters.rating}+`);
    }
    
    //6-Цена
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [];
      if (filters.minPrice) priceRange.push(`от ${filters.minPrice}₽`);
      if (filters.maxPrice) priceRange.push(`до ${filters.maxPrice}₽`);
      parts.push(priceRange.join(' '));
    }
    
    //8-Наличие
    if (filters.isActive !== '' && filters.isActive !== null) {
      parts.push(filters.isActive ? 'в наличии' : 'нет в наличии');
    }

    //9-Из навигации Акции
    if(filters.filterType === 'sales' || filters.isPromotion === true){
      parts.push('Акционные товары');
    }
    
    //генерация заголовка
    if (parts.length > 0) {
      return parts.join(' • ');
    }
    
    return 'Все товары';
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({
      isPromotion: null,
      name: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      isActive: '',
      categoryId: '',
      categoryName: '',
      petTypeId: '',
      petTypeName: '',
      filterType: ''
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SidebarFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            onReset={handleReset}
          />
        </aside>

        <main className={styles.main}>
          <ProductGrid
            title={generateTitle}
            pageSize={8}
            filters={filters}
          />
        </main>
      </div>
    </div>
  );
}