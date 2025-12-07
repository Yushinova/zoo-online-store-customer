'use client';

import React, { useState, useEffect, useRef } from 'react';
import { petTypeService } from '@/api/petTypeService';
import styles from './NavigationBar.module.css';

const NavigationBar = ({ onFilterChange }) => {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPetType, setHoveredPetType] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadPetTypes();
  }, []);

  // При монтировании применяем фильтр акционных товаров ТОЛЬКО при первой загрузке
  useEffect(() => {
    if (isInitialMount.current) {
      const filters = {
        petTypeId: null,
        petTypeName: '',
        categoryId: null,
        categoryName: '',
        isPromotion: true,
        filterType: 'sales'
      };
      setActiveFilter({ type: 'sales', id: 'sales', name: 'Акции' });
      onFilterChange(filters);
      isInitialMount.current = false;
    }
  }, [onFilterChange]);

  const loadPetTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const petTypes = await petTypeService.getAllWithCategoties();
      console.log('Получены типы животных:', petTypes);
     
      const sorted = [...petTypes].sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });

      const navigationItems = sorted.map(petType => ({
        id: petType.id,
        name: petType.name,
        categories: petType.categories || []
      }));
      
      const allItems = [
        ...navigationItems,
        {
          id: 'sales',
          name: 'Акции',
          isSpecial: true,
          categories: []
        }
      ];
      
      setNavItems(allItems);
    } catch (err) {
      console.error('Ошибка загрузки типов животных:', err);
      setError('Не удалось загрузить категории');
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (petTypeId) => {
    setHoveredPetType(petTypeId);
  };

  const handleMouseLeave = () => {
    setHoveredPetType(null);
  };

  // Применение фильтра по типу животного
  const applyPetTypeFilter = (petTypeId, petTypeName, e) => {
    e.preventDefault();
    const filters = {
      petTypeId: petTypeId,
      petTypeName: petTypeName,
      categoryId: null,
      categoryName: '',
      isPromotion: null,
      filterType: 'petType'
    };
    
    setActiveFilter({ type: 'petType', id: petTypeId, name: petTypeName });
    onFilterChange(filters);
  };

  // Применение фильтра по акциям
  const applySalesFilter = (e) => {
    e.preventDefault();
    const filters = {
      petTypeId: null,
      petTypeName: '',
      categoryId: null,
      categoryName: '',
      isPromotion: true,
      filterType: 'sales'
    };
    
    setActiveFilter({ type: 'sales', id: 'sales', name: 'Акции' });
    onFilterChange(filters);
  };

  // Применение фильтра по категории
  const applyCategoryFilter = (petTypeId, petTypeName, categoryId, categoryName, e) => {
    e.preventDefault();
    const filters = {
      petTypeId: petTypeId,
      petTypeName: petTypeName,
      categoryId: categoryId,
      categoryName: categoryName,
      isPromotion: null,
      filterType: 'category'
    };
    
    setActiveFilter({ 
      type: 'category', 
      id: `${petTypeId}-${categoryId}`,
      petTypeName: petTypeName,
      categoryName: categoryName
    });
    onFilterChange(filters);
  };

  if (loading) {
    return (
      <nav className={styles.navigationBar}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span>Загрузка категорий...</span>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className={styles.navigationBar}>
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{error}</span>
          <button 
            className={styles.retryButton}
            onClick={loadPetTypes}
          >
            Повторить
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navigationBar}>
      <div className={styles.navContainer}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li 
              key={item.id} 
              className={`${styles.navItem} ${item.isSpecial ? styles.specialItem : ''} ${
                (item.isSpecial && activeFilter?.type === 'sales') || 
                (!item.isSpecial && activeFilter?.type === 'petType' && activeFilter?.id === item.id) ? 
                styles.active : ''
              }`}
              onMouseEnter={() => !item.isSpecial && handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              <a 
                href="#" 
                className={styles.navLink}
                onClick={item.isSpecial ? 
                  applySalesFilter : 
                  (e) => applyPetTypeFilter(item.id, item.name, e)
                }
              >
                <span className={styles.navContent}>
                  <span className={styles.navText}>
                    {item.name}
                    {item.isSpecial && <span className={styles.saleBadge}>🔥</span>}
                  </span>
                </span>
              </a>
              
              {/* Выпадающее меню с категориями */}
              {!item.isSpecial && hoveredPetType === item.id && item.categories.length > 0 && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>Категории {item.name}</span>
                    </div>
                    <ul className={styles.categoryList}>
                      {item.categories.map((category) => (
                        <li 
                          key={category.id} 
                          className={styles.categoryItem}
                        >
                          <a
                            href="#"
                            className={`${styles.categoryLink} ${
                              activeFilter?.type === 'category' && 
                              activeFilter?.id === `${item.id}-${category.id}` ? 
                              styles.activeCategory : ''
                            }`}
                            onClick={(e) => applyCategoryFilter(
                              item.id, 
                              item.name, 
                              category.id, 
                              category.name, 
                              e
                            )}
                            title={`Показать товары: ${category.name}`}
                          >
                            <span className={styles.categoryName}>{category.name}</span>
                            <span className={styles.categoryArrow}>→</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.dropdownFooter}>
                      <a
                        href="#"
                        className={styles.allCategoriesLink}
                        onClick={(e) => applyPetTypeFilter(item.id, item.name, e)}
                      >
                        Все категории {item.name} →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationBar;