import React, { useState } from 'react';
import { Scale, Trash2, CalendarDays, LineChart as ChartIcon, Plus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useNutril } from '@/app/providers/NutrilProvider';
import { getShortDateLabel, formatDateISO } from '@/lib/dates';
import { Measurement } from '@/types';
import styles from './measurements.module.css';

export const MeasurementsPage: React.FC = () => {
  const { state, dispatch } = useNutril();

  // Form states
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => formatDateISO(new Date()));
  const [notes, setNotes] = useState('');

  // Handle adding weight measurement
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 0) return alert('Insira um peso válido');

    const newMeasurement: Measurement = {
      id: `meas-${Date.now()}`,
      date,
      weight: weightVal,
      notes: notes.trim() ? notes.trim() : undefined
    };

    dispatch({ type: 'ADD_MEASUREMENT', payload: newMeasurement });
    
    // Also auto-update userGoals.weight to match current weight for target calculations
    dispatch({
      type: 'UPDATE_GOALS',
      payload: {
        ...state.userGoals,
        weight: weightVal
      }
    });

    setWeight('');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta medição de peso?')) {
      dispatch({ type: 'DELETE_MEASUREMENT', payload: id });
    }
  };

  // Calculations
  const measurements = state.measurements;
  const initialWeight = measurements.length > 0 ? measurements[0].weight : state.userGoals.weight;
  const currentWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : state.userGoals.weight;
  const weightChange = currentWeight - initialWeight;

  // Chart data mapping
  const chartData = measurements.map(m => ({
    dateLabel: getShortDateLabel(m.date),
    weight: m.weight,
    dateRaw: m.date
  }));

  // Tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '6px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{payload[0].payload.dateRaw}</p>
          <p style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
            {payload[0].value} kg
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.grid}>
      {/* Left Column: Form & General Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Stats card */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>
            <Scale size={20} style={{ color: 'var(--accent-primary)' }} />
            Progresso de Peso
          </h2>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Inicial</span>
              <span className={styles.statValue}>{initialWeight} kg</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Atual</span>
              <span className={styles.statValue} style={{ color: 'var(--accent-primary)' }}>
                {currentWeight} kg
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Variação</span>
              <span className={`${styles.statValue} ${weightChange > 0 ? styles.weightGain : styles.weightLoss}`}>
                {weightChange === 0 ? '' : weightChange > 0 ? '+' : ''}
                {weightChange.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Input Form card */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>Registrar Peso</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="300"
                className={styles.formInput}
                placeholder="Ex: 78.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Data</label>
              <input
                type="date"
                className={styles.formInput}
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notas (Opcional)</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Ex: Em jejum, pós-treino"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Plus size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Salvar Registro
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Chart & Logs History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Evolution Chart */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>
            <ChartIcon size={20} style={{ color: 'var(--accent-primary)' }} />
            Gráfico de Evolução
          </h2>

          {measurements.length < 2 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Registre pelo menos 2 medições de peso para visualizar o gráfico.
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis 
                    dataKey="dateLabel" 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* History timeline list */}
        <div className={`glass-panel ${styles.panel}`}>
          <h2 className={styles.title}>Histórico de Registros</h2>
          
          {measurements.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              Nenhuma medição registrada ainda.
            </div>
          ) : (
            <div className={styles.historyList}>
              {[...measurements].reverse().map(m => (
                <div key={m.id} className={styles.historyRow}>
                  <div className={styles.historyInfo}>
                    <span className={styles.historyWeight}>{m.weight} kg</span>
                    <span className={styles.historyDate}>{m.date}</span>
                    {m.notes && <span className={styles.historyNotes}>"{m.notes}"</span>}
                  </div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(m.id)}
                    title="Excluir medição"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
