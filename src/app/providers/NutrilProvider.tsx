import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { NutrilState, NutrilAction } from '@/types';
import { getMondayOfDate } from '@/lib/dates';
import {
  initialIngredients,
  initialMeals,
  initialRecipes,
  initialGoals,
  initialMeasurements,
  generateDefaultWeekPlan,
  initialDailyLogs
} from '@/lib/seed-data';

const LOCAL_STORAGE_KEY = 'nutril_app_state_v1';

const getInitialState = (): NutrilState => {
  const currentMonday = getMondayOfDate(new Date());
  return {
    ingredients: initialIngredients,
    meals: initialMeals,
    recipes: initialRecipes,
    weekPlans: [generateDefaultWeekPlan(currentMonday)],
    dailyLogs: initialDailyLogs(currentMonday),
    userGoals: initialGoals,
    measurements: initialMeasurements
  };
};

function nutrilReducer(state: NutrilState, action: NutrilAction): NutrilState {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return action.payload;

    case 'ADD_INGREDIENT':
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };

    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map(ing => ing.id === action.payload.id ? action.payload : ing)
      };

    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter(ing => ing.id !== action.payload)
      };

    case 'ADD_MEAL':
      return {
        ...state,
        meals: [...state.meals, action.payload]
      };

    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(m => m.id === action.payload.id ? action.payload : m)
      };

    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(m => m.id !== action.payload)
      };

    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };

    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(r => r.id === action.payload.id ? action.payload : r)
      };

    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(r => r.id !== action.payload)
      };

    case 'LOG_MEAL': {
      const { date, entry } = action.payload;
      const existingLogIndex = state.dailyLogs.findIndex(log => log.date === date);

      let newDailyLogs = [...state.dailyLogs];
      if (existingLogIndex >= 0) {
        newDailyLogs[existingLogIndex] = {
          ...newDailyLogs[existingLogIndex],
          entries: [...newDailyLogs[existingLogIndex].entries, entry]
        };
      } else {
        newDailyLogs.push({
          date,
          entries: [entry]
        });
      }
      return { ...state, dailyLogs: newDailyLogs };
    }

    case 'REMOVE_LOG_ENTRY': {
      const { date, entryId } = action.payload;
      return {
        ...state,
        dailyLogs: state.dailyLogs.map(log => {
          if (log.date === date) {
            return {
              ...log,
              entries: log.entries.filter(entry => entry.id !== entryId)
            };
          }
          return log;
        }).filter(log => log.entries.length > 0) // Remove empty log objects
      };
    }

    case 'SET_WEEK_PLAN': {
      const newPlan = action.payload;
      const exists = state.weekPlans.some(wp => wp.weekStart === newPlan.weekStart);
      return {
        ...state,
        weekPlans: exists
          ? state.weekPlans.map(wp => wp.weekStart === newPlan.weekStart ? newPlan : wp)
          : [...state.weekPlans, newPlan]
      };
    }

    case 'TOGGLE_FREE_MEAL_DAY': {
      const { date } = action.payload;
      const monday = getMondayOfDate(new Date(date + 'T00:00:00'));
      
      return {
        ...state,
        weekPlans: state.weekPlans.map(wp => {
          if (wp.weekStart === monday) {
            return {
              ...wp,
              days: wp.days.map(d => {
                if (d.date === date) {
                  return { ...d, isFreeMeal: !d.isFreeMeal };
                }
                return d;
              })
            };
          }
          return wp;
        })
      };
    }

    case 'UPDATE_GOALS':
      return {
        ...state,
        userGoals: action.payload
      };

    case 'ADD_MEASUREMENT': {
      // Sort measurements by date after adding
      const newMeasurements = [...state.measurements, action.payload].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return {
        ...state,
        measurements: newMeasurements
      };
    }

    case 'DELETE_MEASUREMENT':
      return {
        ...state,
        measurements: state.measurements.filter(m => m.id !== action.payload)
      };

    case 'TOGGLE_LOG_ENTRY_FREE': {
      const { date, entryId } = action.payload;
      return {
        ...state,
        dailyLogs: state.dailyLogs.map(log => {
          if (log.date === date) {
            return {
              ...log,
              entries: log.entries.map(entry => {
                if (entry.id === entryId) {
                  return { ...entry, isFreeMeal: !entry.isFreeMeal };
                }
                return entry;
              })
            };
          }
          return log;
        })
      };
    }

    default:
      return state;
  }
}

interface NutrilContextProps {
  state: NutrilState;
  dispatch: React.Dispatch<NutrilAction>;
}

const NutrilContext = createContext<NutrilContextProps | undefined>(undefined);

export const NutrilProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(nutrilReducer, getInitialState(), (initial) => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NutrilState;
        
        // Ensure weekPlans and other structures are present
        if (!parsed.weekPlans) parsed.weekPlans = [];
        if (!parsed.dailyLogs) parsed.dailyLogs = [];
        if (!parsed.ingredients) parsed.ingredients = [];
        if (!parsed.meals) parsed.meals = [];
        if (!parsed.recipes) parsed.recipes = [];
        if (!parsed.measurements) parsed.measurements = [];
        if (!parsed.userGoals) parsed.userGoals = initialGoals;

        // Auto-generate week plan for current week if missing
        const currentMonday = getMondayOfDate(new Date());
        const hasCurrentWeekPlan = parsed.weekPlans.some(wp => wp.weekStart === currentMonday);
        if (!hasCurrentWeekPlan) {
          parsed.weekPlans.push(generateDefaultWeekPlan(currentMonday));
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error loading initial state from localStorage:', e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [state]);

  return (
    <NutrilContext.Provider value={{ state, dispatch }}>
      {children}
    </NutrilContext.Provider>
  );
};

export const useNutril = () => {
  const context = useContext(NutrilContext);
  if (!context) {
    throw new Error('useNutril must be used within a NutrilProvider');
  }
  return context;
};
