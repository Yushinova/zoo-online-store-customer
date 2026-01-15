'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/app/providers/UserProvider';
import { getCartItemsCount } from '@/utils/cart';
import { getFavouritesCount } from '@/utils/favourites'; // Импортируем функцию
import styles from './Header.module.css';

const Header = () => {
  const { user, loading } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const [favouritesCount, setFavouritesCount] = useState(0); // Новое состояние
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Получаем количество товаров в корзине
    setCartCount(getCartItemsCount());
    // Получаем количество избранных товаров
    setFavouritesCount(getFavouritesCount());
    
    // Изменения в localStorage для обновления счетчика корзины
    const handleCartStorageChange = () => {
      setCartCount(getCartItemsCount());
    };
    
    // Изменения в localStorage для обновления счетчика избранного
    const handleFavouritesStorageChange = () => {
      setFavouritesCount(getFavouritesCount());
    };
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'pet_shop_cart') {
        handleCartStorageChange();
      }
      if (event.key === 'pet_shop_favourites') {
        handleFavouritesStorageChange();
      }
    });
    
    // Кастомные события для обновления
    window.addEventListener('cartUpdated', handleCartStorageChange);
    window.addEventListener('favouritesUpdated', handleFavouritesStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleCartStorageChange);
      window.removeEventListener('cartUpdated', handleCartStorageChange);
      window.removeEventListener('favouritesUpdated', handleFavouritesStorageChange);
    };
  }, []);

  // Обновлять счетчики при каждом рендере
  useEffect(() => {
    if (isMounted) {
      setCartCount(getCartItemsCount());
      setFavouritesCount(getFavouritesCount());
    }
  });

  //имя пользователя из контекста
  const userName = user?.name;

  return (
    <header className={styles.header}>
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

      <div className={styles.userSection}>
        <div className={styles.profileWrapper}>
          <Link href={userName ? "/personal" : "/auth"} className={styles.profileLink}>
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
            {!userName && !loading && (
              <span className={styles.loginText}>
                Войти
              </span>
            )}
          </Link>
        </div>
        <div className={styles.favouritesWrapper}>
          <Link href="/favourites" className={styles.favouritesLink}>
            <div className={styles.favouritesContainer}>
              <Image
                src="/heart-icon.png"
                alt="Избранное"
                width={28}
                height={28}
                className={styles.favouritesIcon}
              />
              {favouritesCount > 0 && (
                <span className={styles.favouritesCount}>
                  {favouritesCount > 99 ? '99+' : favouritesCount}
                </span>
              )}
            </div>
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