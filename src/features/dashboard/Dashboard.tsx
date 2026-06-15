import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Plus, Trash2, CalendarDays, Sparkles, AlertTriangle } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useFreeMeals } from '@/hooks/useFreeMeals';
import { useNutrition } from '@/hooks/useNutrition';
import { MacroBar } from '@/components/MacroBar/MacroBar';
import { formatDateISO } from '@/lib/dates';
import { Meal } from '@/types';
import styles from './dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useNutril();
  const todayStr = formatDateISO(new Date());
  
  const { totals, remaining, percentages } = useDailyProgress(todayStr);
  const { targets } = useNutrition();
  const { usedThisWeek, limit: freeMealsLimit, isOverLimit } = useFreeMeals();

  const loggedEntries = state.dailyLogs.find(l => l.date === todayStr)?.entries || [];

  const handleQuickAdd = (meal: Meal) => {
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
  };

  const handleDeleteLog = (entryId: string) => {
    dispatch({
      type: 'REMOVE_LOG_ENTRY',
      payload: {
        date: todayStr,
        entryId
      }
    });
  };

  // Helper to format ISO timestamp to HH:MM local time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.grid}>
      {/* Left Column: Progress and widgets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Caloric Intake Summary Card */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.sectionTitle}>
            <CalendarDays size={20} className={styles.iconActive} />
            Resumo de Hoje
          </h2>
          
          <div className={styles.summaryWidget}>
            <div className={styles.summaryText}>
              <span className={styles.summaryLabel}>Calorias Consumidas</span>
              <span className={styles.summaryNumber}>{totals.kcal} kcal</span>
            </div>
            <div className={styles.summaryText} style={{ textAlign: 'right' }}>
              <span className={styles.summaryLabel}>Meta Diária</span>
              <span className={styles.summaryLabel} style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {targets.kcal} kcal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <MacroBar 
              label="Calorias" 
              value={totals.kcal} 
              target={targets.kcal} 
              type="kcal" 
              unit=" kcal" 
            />
            <MacroBar 
              label="Carboidratos" 
              value={totals.carbs} 
              target={targets.carbs} 
              type="carbs" 
              unit="g" 
            />
            <MacroBar 
              label="Proteínas" 
              value={totals.protein} 
              target={targets.protein} 
              type="protein" 
              unit="g" 
            />
            <MacroBar 
              label="Gorduras" 
              value={totals.fat} 
              target={targets.fat} 
              type="fat" 
              unit="g" 
            />
          </div>
        </div>

        {/* Free Meals / cheat meals widget */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={20} style={{ color: 'var(--color-carbs)' }} />
            Refeições Livres da Semana
          </h2>
          
          <div className={styles.freeMealWidget}>
            <div className={styles.freeMealCount}>
              <span className={styles.freeMealValue}>{usedThisWeek}</span>
              <span className={styles.freeMealLimit}>/ {freeMealsLimit} consumidas</span>
            </div>

            {isOverLimit ? (
              <span className={styles.freeMealAlert}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                Limite excedido!
              </span>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Você ainda tem {freeMealsLimit - usedThisWeek} livres
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-8px' }}>
            Regule suas refeições livres no menu lateral para manter o equilíbrio semanal.
          </p>
        </div>

        {/* Quick Decision Widget */}
        <div className={styles.quickDecideBanner}>
          <div className={styles.bannerInfo}>
            <span className={styles.bannerTitle}>Decisão Rápida</span>
            <span className={styles.bannerDesc}>
              Deixe o app sugerir o que comer com base no que ainda resta de carbo/proteína/gordura para hoje!
            </span>
          </div>
          <Link to="/quick-decide" className={`${styles.bannerBtn} pulse-glow`}>
            <Zap size={14} />
            Decidir
          </Link>
        </div>

      </div>

      {/* Right Column: Daily logs and quick additions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Daily timeline logs */}
        <div className={`glass-panel ${styles.panel}`} style={{ minHeight: '340px' }}>
          <h2 className={styles.sectionTitle}>Refeições Consumidas</h2>
          
          {loggedEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <CalendarDays size={40} style={{ strokeWidth: 1 }} />
              <span>Nenhuma refeição registrada para hoje.</span>
              <span style={{ fontSize: '12px' }}>Use o painel abaixo para adicionar rapidamente.</span>
            </div>
          ) : (
            <div className={styles.timeline}>
              {loggedEntries.map((entry) => {
                const meal = state.meals.find(m => m.id === entry.mealId);
                if (!meal) return null;
                
                return (
                  <div className={styles.timelineItem} key={entry.id}>
                    <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTime}>{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineInfo}>
                        <span className={styles.timelineMealName}>
                          {meal.name}
                          {entry.isFreeMeal && <span className={styles.freeMealBadge}>Livre</span>}
                        </span>
                        <span className={styles.timelineMacros}>
                          {Math.round(meal.totalKcal)} kcal | C: {Math.round(meal.totalCarbs)}g P: {Math.round(meal.totalProtein)}g G: {Math.round(meal.totalFat)}g
                        </span>
                      </div>
                      <button 
                        className={styles.timelineDeleteBtn} 
                        onClick={() => handleDeleteLog(entry.id)}
                        title="Remover do diário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Panel */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.sectionTitle}>
            Adicionar Rápido
          </h2>
          
          <div className={styles.quickAddList}>
            {state.meals.map((meal) => (
              <div className={styles.quickAddCard} key={meal.id}>
                <div className={styles.quickAddInfo}>
                  <span className={styles.quickAddName}>{meal.name}</span>
                  <span className={styles.quickAddMacros}>
                    {Math.round(meal.totalKcal)} kcal • C: {Math.round(meal.totalCarbs)}g P: {Math.round(meal.totalProtein)}g
                  </span>
                </div>
                <button 
                  className={styles.quickAddBtn} 
                  onClick={() => handleQuickAdd(meal)}
                  title="Adicionar ao dia de hoje"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
