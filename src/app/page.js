'use client';
import Header from '@/components/header/Header';
import NavigationBar from '@/components/navigation/NavigationBar';
import Footer from '@/components/footer/Footer';
import ProductsPage from '@/components/product/ProductsPage';
import styles from './page.module.css';
import { useState } from 'react';
import { UserProvider } from '@/app/providers/UserProvider';
export default function Home() {
  const [filtersFromNav, setFiltersFromNav] = useState({});

  const handleNavFilterChange = (newFilters) => {
    setFiltersFromNav(newFilters);
  };

  return (
    <div className={styles.container}>
      <UserProvider>
          <Header />
      </UserProvider>
      
      <NavigationBar onFilterChange={handleNavFilterChange} />
      
      <main className={styles.main}>
        <ProductsPage initialFilters={filtersFromNav} />
      </main>
      
      <Footer />
    </div>
  );
}