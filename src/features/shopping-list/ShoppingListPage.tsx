import React, { useState, useMemo } from 'react';
import { ShoppingCart, Copy, Plus, Check, X, ClipboardList } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { getMondayOfDate, getWeekDays, getShortDateLabel } from '@/lib/dates';
import { Ingredient } from '@/types';
import styles from './shopping-list.module.css';

interface ShoppingItem {
  ingredient: Ingredient;
  totalGrams: number;
}

interface ExtraItem {
  id: string;
  name: string;
  checked: boolean;
}

export const ShoppingListPage: React.FC = () => {
  const { state } = useNutril();
  const [copied, setCopied] = useState(false);
  
  // Checking off list items state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  
  // Extra manual items state
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [newExtraName, setNewExtraName] = useState('');

  // 1. Compile ingredients from current week plan
  const currentMondayStr = getMondayOfDate(new Date());
  const currentPlan = state.weekPlans.find(wp => wp.weekStart === currentMondayStr);

  const shoppingList = useMemo((): ShoppingItem[] => {
    if (!currentPlan) return [];

    const ingredientWeights: Record<string, number> = {};

    // For each day in the plan
    for (const day of currentPlan.days) {
      // For each slot (cafe, almoco, jantar, lanche)
      for (const slotKey in day.slots) {
        const mealId = day.slots[slotKey as keyof typeof day.slots];
        if (mealId) {
          const meal = state.meals.find(m => m.id === mealId);
          if (meal) {
            // Sum all ingredients in the meal
            for (const item of meal.items) {
              ingredientWeights[item.ingredientId] = (ingredientWeights[item.ingredientId] || 0) + item.quantityGrams;
            }
          }
        }
      }
    }

    // Convert Record to Array of items
    return Object.entries(ingredientWeights)
      .map(([id, weight]) => {
        const ingredient = state.ingredients.find(ing => ing.id === id);
        return {
          ingredient: ingredient!,
          totalGrams: Math.round(weight)
        };
      })
      .filter(item => item.ingredient !== undefined); // filter out deleted ingredients
  }, [currentPlan, state.meals, state.ingredients]);

  // Group items by category
  const groupedList = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of shoppingList) {
      const category = item.ingredient.category || 'Outros';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    }
    return groups;
  }, [shoppingList]);

  // Toggle checklist
  const handleToggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extra manual items handlers
  const handleAddExtraItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName.trim()) return;

    setExtraItems(prev => [
      ...prev,
      {
        id: `extra-${Date.now()}`,
        name: newExtraName.trim(),
        checked: false
      }
    ]);
    setNewExtraName('');
  };

  const handleToggleExtraItem = (id: string) => {
    setExtraItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDeleteExtraItem = (id: string) => {
    setExtraItems(prev => prev.filter(item => item.id !== id));
  };

  // Copy to clipboard formatting
  const handleCopyClipboard = () => {
    let text = `🛒 LISTA DE COMPRAS - NUTRIL\n${getWeekRangeLabel()}\n\n`;

    Object.entries(groupedList).forEach(([category, items]) => {
      text += `[${category.toUpperCase()}]\n`;
      items.forEach(item => {
        const isChecked = checkedIngredients[item.ingredient.id] ? '[x]' : '[ ]';
        text += `${isChecked} ${item.ingredient.name}: ${item.totalGrams}g\n`;
      });
      text += '\n';
    });

    if (extraItems.length > 0) {
      text += `[OUTROS ITENS]\n`;
      extraItems.forEach(item => {
        const isChecked = item.checked ? '[x]' : '[ ]';
        text += `${isChecked} ${item.name}\n`;
      });
      text += '\n';
    }

    text += `Gerado automaticamente via Nutril.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getWeekRangeLabel = () => {
    const weekDays = getWeekDays(currentMondayStr);
    const startStr = getShortDateLabel(weekDays[0]);
    const endStr = getShortDateLabel(weekDays[6]);
    return `Semana de ${startStr} a ${endStr}`;
  };

  const hasItems = shoppingList.length > 0 || extraItems.length > 0;

  return (
    <div className={styles.container}>
      
      {/* Header section */}
      <div className={styles.headerRow}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{getWeekRangeLabel()}</span>
        </div>

        {hasItems && (
          <button className={styles.actionBtn} onClick={handleCopyClipboard}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto para WhatsApp'}</span>
          </button>
        )}
      </div>

      {!hasItems ? (
        <div className={`glass-panel ${styles.emptyState}`} style={{ padding: '60px 20px' }}>
          <ClipboardList size={48} style={{ strokeWidth: 1.5, color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Sua lista de compras está vazia!</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '8px auto 0' }}>
            Planeje suas refeições na aba "Plano Semanal" e o app compilará todos os ingredientes e pesos necessários automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className={styles.listGrid}>
          {/* Loop over grouped category panels */}
          {Object.entries(groupedList).map(([category, items]) => (
            <div key={category} className={`glass-panel ${styles.categoryCard}`}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.itemsList}>
                {items.map(item => {
                  const isChecked = checkedIngredients[item.ingredient.id] || false;
                  return (
                    <label 
                      key={item.ingredient.id} 
                      className={`${styles.itemRow} ${isChecked ? styles.itemChecked : ''}`}
                      onClick={() => handleToggleIngredient(item.ingredient.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                      />
                      <span className={styles.itemName}>{item.ingredient.name}</span>
                      <span className={styles.itemWeight}>
                        {item.totalGrams >= 1000 
                          ? `${(item.totalGrams / 1000).toFixed(2)} kg` 
                          : `${item.totalGrams}g`
                        }
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual extra section */}
      <div className={`glass-panel ${styles.extraSection}`}>
        <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Adicionar Itens Extras</h3>
        
        <form onSubmit={handleAddExtraItem} className={styles.inputRow}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Ex: Sal, Papel Toalha, Sacola..."
            value={newExtraName}
            onChange={e => setNewExtraName(e.target.value)}
          />
          <button type="submit" className={styles.addBtn}>
            <Plus size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            Adicionar
          </button>
        </form>

        {extraItems.length > 0 && (
          <div className={styles.extraItemsGrid}>
            {extraItems.map(item => (
              <div 
                key={item.id} 
                className={`${styles.extraItemCard} ${item.checked ? styles.itemChecked : ''}`}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleToggleExtraItem(item.id)}
              >
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  readOnly 
                  style={{ accentColor: 'var(--accent-primary)', width: '14px', height: '14px' }} 
                />
                <span className={styles.itemName}>{item.name}</span>
                <button 
                  type="button" 
                  className={styles.deleteExtraBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteExtraItem(item.id);
                  }}
                  title="Excluir item"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
