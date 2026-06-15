import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useNutrition } from '@/hooks/useNutrition';
import { MacroBar } from '@/components/MacroBar/MacroBar';
import { getFullDateLabel, formatDateISO } from '@/lib/dates';
import { Meal } from '@/types';
import styles from './daily-log.module.css';

export const DailyLogPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  
  // Date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = formatDateISO(selectedDate);

  // Hook metrics for the selected date
  const { totals, remaining, percentages, loggedMeals } = useDailyProgress(dateStr);
  const { targets } = useNutrition();

  // Search/Select meal state
  const [selectedMealId, setSelectedMealId] = useState('');

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddMealLog = () => {
    if (!selectedMealId) return alert('Selecione uma refeição');
    
    // Find meal
    const meal = state.meals.find(m => m.id === selectedMealId);
    if (!meal) return;

    dispatch({
      type: 'LOG_MEAL',
      payload: {
        date: dateStr,
        entry: {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mealId: meal.id,
          timestamp: new Date().toISOString(), // Or set to correct hour if we want
          isFreeMeal: false
        }
      }
    });

    // Reset selector
    setSelectedMealId('');
  };

  const handleDeleteLog = (entryId: string) => {
    dispatch({
      type: 'REMOVE_LOG_ENTRY',
      payload: {
        date: dateStr,
        entryId
      }
    });
  };

  const handleToggleFreeMeal = (entryId: string) => {
    dispatch({
      type: 'TOGGLE_LOG_ENTRY_FREE',
      payload: {
        date: dateStr,
        entryId
      }
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      {/* Date Navigation */}
      <div className={styles.dateNav}>
        <button className={styles.navBtn} onClick={handlePrevDay} title="Dia Anterior">
          <ChevronLeft size={20} />
        </button>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span className={styles.dateLabel}>{getFullDateLabel(dateStr)}</span>
          {dateStr !== formatDateISO(new Date()) && (
            <button 
              onClick={handleSetToday}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
            >
              Ir para Hoje
            </button>
          )}
        </div>

        <button className={styles.navBtn} onClick={handleNextDay} title="Próximo Dia">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Daily Progress Bars */}
      <div className={styles.progressGrid}>
        <div className={`glass-panel ${styles.progressCard}`}>
          <MacroBar label="Calorias" value={totals.kcal} target={targets.kcal} type="kcal" unit=" kcal" />
        </div>
        <div className={`glass-panel ${styles.progressCard}`}>
          <MacroBar label="Carboidratos" value={totals.carbs} target={targets.carbs} type="carbs" unit="g" />
        </div>
        <div className={`glass-panel ${styles.progressCard}`}>
          <MacroBar label="Proteínas" value={totals.protein} target={targets.protein} type="protein" unit="g" />
        </div>
        <div className={`glass-panel ${styles.progressCard}`}>
          <MacroBar label="Gorduras" value={totals.fat} target={targets.fat} type="fat" unit="g" />
        </div>
      </div>

      <div className={styles.logSection}>
        {/* Timeline Panel */}
        <div className={`glass-panel ${styles.timelinePanel}`}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={20} style={{ color: 'var(--accent-primary)' }} />
            Timeline do Dia
          </h2>

          {loggedMeals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhuma refeição registrada para este dia.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Use o painel lateral para registrar uma refeição.</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {loggedMeals.map(({ entry, meal }) => {
                if (!meal) return null;
                return (
                  <div className={styles.timelineItem} key={entry.id}>
                    <div className={`${styles.timelineDot} ${entry.isFreeMeal ? styles.timelineDotFree : styles.timelineDotActive}`} />
                    
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTime}>{formatTime(entry.timestamp)}</span>
                    </div>

                    <div className={styles.logCard}>
                      <div className={styles.logInfo}>
                        <div>
                          <h4 className={styles.mealName}>{meal.name}</h4>
                          <p className={styles.mealMacros}>
                            {Math.round(meal.totalKcal)} kcal • C: {Math.round(meal.totalCarbs)}g P: {Math.round(meal.totalProtein)}g G: {Math.round(meal.totalFat)}g
                          </p>
                        </div>
                      </div>

                      <div className={styles.logActions}>
                        <label className={styles.freeToggle}>
                          <input
                            type="checkbox"
                            checked={entry.isFreeMeal}
                            onChange={() => handleToggleFreeMeal(entry.id)}
                          />
                          <span>Refeição Livre (Cheat Meal)</span>
                        </label>

                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteLog(entry.id)}
                          title="Excluir Registro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Log Side Panel */}
        <div className={`glass-panel ${styles.quickPanel}`}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Registrar Refeição</h2>
          
          {state.meals.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Nenhuma refeição cadastrada no banco. Crie primeiro na página "Banco de Refeições".
            </div>
          ) : (
            <div className={styles.mealSelectGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className={styles.formLabel} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Selecione a refeição do banco:
                </span>
                <select
                  className={styles.selectInput}
                  value={selectedMealId}
                  onChange={(e) => setSelectedMealId(e.target.value)}
                >
                  <option value="">-- Escolha --</option>
                  {state.meals.map(meal => (
                    <option key={meal.id} value={meal.id}>
                      [{meal.type.toUpperCase()}] {meal.name} ({Math.round(meal.totalKcal)} kcal)
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className={styles.addBtn}
                onClick={handleAddMealLog}
                disabled={!selectedMealId}
              >
                <Plus size={16} />
                <span>Registrar neste dia</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
