'use client';

import React, { useState } from 'react';
import { userService } from '@/api/userService';
import { authService } from '@/api/authService';
import { UserRequest, UserLogin } from '@/models/user';
import { useUser } from '@/app/providers/UserProvider'; // ⭐ Импортируем
import styles from './AuthForm.module.css';

const AuthForm = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // ⭐ Получаем login из вашего UserProvider
  const { login } = useUser();
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});

  // Обработка изменения полей (ваш существующий код)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let phoneValue = value.replace(/\D/g, '');
      
      if (phoneValue.length > 11) {
        phoneValue = phoneValue.substring(0, 11);
      }
      
      if (phoneValue.length === 11) {
        const formatted = `+7(${phoneValue.substring(1, 4)})${phoneValue.substring(4, 7)}-${phoneValue.substring(7, 9)}-${phoneValue.substring(9, 11)}`;
        setFormData(prev => ({ ...prev, phone: formatted }));
      } else if (phoneValue.length > 0) {
        setFormData(prev => ({ ...prev, phone: phoneValue }));
      } else {
        setFormData(prev => ({ ...prev, phone: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация (ваш существующий код)
  const validateForm = () => {
    const newErrors = {};
    const phonePattern = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!phonePattern.test(formData.phone)) {
      newErrors.phone = 'Формат: +7(XXX)XXX-XX-XX';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }
    
    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Имя обязательно';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Некорректный email';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⭐ ИСПРАВЛЕННАЯ ОБРАБОТКА ОТПРАВКИ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let apiKey;
      
      if (mode === 'register') {
        // 1. Регистрация
        const userRequest = new UserRequest();
        Object.assign(userRequest, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        });
        
        console.log('Регистрация...');
        apiKey = await userService.register(userRequest);
        console.log('apiKey:', apiKey);
        
      } else {
        // 2. Логин
        const userLogin = new UserLogin();
        Object.assign(userLogin, {
          phone: formData.phone,
          password: formData.password
        });
        
        console.log('Вход...');
        apiKey = await userService.login(userLogin);
        console.log('apiKey:', apiKey);
      }
      
      // ⭐ 3. Получаем токен (устанавливает куки)
      console.log('Получение токена...');
      await authService.getTokenByApiKey(apiKey);
      
      // ⭐ 4. Логиним пользователя через UserProvider
      // Ваш login() принимает только apiKey, не userData!
      console.log('Сохранение в UserProvider...');
      await login(apiKey); // ⭐ Это вызовет loadUser внутри UserProvider
      
      // ⭐ 5. Успех - можно сделать редирект
      console.log('Успешно!');
      
      if (onSuccess) {
        onSuccess(); // Или передайте что-то если нужно
      }
      
      // Автоматический редирект на главную
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('Ошибка:', error);
      setAuthError(error.message || 'Ошибка аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  // Переключение между логином и регистрацией
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setAuthError('');
    setErrors({});
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>
          {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        </h2>

        {authError && (
          <div className={styles.errorAlert}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Введите ваше имя"
                  disabled={isLoading}
                />
                {errors.name && (
                  <span className={styles.errorText}>{errors.name}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="example@mail.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Телефон *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              placeholder="+7(900)123-45-67"
              disabled={isLoading}
            />
            {errors.phone && (
              <span className={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Введите пароль"
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>
                {mode === 'login' ? 'Вход...' : 'Регистрация...'}
              </span>
            ) : (
              mode === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className={styles.switchMode}>
          <p className={styles.switchText}>
            {mode === 'login' 
              ? 'Нет аккаунта? ' 
              : 'Уже есть аккаунт? '
            }
            <button
              type="button"
              onClick={toggleMode}
              className={styles.switchButton}
              disabled={isLoading}
            >
              {mode === 'login' ? 'Создать аккаунт' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;