'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';
import CookieNotice from './CookieNotice';
import TestNotice from './TestNotice';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          
          <div className={styles.footerItem}>
            <div className={styles.itemIcon}>📞</div>
            <div className={styles.itemContent}>
              <a href="tel:8-800-586-33-22" className={styles.phone}>
                8-800-586-33-22
              </a>
              <p className={styles.itemSubtitle}>Бесплатный звонок</p>
            </div>
          </div>

          <div className={styles.footerItem}>
            <div className={styles.itemContent}>
              <Link href="/contact" className={styles.writeUs}>
                Напишите нам
              </Link>
              <p className={styles.itemSubtitle}>Ответим на вопросы</p>
            </div>
          </div>

          <div className={styles.footerItem}>
            <div className={styles.itemContent}>
              <div className={styles.socialIcons}>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Image src="/tg.png" alt="Telegram" width={25} height={25} />
                </a>
                <a href="https://web.max.ru/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Image src="/max.png" alt="Max" width={25} height={25} />
                </a>
                <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className={styles.vkLink}>
                  VK
                </a>
              </div>
              <p className={styles.itemSubtitle}>Мы в соцсетях</p>
            </div>
          </div>

          <div className={styles.footerItem}>
            <div className={styles.itemIcon}>📱</div>
            <div className={styles.itemContent}>
              <div className={styles.appsBlock}>
              
                <div className={styles.appLinks}>
                  <a href="#" className={styles.appStoreLink}>
                    <Image src="/appstore.png" alt="App Store" width={120} height={50} />
                  </a>
                  <a href="#" className={styles.googlePlayLink}>
                    <Image src="/googleplay.png" alt="Google Play" width={120} height={50} />
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>

        <div className={styles.copyright}>
          <p>© {currentYear} Зоомагазин "Лучший друг"</p>
          <Link href="/privacy" className={styles.privacyLink}>
            Политика конфиденциальности
          </Link>
        </div>
      </footer>
      <CookieNotice/>
      
    </>
  );
};

export default Footer;