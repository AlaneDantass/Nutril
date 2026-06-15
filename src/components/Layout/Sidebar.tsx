import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Calendar,
  Utensils,
  Apple,
  ChefHat,
  Zap,
  ShoppingCart,
  Scale
} from 'lucide-react';
import styles from './Layout.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/log', label: 'Diário de Alimentação', icon: CalendarDays },
    { path: '/free-meals', label: 'Refeições Livres', icon: Sparkles },
    { path: '/meal-plan', label: 'Plano Semanal', icon: Calendar },
    { path: '/meals', label: 'Banco de Refeições', icon: Utensils },
    { path: '/ingredients', label: 'Ingredientes', icon: Apple },
    { path: '/recipes', label: 'Receitas', icon: ChefHat },
    { path: '/quick-decide', label: 'Decisão Rápida', icon: Zap },
    { path: '/shopping-list', label: 'Lista de Compras', icon: ShoppingCart },
    { path: '/measurements', label: 'Minhas Medidas', icon: Scale },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoText}>
          Nutril<span className={styles.logoDot}>.</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
              end={item.path === '/'}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <span className={styles.footerName}>Nutril Pro</span>
          <span className={styles.footerMeta}>v1.0.0 • Offline</span>
        </div>
      </div>
    </aside>
  );
};
