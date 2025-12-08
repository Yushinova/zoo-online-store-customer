'use client';
import { useState, useEffect } from 'react';
import { categoryService } from '@/api/categoryService';
import { petTypeService } from '@/api/petTypeService';
import styles from './SidebarFilters.module.css';

export default function SidebarFilters({
  onFilterChange,
  initialFilters = {},
  onReset
}) {
  // По умолчанию все поля пустые, чекбокс выключен
  const [filters, setFilters] = useState({
    isPromotion: null, // null = все товары (чекбокс выключен)
    categoryId: '',
    categoryName: '',
    petTypeId: '',
    petTypeName: '',
    name: '',
    rating: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    isActive: ''
  });
  
  // Состояния для загрузки данных
  const [categories, setCategories] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPetTypes, setLoadingPetTypes] = useState(false);

  // Загружаем категории и типы животных
  useEffect(() => {
    loadCategories();
    loadPetTypes();
  }, []);

  // Обновляем фильтры при изменении
  useEffect(() => {
    // Преобразуем пустые строки в null для совместимости с ProductQueryParameters
    const processedFilters = {
      isPromotion: filters.isPromotion, // null = все товары, true = только акционные
      categoryId: filters.categoryId === '' ? null : filters.categoryId,
      categoryName: filters.categoryId && categories.length > 0 
        ? categories.find(c => String(c.id) === String(filters.categoryId))?.name || ''
        : '',
      petTypeId: filters.petTypeId === '' ? null : filters.petTypeId,
      petTypeName: filters.petTypeId && petTypes.length > 0 
        ? petTypes.find(p => String(p.id) === String(filters.petTypeId))?.name || ''
        : '',
      name: filters.name === '' ? null : filters.name,
      rating: filters.rating === '' ? null : parseFloat(filters.rating),
      brand: filters.brand === '' ? null : filters.brand,
      minPrice: filters.minPrice === '' ? null : parseFloat(filters.minPrice),
      maxPrice: filters.maxPrice === '' ? null : parseFloat(filters.maxPrice),
      isActive: filters.isActive === '' ? null : filters.isActive === 'true'
    };
    console.log(processedFilters);
    onFilterChange(processedFilters);
  }, [filters, categories, petTypes, onFilterChange]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadPetTypes = async () => {
    try {
      setLoadingPetTypes(true);
      const data = await petTypeService.getAll();
      
      setPetTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading pet types:', error);
      setPetTypes([]);
    } finally {
      setLoadingPetTypes(false);
    }
  };

  const handleInputChange = (field, value, options = {}) => {
    const { optionText = '' } = options;
    
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Сохраняем название для категорий и типов животных
      ...(field === 'categoryId' && { categoryName: optionText }),
      ...(field === 'petTypeId' && { petTypeName: optionText })
    }));
  };

  const handlePromotionChange = (checked) => {
    // Если чекбокс включен - true (только акционные), если выключен - null (все товары)
    setFilters(prev => ({
      ...prev,
      isPromotion: checked ? true : null
    }));
  };

  const handleReset = () => {
    const defaultFilters = {
      isPromotion: null, // Все товары, чекбокс выключен
      categoryId: '',
      categoryName: '',
      petTypeId: '',
      petTypeName: '',
      name: '',
      rating: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      isActive: ''
    };
    setFilters(defaultFilters);
    if (onReset) onReset();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
        <button 
          className={styles.resetButton}
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>

      {/* Фильтр по категории */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Категория</h4>
        <div className={styles.selectGroup}>
          <select 
            className={styles.selectInput}
            value={filters.categoryId}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              handleInputChange('categoryId', e.target.value, { 
                optionText: selectedOption.text 
              });
            }}
            disabled={loadingCategories}
          >
            <option value="">Все категории</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {loadingCategories && (
            <div className={styles.loadingIndicator}>Загрузка...</div>
          )}
        </div>
      </div>

      {/* Фильтр по типу животного */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Тип животного</h4>
        <div className={styles.selectGroup}>
          <select 
            className={styles.selectInput}
            value={filters.petTypeId}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              handleInputChange('petTypeId', e.target.value, { 
                optionText: selectedOption.text 
              });
            }}
            disabled={loadingPetTypes}
          >
            <option value="">Все животные</option>
            {petTypes.map(petType => (
              <option key={petType.id} value={petType.id}>
                {petType.name}
              </option>
            ))}
          </select>
          {loadingPetTypes && (
            <div className={styles.loadingIndicator}>Загрузка...</div>
          )}
        </div>
      </div>

      {/* Фильтр по названию */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Поиск по названию</h4>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Введите название товара..."
            className={styles.textInput}
            value={filters.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
      </div>

      {/* Фильтр по бренду */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Бренд</h4>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Введите бренд..."
            className={styles.textInput}
            value={filters.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
          />
        </div>
      </div>

      {/* Фильтр по цене */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Цена, руб.</h4>
        <div className={styles.priceRange}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>От</label>
            <input
              type="number"
              placeholder="0"
              className={styles.numberInput}
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              min="0"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>До</label>
            <input
              type="number"
              placeholder="10000"
              className={styles.numberInput}
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Фильтр по рейтингу */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Рейтинг</h4>
        <div className={styles.selectGroup}>
          <select 
            className={styles.selectInput}
            value={filters.rating}
            onChange={(e) => handleInputChange('rating', e.target.value)}
          >
            <option value="">Любой рейтинг</option>
            <option value="4.5">4.5 ★ и выше</option>
            <option value="4.0">4.0 ★ и выше</option>
            <option value="3.5">3.5 ★ и выше</option>
            <option value="3.0">3.0 ★ и выше</option>
          </select>
        </div>
      </div>

      {/* Фильтр по наличию */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Наличие</h4>
        <div className={styles.selectGroup}>
          <select 
            className={styles.selectInput}
            value={filters.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.value)}
          >
            <option value="">Все товары</option>
            <option value="true">Только в наличии</option>
            <option value="false">Нет в наличии</option>
          </select>
        </div>
      </div>

      {/* Фильтр по акции */}
      <div className={styles.section}>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.isPromotion === true} // Чекбокс включен только если isPromotion === true
              onChange={(e) => handlePromotionChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxCustom}></span>
            Только акционные товары
          </label>
        </div>
      </div>
    </div>
  );
}