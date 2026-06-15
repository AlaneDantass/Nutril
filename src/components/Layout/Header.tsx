import React from 'react';
import { Menu } from 'lucide-react';
import { getFullDateLabel, formatDateISO } from '@/lib/dates';
import styles from './Layout.module.css';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  const todayFormatted = getFullDateLabel(formatDateISO(new Date()));

  return (
    <header className={styles.header}>
      <button className={styles.mobileMenuBtn} onClick={onMenuToggle} aria-label="Toggle Menu">
        <Menu size={24} />
      </button>
      
      <h1 className={styles.pageTitle}>{title}</h1>
      
      <div className={styles.headerRight}>
        <div className={styles.dateDisplay}>
          {todayFormatted}
        </div>
      </div>
    </header>
  );
};
