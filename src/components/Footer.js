import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Основной футер - горизонтальный */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          
          {/* Телефон */}
          <div className={styles.footerItem}>
            <div className={styles.itemIcon}>📞</div>
            <div className={styles.itemContent}>
              <a href="tel:8-800-586-33-22" className={styles.phone}>
                8-800-586-33-22
              </a>
              <p className={styles.itemSubtitle}>Бесплатный звонок</p>
            </div>
          </div>

          {/* Напишите нам */}
          <div className={styles.footerItem}>
            <div className={styles.itemContent}>
              <Link href="/contact" className={styles.writeUs}>
                Напишите нам
              </Link>
              <p className={styles.itemSubtitle}>Ответим на вопросы</p>
            </div>
          </div>

          {/* Соцсети */}
          <div className={styles.footerItem}>
            <div className={styles.itemContent}>
              <div className={styles.socialIcons}>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Image src="/tg.png" alt="Telegram" width={25} height={25} />
                </a>
                <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Image src="/ws.png" alt="WhatsApp" width={25} height={25} />
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

        {/* Копирайт */}
        <div className={styles.copyright}>
          <p>© {currentYear} Зоомагазин "Лучший друг"</p>
          <Link href="/privacy" className={styles.privacyLink}>
            Политика конфиденциальности
          </Link>
        </div>
      </footer>

      {/* Сообщение о куках (как в первом варианте) */}
      <CookieNotice />
    </>
  );
};

// Компонент сообщения о куках (как в первом варианте)
const CookieNotice = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setIsVisible(false);
  };

  React.useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.cookieNotice}>
      <div className={styles.cookieContent}>
        <p className={styles.cookieText}>
          Мы используем файлы cookie для улучшения работы сайта. 
          Продолжая использовать сайт, вы соглашаетесь с использованием cookies.
        </p>
        <div className={styles.cookieButtons}>
          <button 
            onClick={handleAccept} 
            className={styles.cookieAcceptButton}
          >
            Принять
          </button>
          <button 
            onClick={handleDecline} 
            className={styles.cookieDeclineButton}
          >
            Отклонить
          </button>
          <Link href="/privacy" className={styles.cookiePolicyLink}>
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;