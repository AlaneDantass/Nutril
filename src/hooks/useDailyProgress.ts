import { useNutril } from '@/app/providers/NutrilProvider';
import { useNutrition } from './useNutrition';
import { formatDateISO } from '@/lib/dates';

export function useDailyProgress(dateStr: string = formatDateISO(new Date())) {
  const { state } = useNutril();
  const { targets } = useNutrition();

  // Find daily log
  const log = state.dailyLogs.find(l => l.date === dateStr);
  const entries = log ? log.entries : [];

  let consumedKcal = 0;
  let consumedCarbs = 0;
  let consumedProtein = 0;
  let consumedFat = 0;

  const loggedMeals = entries.map(entry => {
    const meal = state.meals.find(m => m.id === entry.mealId);
    if (meal) {
      consumedKcal += meal.totalKcal;
      consumedCarbs += meal.totalCarbs;
      consumedProtein += meal.totalProtein;
      consumedFat += meal.totalFat;
    }
    return {
      entry,
      meal
    };
  }).filter(item => item.meal !== undefined); // filter out deleted meals

  // Format decimals
  consumedKcal = Math.round(consumedKcal);
  consumedCarbs = Math.round(consumedCarbs * 10) / 10;
  consumedProtein = Math.round(consumedProtein * 10) / 10;
  consumedFat = Math.round(consumedFat * 10) / 10;

  // Remaining values
  const remainingKcal = Math.max(0, targets.kcal - consumedKcal);
  const remainingCarbs = Math.max(0, targets.carbs - consumedCarbs);
  const remainingProtein = Math.max(0, targets.protein - consumedProtein);
  const remainingFat = Math.max(0, targets.fat - consumedFat);

  // Percentages (clamped to 100 max for UI bar width, but raw percent also useful)
  const getPercent = (value: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((value / target) * 100));
  };

  const percentKcal = getPercent(consumedKcal, targets.kcal);
  const percentCarbs = getPercent(consumedCarbs, targets.carbs);
  const percentProtein = getPercent(consumedProtein, targets.protein);
  const percentFat = getPercent(consumedFat, targets.fat);

  return {
    date: dateStr,
    loggedMeals,
    totals: {
      kcal: consumedKcal,
      carbs: consumedCarbs,
      protein: consumedProtein,
      fat: consumedFat
    },
    remaining: {
      kcal: remainingKcal,
      carbs: remainingCarbs,
      protein: remainingProtein,
      fat: remainingFat
    },
    percentages: {
      kcal: percentKcal,
      carbs: percentCarbs,
      protein: percentProtein,
      fat: percentFat
    }
  };
}
