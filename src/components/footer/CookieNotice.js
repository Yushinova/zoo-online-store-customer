'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
///минимально рабочая версия
export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const cookieChoice = localStorage.getItem('cookieChoice');
    
    if (!cookieChoice) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieChoice', 'accepted');
    localStorage.setItem('cookieAcceptedDate', new Date().toISOString());
    setIsVisible(false);
    console.log('Cookies приняты');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieChoice', 'declined');
    setIsVisible(false);
    console.log('Cookies отклонены');
  };

  //не рендерим на сервере
  if (!mounted) return null;
  
  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <p style={styles.text}>
          🍪 Мы используем файлы cookie для работы сайта. 
          Токены авторизации хранятся для вашего удобства.
        </p>
        
        <div style={styles.buttons}>
          <button 
            onClick={handleAccept}
            style={styles.acceptButton}
          >
            Принять
          </button>
          
          <button 
            onClick={handleDecline}
            style={styles.declineButton}
          >
            Отклонить
          </button>
          
          <Link 
            href="/privacy" 
            style={styles.link}
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#2c3e50',
    color: 'white',
    padding: '15px 20px',
    zIndex: 9999,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
    borderTop: '1px solid #34495e'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  text: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
    textAlign: 'center'
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  acceptButton: {
    background: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '100px'
  },
  declineButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '100px'
  },
  link: {
    color: '#3498db',
    fontSize: '13px',
    textDecoration: 'none'
  }
};