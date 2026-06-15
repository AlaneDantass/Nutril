import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/log':
        return 'Diário de Alimentação';
      case '/free-meals':
        return 'Refeições Livres';
      case '/meal-plan':
        return 'Plano Semanal';
      case '/meals':
        return 'Banco de Refeições';
      case '/ingredients':
        return 'Banco de Ingredientes';
      case '/recipes':
        return 'Receitas';
      case '/quick-decide':
        return 'Decisão Rápida';
      case '/shopping-list':
        return 'Lista de Compras';
      case '/measurements':
        return 'Minhas Medidas';
      default:
        return 'Nutril';
    }
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className={styles.container}>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 45,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainWrapper}>
        <Header title={currentTitle} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={styles.content}>
          <div className="page-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
