import React from 'react';
import { Zap, HelpCircle, AlertTriangle, CalendarDays, Smile } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useNutrition } from '@/hooks/useNutrition';
import { MealCard } from '@/components/MealCard/MealCard';
import { formatDateISO } from '@/lib/dates';
import { Meal } from '@/types';
import styles from './quick-decide.module.css';

export const QuickDecidePage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const todayStr = formatDateISO(new Date());

  const { totals } = useDailyProgress(todayStr);
  const { targets } = useNutrition();

  // Calculate remaining macros for today
  const kcalRemaining = Math.max(0, targets.kcal - totals.kcal);
  const carbsRemaining = Math.max(0, targets.carbs - totals.carbs);
  const proteinRemaining = Math.max(0, targets.protein - totals.protein);
  const fatRemaining = Math.max(0, targets.fat - totals.fat);

  // Find meals that fit within the remaining macros
  const fittingMeals = state.meals.filter((meal) => {
    return (
      meal.totalKcal <= kcalRemaining &&
      meal.totalCarbs <= carbsRemaining &&
      meal.totalProtein <= proteinRemaining &&
      meal.totalFat <= fatRemaining
    );
  });

  const handleLogMeal = (meal: Meal) => {
    dispatch({
      type: 'LOG_MEAL',
      payload: {
        date: todayStr,
        entry: {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mealId: meal.id,
          timestamp: new Date().toISOString(),
          isFreeMeal: false
        }
      }
    });
    alert(`"${meal.name}" registrada no diário de hoje!`);
  };

  return (
    <div className={styles.container}>
      {/* Remaining macros display */}
      <div className={styles.remainingRow}>
        <div className={styles.remainingCard}>
          <span className={styles.remainingLabel}>Calorias Restantes</span>
          <span className={`${styles.remainingValue} ${styles.kcalVal}`}>{kcalRemaining} kcal</span>
        </div>
        <div className={styles.remainingCard}>
          <span className={styles.remainingLabel}>Carbos Restantes</span>
          <span className={`${styles.remainingValue} ${styles.carbVal}`}>{carbsRemaining.toFixed(1)}g</span>
        </div>
        <div className={styles.remainingCard}>
          <span className={styles.remainingLabel}>Proteína Restante</span>
          <span className={`${styles.remainingValue} ${styles.protVal}`}>{proteinRemaining.toFixed(1)}g</span>
        </div>
        <div className={styles.remainingCard}>
          <span className={styles.remainingLabel}>Gordura Restante</span>
          <span className={`${styles.remainingValue} ${styles.fatVal}`}>{fatRemaining.toFixed(1)}g</span>
        </div>
      </div>

      {/* Main decisions panel */}
      {fittingMeals.length > 0 ? (
        <>
          <div className={styles.suggestionsHeader}>
            <h2 className={styles.title}>
              <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
              Refeições Recomendadas
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Encontramos {fittingMeals.length} refeições que cabem no seu orçamento.
            </span>
          </div>

          <div className={styles.grid}>
            {fittingMeals.map((meal, index) => {
              // Highlight the top 2 matching meals as featured
              const isFeatured = index < 2;
              return (
                <div key={meal.id} className={isFeatured ? styles.highlightCard : ''} style={{ borderRadius: 'var(--radius-md)' }}>
                  <MealCard
                    meal={meal}
                    ingredients={state.ingredients}
                    onLog={handleLogMeal}
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Empty/low budget state with custom tips */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={`glass-panel ${styles.emptyState}`}>
            <AlertTriangle size={48} style={{ color: 'var(--color-warning)', strokeWidth: 1.5 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Nenhuma refeição inteira cabe nos seus macros!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Seus macros restantes são muito baixos para comportar as refeições completas do seu banco.
              </p>
            </div>
          </div>

          <div className={styles.tipCard}>
            <h4 className={styles.tipTitle}>
              <HelpCircle size={16} />
              O que fazer agora?
            </h4>
            <div className={styles.tipText}>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Fracione uma refeição:</strong> Prepare meia porção de alguma das refeições do seu banco de refeições (ex: 75g de arroz com 60g de frango ao invés de uma porção inteira).
                </li>
                <li>
                  <strong>Ingredientes avulsos:</strong> Vá para a página de Ingredientes e consuma algum item isolado (ex: apenas uma maçã ou 30g de whey protein batido com água).
                </li>
                <li>
                  <strong>Mantenha a calma:</strong> Lembre-se que o princípio do Nutril é a <strong>adesão</strong> a longo prazo. Se ultrapassar um pouco hoje, ajuste amanhã de forma equilibrada sem culpa!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
