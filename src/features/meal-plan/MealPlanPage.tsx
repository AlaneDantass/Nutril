import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, AlertCircle } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { useNutrition } from '@/hooks/useNutrition';
import { getMondayOfDate, getWeekDays, getWeekdayLabel, getShortDateLabel, formatDateISO } from '@/lib/dates';
import { WeekPlan, Meal, DayPlan } from '@/types';
import styles from './meal-plan.module.css';

export const MealPlanPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const { targets } = useNutrition();

  // Selected week start date string (Monday)
  const [currentMondayStr, setCurrentMondayStr] = useState(() => getMondayOfDate(new Date()));

  // Active selection modal state
  const [activeSlot, setActiveSlot] = useState<{ date: string; slotKey: keyof DayPlan['slots'] } | null>(null);

  const weekDays = getWeekDays(currentMondayStr);

  // Find the plan for this week, or construct a temporary blank one
  const currentPlan: WeekPlan = state.weekPlans.find(wp => wp.weekStart === currentMondayStr) || {
    id: `plan-${currentMondayStr}`,
    weekStart: currentMondayStr,
    days: weekDays.map(date => ({
      date,
      slots: { cafe: null, almoco: null, jantar: null, lanche: null },
      isFreeMeal: false
    }))
  };

  const handlePrevWeek = () => {
    const d = new Date(currentMondayStr + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setCurrentMondayStr(getMondayOfDate(d));
  };

  const handleNextWeek = () => {
    const d = new Date(currentMondayStr + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setCurrentMondayStr(getMondayOfDate(d));
  };

  const handleSetCurrentWeek = () => {
    setCurrentMondayStr(getMondayOfDate(new Date()));
  };

  // Open selection modal for a specific day slot
  const handleOpenSelector = (date: string, slotKey: keyof DayPlan['slots']) => {
    setActiveSlot({ date, slotKey });
  };

  const handleCloseSelector = () => {
    setActiveSlot(null);
  };

  // Update a specific slot in the plan
  const handleSelectMeal = (mealId: string | null) => {
    if (!activeSlot) return;
    const { date, slotKey } = activeSlot;

    const updatedDays = currentPlan.days.map(day => {
      if (day.date === date) {
        return {
          ...day,
          slots: {
            ...day.slots,
            [slotKey]: mealId
          }
        };
      }
      return day;
    });

    const updatedPlan: WeekPlan = {
      ...currentPlan,
      days: updatedDays
    };

    dispatch({ type: 'SET_WEEK_PLAN', payload: updatedPlan });
    handleCloseSelector();
  };

  const handleClearSlot = (e: React.MouseEvent, date: string, slotKey: keyof DayPlan['slots']) => {
    e.stopPropagation(); // Avoid triggering open selector modal
    
    const updatedDays = currentPlan.days.map(day => {
      if (day.date === date) {
        return {
          ...day,
          slots: {
            ...day.slots,
            [slotKey]: null
          }
        };
      }
      return day;
    });

    const updatedPlan: WeekPlan = {
      ...currentPlan,
      days: updatedDays
    };

    dispatch({ type: 'SET_WEEK_PLAN', payload: updatedPlan });
  };

  // Calculate total calories planned for a specific day plan
  const calculateDayPlanKcal = (dayPlan: DayPlan) => {
    let total = 0;
    const mealIds = Object.values(dayPlan.slots).filter(id => id !== null) as string[];
    
    for (const id of mealIds) {
      const meal = state.meals.find(m => m.id === id);
      if (meal) total += meal.totalKcal;
    }
    return Math.round(total);
  };

  // Format week range label (e.g. "15 Jun a 21 Jun")
  const getWeekRangeLabel = () => {
    const mondayStr = getShortDateLabel(weekDays[0]);
    const sundayStr = getShortDateLabel(weekDays[6]);
    return `Semana de ${mondayStr} a ${sundayStr}`;
  };

  return (
    <div className={styles.container}>
      {/* Navigation and Actions */}
      <div className={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className={styles.navBtn} onClick={handlePrevWeek} title="Semana Anterior">
            <ChevronLeft size={18} />
          </button>
          
          <span className={styles.dateLabel} style={{ fontSize: '15px' }}>{getWeekRangeLabel()}</span>
          
          <button className={styles.navBtn} onClick={handleNextWeek} title="Próxima Semana">
            <ChevronRight size={18} />
          </button>
        </div>

        {currentMondayStr !== getMondayOfDate(new Date()) && (
          <button 
            className={`${styles.filterBtn} ${styles.activeFilterBtn}`}
            onClick={handleSetCurrentWeek}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Semana Atual
          </button>
        )}
      </div>

      {/* Week Grid */}
      <div className={styles.weeklyGrid}>
        {weekDays.map((date) => {
          const dayPlan = currentPlan.days.find(d => d.date === date) || {
            date,
            slots: { cafe: null, almoco: null, jantar: null, lanche: null },
            isFreeMeal: false
          };
          
          const dayKcal = calculateDayPlanKcal(dayPlan);
          const isToday = date === formatDateISO(new Date());

          // Feedback style depending on macro match
          // ok is within 150 kcal of target
          const difference = dayKcal - targets.kcal;
          const isOk = Math.abs(difference) <= 150;
          const isOver = difference > 150;
          
          let totalsClass = '';
          let totalsLabel = '';

          if (dayKcal > 0) {
            if (isOk) {
              totalsClass = styles.dayTotalsOk;
              totalsLabel = 'No Alvo';
            } else if (isOver) {
              totalsClass = styles.dayTotalsOver;
              totalsLabel = `Excedeu +${difference}kcal`;
            } else {
              totalsClass = styles.dayTotalsOk;
              totalsLabel = `Déficit ${difference}kcal`;
            }
          }

          return (
            <div 
              key={date} 
              className={`${styles.dayColumn} ${isToday ? styles.activeDayColumn : ''}`}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{getWeekdayLabel(date)}</span>
                <span className={styles.dayDate}>{getShortDateLabel(date)}</span>
                {dayKcal > 0 ? (
                  <div className={`${styles.dayTotals} ${totalsClass}`}>
                    {dayKcal} kcal • {totalsLabel}
                  </div>
                ) : (
                  <div className={styles.dayTotals} style={{ color: 'var(--text-muted)' }}>
                    Sem planos
                  </div>
                )}
              </div>

              {/* Slots List */}
              <div className={styles.slotsList}>
                {(Object.keys(dayPlan.slots) as Array<keyof DayPlan['slots']>).map((slotKey) => {
                  const mealId = dayPlan.slots[slotKey];
                  const plannedMeal = state.meals.find(m => m.id === mealId);
                  
                  const slotLabel = slotKey === 'cafe' ? 'Café' :
                                    slotKey === 'almoco' ? 'Almoço' :
                                    slotKey === 'jantar' ? 'Jantar' : 'Lanches';

                  return (
                    <div key={slotKey} className={styles.slot}>
                      <span className={styles.slotLabel}>{slotLabel}</span>
                      
                      {plannedMeal ? (
                        <div 
                          className={`${styles.slotCard} ${styles.slotCardFilled}`}
                          onClick={() => handleOpenSelector(date, slotKey)}
                        >
                          <span className={styles.plannedMealName}>{plannedMeal.name}</span>
                          <span className={styles.plannedMealKcal}>
                            {Math.round(plannedMeal.totalKcal)} kcal
                          </span>
                          <button 
                            className={styles.removeSlotBtn}
                            onClick={(e) => handleClearSlot(e, date, slotKey)}
                            title="Remover refeição"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={styles.slotCard}
                          onClick={() => handleOpenSelector(date, slotKey)}
                        >
                          <span className={styles.emptySlotText}>
                            <Plus size={11} />
                            <span>Vazio</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Meal Dialog Modal */}
      {activeSlot && (
        <div className={styles.modalOverlay} onClick={handleCloseSelector}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Escolha a Refeição</h3>
              <button className={styles.closeBtn} onClick={handleCloseSelector}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {state.meals.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  Nenhuma refeição cadastrada no banco. Crie primeiro no menu "Banco de Refeições".
                </div>
              ) : (
                <>
                  {state.meals
                    .filter(m => m.type === activeSlot.slotKey || activeSlot.slotKey === 'lanche')
                    .map((meal) => (
                      <div 
                        key={meal.id} 
                        className={styles.mealOption}
                        onClick={() => handleSelectMeal(meal.id)}
                      >
                        <span className={styles.mealOptionName}>{meal.name}</span>
                        <span className={styles.mealOptionKcal}>{Math.round(meal.totalKcal)} kcal</span>
                      </div>
                    ))}
                  
                  {/* Option to show all meals if filtered is empty or they want options */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Todas as refeições:
                    </span>
                    {state.meals
                      .filter(m => m.type !== activeSlot.slotKey && activeSlot.slotKey !== 'lanche')
                      .map((meal) => (
                        <div 
                          key={meal.id} 
                          className={styles.mealOption}
                          onClick={() => handleSelectMeal(meal.id)}
                          style={{ marginBottom: '6px', opacity: 0.7 }}
                        >
                          <span className={styles.mealOptionName}>{meal.name}</span>
                          <span className={styles.mealOptionKcal}>{Math.round(meal.totalKcal)} kcal</span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
