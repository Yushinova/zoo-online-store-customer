'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCartItemsCount } from '@/utils/cart';
import styles from './Header.module.css';

const Header = ({ userName = null }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Получаем количество товаров в корзине
    setCartCount(getCartItemsCount());
    
    // Слушаем изменения в localStorage для обновления счетчика
    const handleStorageChange = () => {
      setCartCount(getCartItemsCount());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Создаем кастомное событие для обновления корзины
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Также можно обновлять счетчик при каждом рендере
  useEffect(() => {
    if (isMounted) {
      setCartCount(getCartItemsCount());
    }
  });

  return (
    <header className={styles.header}>
      {/* Часть 1: Логотип - 25% */}
      <div className={styles.logoSection}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo1.png"
            alt="Зоомагазин"
            width={150}
            height={60}
            className={styles.logo}
            priority
          />
        </Link>
      </div>

      {/* Часть 2: Поиск - 25% */}
      <div className={styles.searchSection}>
        <form className={styles.searchForm}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Найти
          </button>
        </form>
      </div>

      {/* Часть 3: Телефон и соцсети - 25% */}
      <div className={styles.contactsSection}>
        <div className={styles.phoneWrapper}>
          <a href="tel:8-800-586-33-22" className={styles.phone}>
            8-800-586-33-22
          </a>
        </div>
        <div className={styles.socialWrapper}>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Image
              src="/tg.png"
              alt="Telegram"
              width={28}
              height={28}
              className={styles.socialIcon}
            />
          </a>
          <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Image
              src="/ws.png"
              alt="WhatsApp"
              width={28}
              height={28}
              className={styles.socialIcon}
            />
          </a>
        </div>
      </div>

      {/* Часть 4: Профиль и корзина - 25% */}
      <div className={styles.userSection}>
        <div className={styles.profileWrapper}>
          <Link href={userName ? "/profile" : "/login"} className={styles.profileLink}>
            <Image
              src="/profile.png"
              alt={userName ? "Профиль" : "Войти"}
              width={30}
              height={30}
              className={styles.profileIcon}
            />
            {userName && (
              <span className={styles.userName}>
                {userName}
              </span>
            )}
          </Link>
        </div>
        
        <div className={styles.cartWrapper}>
          <Link href="/cart" className={styles.cartLink}>
            <div className={styles.cartContainer}>
              <Image
                src="/cart.png"
                alt="Корзина"
                width={28}
                height={28}
                className={styles.cartIcon}
              />
              {cartCount > 0 && (
                <span className={styles.cartCount}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;