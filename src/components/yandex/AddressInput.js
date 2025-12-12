'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styles from './AddressInput.module.css';

// Оптимизированный хук debounce с useCallback
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export default function AddressInput({ onAddressSelect }) {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ymapsReady, setYmapsReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedInput = useDebounce(inputValue, 300);

  // Проверяем доступность ymaps3.suggest - ТОЛЬКО ОДИН РАЗ
  useEffect(() => {
    const checkYmaps = () => {
      if (window.ymaps3?.suggest) {
        setYmapsReady(true);
        console.log('✅ ymaps3.suggest доступна глобально');
        return true;
      }
      return false;
    };
    
    if (checkYmaps()) return;
    
    const interval = setInterval(() => {
      if (checkYmaps()) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Основная функция для запроса подсказок - useCallback для мемоизации
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (!window.ymaps3?.suggest) {
      setError('Сервис подсказок временно недоступен');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 Ищем подсказки для: "${query}"`);
      
      const results = await window.ymaps3.suggest({
        text: query,
        results: 7,
      });

      console.log(`✅ Получено подсказок: ${results.length}`);
      
      if (results.length > 0) {
        setSuggestions(results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('❌ Ошибка suggest:', err);
      setError(`Ошибка загрузки подсказок: ${err.message}`);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Запускаем запрос при изменении debounced значения
  useEffect(() => {
    if (ymapsReady && debouncedInput.length >= 2) {
      fetchSuggestions(debouncedInput);
    }
  }, [debouncedInput, ymapsReady, fetchSuggestions]);

  // Восстановление фокуса после рендера
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
      // Прокручиваем курсор в конец текста
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  });

  // Обработчик изменения input - ОПТИМИЗИРОВАН
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  // Обработчик фокуса
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (inputValue.length >= 2 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [inputValue.length, suggestions.length]);

  // Обработчик потери фокуса
  const handleInputBlur = useCallback(() => {
    // Не скрываем dropdown сразу, даем время на клик по подсказке
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
    }, 200);
  }, []);

  // Обработчик выбора подсказки
  const handleSelectSuggestion = useCallback((suggestion) => {
  console.log('🎯 Выбрана подсказка:', suggestion);
  
  // Формируем полный адрес
  const formattedAddress = suggestion.value 
    ? suggestion.value.trim() 
    : `${suggestion.subtitle?.text || ''}, ${suggestion.title?.text || ''}`.trim();
  
  setInputValue(formattedAddress);
  setShowDropdown(false);
  setSuggestions([]);

  if (onAddressSelect) {
    const addressData = {
      // ОСНОВНОЕ: полный адрес как строка
      formattedAddress: formattedAddress
    };
    
    console.log('📦 ДАННЫЕ ДЛЯ БАЗЫ:', addressData);
    onAddressSelect(addressData);
  }
}, [onAddressSelect]);


  // Обработчик клика вне dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const inputHandlers = useMemo(() => ({
    onChange: handleInputChange,
    onFocus: handleInputFocus,
    onBlur: handleInputBlur,
    onKeyDown: (e) => {
      if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        if (inputValue.trim() && ymapsReady) {
          fetchSuggestions(inputValue);
        }
      }
    }
  }), [handleInputChange, handleInputFocus, handleInputBlur, isLoading, inputValue, ymapsReady, fetchSuggestions]);

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>
        Адрес доставки
      </label>
      
      <div className={styles.inputWrapper}>
        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              {...inputHandlers}
              placeholder="Начните вводить адрес..."
              disabled={isLoading}
              className={styles.input}
              autoComplete="off"
              key="address-input" // Фиксированный ключ
            />
            
            {isLoading && (
              <div className={styles.loadingIcon}>
                <div className={styles.spinner} />
              </div>
            )}
            
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setSuggestions([]);
                  setShowDropdown(false);
                  if (onAddressSelect) onAddressSelect(null);
                  // Восстанавливаем фокус после очистки
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 10);
                }}
                className={styles.clearButton}
                aria-label="Очистить поле"
                onMouseDown={(e) => e.preventDefault()} // Предотвращаем потерю фокуса
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => {
              if (inputValue.trim() && ymapsReady) {
                fetchSuggestions(inputValue);
              }
            }}
            disabled={isLoading || !inputValue.trim() || !ymapsReady}
            className={styles.searchButton}
            onMouseDown={(e) => e.preventDefault()} // Предотвращаем потерю фокуса
          >
            {isLoading ? (
              <>
                <span className={styles.spinnerSmall} />
                Поиск...
              </>
            ) : 'Найти'}
          </button>
        </div>

        {/* Выпадающий список с подсказками */}
        {showDropdown && suggestions.length > 0 && (
          <div className={styles.dropdown}>
            {suggestions.map((item, index) => (
              <div
                key={`suggestion-${index}-${item.value || item.title?.text}`}
                className={styles.dropdownItem}
                onClick={() => handleSelectSuggestion(item)}
                onMouseDown={(e) => e.preventDefault()} // Важно! Предотвращаем потерю фокуса
              >
                <div className={styles.suggestionTitle}>
                  {item.title?.text || item.title}
                </div>
                {item.subtitle?.text && (
                  <div className={styles.suggestionSubtitle}>
                    {item.subtitle.text}
                  </div>
                )}
                {item.type && (
                  <span className={`${styles.suggestionTag} ${styles[item.type] || ''}`}>
                    {item.type === 'toponym' ? 'Топоним' : 
                     item.type === 'street' ? 'Улица' : 
                     item.type === 'house' ? 'Дом' : 
                     item.type === 'locality' ? 'Город' : item.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Сообщения об ошибке и статус */}
        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {!ymapsReady && !error && (
          <div className={styles.status}>
            ⏳ Загрузка сервиса подсказок...
          </div>
        )}

        <div className={styles.hint}>
          💡 Начните вводить улицу, дом или город. Подсказки появятся автоматически.
        </div>
      </div>
    </div>
  );
}