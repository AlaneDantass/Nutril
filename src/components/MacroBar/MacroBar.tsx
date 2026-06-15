import React from 'react';
import styles from './MacroBar.module.css';

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  type: 'carbs' | 'protein' | 'fat' | 'kcal';
  unit: string;
}

export const MacroBar: React.FC<MacroBarProps> = ({ label, value, target, type, unit }) => {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
  const clampedPercentage = Math.min(100, percentage);
  const exceeded = value > target;
  const remaining = Math.max(0, target - value);

  return (
    <div className={`${styles.container} ${styles[type]} ${exceeded ? styles.exceeded : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.values}>
          {value.toFixed(0)}{unit} / {target.toFixed(0)}{unit}
        </span>
      </div>
      
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      <div className={styles.footer}>
        <span>{percentage}%</span>
        <span>
          {exceeded 
            ? `Excedeu por ${(value - target).toFixed(0)}${unit}` 
            : `Restam ${remaining.toFixed(0)}${unit}`
          }
        </span>
      </div>
    </div>
  );
};
