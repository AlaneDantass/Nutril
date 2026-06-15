import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Meal, Ingredient } from '@/types';
import styles from './MealCard.module.css';

interface MealCardProps {
  meal: Meal;
  ingredients: Ingredient[];
  onLog?: (meal: Meal) => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  ingredients,
  onLog,
  onEdit,
  onDelete
}) => {
  const getIngredientName = (id: string) => {
    return ingredients.find((ing) => ing.id === id)?.name || 'Ingrediente Desconhecido';
  };

  const getMealTypeLabel = (type: Meal['type']) => {
    switch (type) {
      case 'cafe': return 'Café da Manhã';
      case 'almoco': return 'Almoço';
      case 'jantar': return 'Jantar';
      case 'lanche': return 'Lanche';
      default: return type;
    }
  };

  return (
    <div className={`glass-panel glass-panel-hover ${styles.card}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{meal.name}</h3>
        <span className={`${styles.typeBadge} ${styles[meal.type]}`}>
          {getMealTypeLabel(meal.type)}
        </span>
      </div>

      <ul className={styles.itemsList}>
        {meal.items.map((item, idx) => (
          <li key={`${meal.id}-item-${idx}`} className={styles.item}>
            <span className={styles.itemName}>{getIngredientName(item.ingredientId)}</span>
            <span className={styles.itemWeight}>{item.quantityGrams}g</span>
          </li>
        ))}
      </ul>

      {meal.tags && meal.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {meal.tags.map((tag, idx) => (
            <span key={`${meal.id}-tag-${idx}`} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.macrosGrid}>
        <div>
          <span className={styles.macroLabel}>Kcal</span>
          <span className={`${styles.macroValue} ${styles.kcalVal}`}>{Math.round(meal.totalKcal)}</span>
        </div>
        <div>
          <span className={styles.macroLabel}>Carb</span>
          <span className={`${styles.macroValue} ${styles.carbVal}`}>{Math.round(meal.totalCarbs)}g</span>
        </div>
        <div>
          <span className={styles.macroLabel}>Prot</span>
          <span className={`${styles.macroValue} ${styles.protVal}`}>{Math.round(meal.totalProtein)}g</span>
        </div>
        <div>
          <span className={styles.macroLabel}>Gord</span>
          <span className={`${styles.macroValue} ${styles.fatVal}`}>{Math.round(meal.totalFat)}g</span>
        </div>
      </div>

      <div className={styles.actions}>
        {onLog && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onLog(meal)}>
            <Plus size={14} />
            <span>Registrar</span>
          </button>
        )}
        
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: '6px', flex: onLog ? '0' : '1' }}>
            {onEdit && (
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={() => onEdit(meal)} 
                title="Editar Refeição"
                style={{ padding: '8px' }}
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={() => onDelete(meal)}
                title="Excluir Refeição"
                style={{ padding: '8px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
