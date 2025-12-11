'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { userService } from '@/api/userService';
import styles from './page.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const checkAuth = () => {
      if (userService.currentUser) {
        // Если пользователь уже авторизован, перенаправляем на главную
        router.push('/');
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleAuthSuccess = (userData) => {
    console.log('Auth successful:', userData);
    // Перенаправляем на главную страницу или dashboard
    router.push('/');
  };

  if (isCheckingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Добро пожаловать</h1>
        <p className={styles.pageSubtitle}>
          {`Войдите в свой аккаунт или создайте новый, чтобы продолжить`}
        </p>
      </div>
      
      <AuthForm onSuccess={handleAuthSuccess} />
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Авторизуясь, вы соглашаетесь с нашими 
          <a href="/terms" className={styles.link}> Условиями использования</a> и 
          <a href="/privacy" className={styles.link}> Политикой конфиденциальности</a>
        </p>
      </div>
    </div>
  );
}