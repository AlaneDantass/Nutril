import React from 'react';
import { Sparkles, CalendarDays, Settings, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useNutril } from '@/app/providers/NutrilProvider';
import { useFreeMeals } from '@/hooks/useFreeMeals';
import { getMondayOfDate, getWeekDays, getWeekdayLabel, getShortDateLabel } from '@/lib/dates';
import styles from './free-meals.module.css';

export const FreeMealsPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const { limit, usedThisWeek, remaining, isOverLimit, history } = useFreeMeals();

  // Get current week details
  const currentMonday = getMondayOfDate(new Date());
  const currentWeekDays = getWeekDays(currentMonday);

  // Find the plan for this week to see which days are flagged as isFreeMeal
  const currentWeekPlan = state.weekPlans.find(wp => wp.weekStart === currentMonday);

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    dispatch({
      type: 'UPDATE_GOALS',
      payload: {
        ...state.userGoals,
        freeMealsPerWeek: val
      }
    });
  };

  const handleToggleDayFlag = (date: string) => {
    dispatch({
      type: 'TOGGLE_FREE_MEAL_DAY',
      payload: { date }
    });
  };

  // Custom tooltip styling for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600' }}>Semana de {payload[0].payload.label}</p>
          <p style={{ color: 'var(--color-carbs)', fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>
            {payload[0].value} refeições livres
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      
      {/* Top row: budget setter & current counter */}
      <div className={styles.topRow}>
        
        {/* Budget config card */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>
            <Settings size={20} style={{ color: 'var(--text-secondary)' }} />
            Configurar Meta Semanal
          </h2>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Refeições Livres Permitidas por Semana</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="0"
                max="14"
                className={styles.numberInput}
                value={limit}
                onChange={handleLimitChange}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                refeições por semana
              </span>
            </div>
          </div>
          
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Uma refeição livre não significa o dia inteiro "fora". Registre instâncias de cheat meals na timeline diária e compare com o seu limite aqui.
          </p>
        </div>

        {/* Counter indicator */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>
            <Sparkles size={20} style={{ color: 'var(--color-carbs)' }} />
            Uso esta Semana
          </h2>

          <div className={styles.countWidget}>
            <span className={styles.countLabel}>Refeições Consumidas</span>
            <span className={styles.countNumber}>{usedThisWeek} / {limit}</span>
          </div>

          {isOverLimit ? (
            <div className={styles.overLimitAlert}>
              <AlertTriangle size={18} />
              <span>Você ultrapassou seu limite planejado de refeições livres por {usedThisWeek - limit}!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600' }}>
              <ShieldCheck size={18} />
              <span>Você está dentro do planejado. Restam {remaining} refeições livres.</span>
            </div>
          )}
        </div>

      </div>

      {/* Center: Interactive week calendar selection */}
      <div className={`glass-panel ${styles.panel}`}>
        <h2 className={styles.title}>
          <CalendarDays size={20} style={{ color: 'var(--accent-primary)' }} />
          Planejamento Semanal de Refeições Livres
        </h2>
        
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-8px' }}>
          Selecione quais dias você planeja fazer suas refeições livres. Clique para marcar/desmarcar.
        </p>

        <div className={styles.calendarGrid}>
          {currentWeekDays.map((date) => {
            const dayPlan = currentWeekPlan?.days.find(d => d.date === date);
            const isFlagged = dayPlan?.isFreeMeal || false;
            
            return (
              <div 
                key={date}
                className={`${styles.dayCard} ${isFlagged ? styles.activeDayCard : ''}`}
                onClick={() => handleToggleDayFlag(date)}
              >
                <span className={styles.dayName}>{getWeekdayLabel(date)}</span>
                <span className={styles.dayDate}>{getShortDateLabel(date)}</span>
                <Sparkles 
                  size={16} 
                  style={{ 
                    marginTop: '4px',
                    color: isFlagged ? 'var(--color-carbs)' : 'transparent',
                    stroke: isFlagged ? 'var(--color-carbs)' : 'var(--border-subtle)' 
                  }} 
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Historical chart Recharts */}
      <div className={`glass-panel ${styles.panel}`}>
        <h2 className={styles.title}>Histórico de Uso (Últimas 8 semanas)</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar 
                dataKey="count" 
                fill="var(--color-carbs)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
