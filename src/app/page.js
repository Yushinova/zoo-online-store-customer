'use client';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import ProductsPage from '@/components/ProductsPage';
import styles from './page.module.css';
import { useState } from 'react';

export default function Home() {
  const [filtersFromNav, setFiltersFromNav] = useState({});

  const handleNavFilterChange = (newFilters) => {
    setFiltersFromNav(newFilters);
  };

  return (
    <div className={styles.container}>
      <Header />
      <NavigationBar onFilterChange={handleNavFilterChange} />
      
      <main className={styles.main}>
        <ProductsPage initialFilters={filtersFromNav} />
      </main>
      
      <Footer />
    </div>
  );
}