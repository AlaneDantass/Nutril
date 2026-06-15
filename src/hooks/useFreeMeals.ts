import { useNutril } from '@/app/providers/NutrilProvider';
import { getMondayOfDate, getWeekDays, formatDateISO } from '@/lib/dates';

export function useFreeMeals() {
  const { state } = useNutril();
  const limit = state.userGoals.freeMealsPerWeek;

  // Get current week's Monday and the 7 dates of the week
  const currentMonday = getMondayOfDate(new Date());
  const currentWeekDays = getWeekDays(currentMonday);

  // Count how many free meals were logged this week
  let usedThisWeek = 0;
  for (const log of state.dailyLogs) {
    if (currentWeekDays.includes(log.date)) {
      const freeEntries = log.entries.filter(e => e.isFreeMeal);
      usedThisWeek += freeEntries.length;
    }
  }

  const remaining = Math.max(0, limit - usedThisWeek);
  const isOverLimit = usedThisWeek > limit;

  // Generate history for the last 8 weeks
  const history: { weekStart: string; label: string; count: number }[] = [];
  const startOfCurrentWeek = new Date(currentMonday + 'T00:00:00');

  for (let i = 7; i >= 0; i--) {
    const monday = new Date(startOfCurrentWeek);
    monday.setDate(startOfCurrentWeek.getDate() - i * 7);
    const mondayStr = getMondayOfDate(monday);
    const weekDays = getWeekDays(mondayStr);

    let count = 0;
    for (const log of state.dailyLogs) {
      if (weekDays.includes(log.date)) {
        count += log.entries.filter(e => e.isFreeMeal).length;
      }
    }

    // Format week label like "15/06" (day/month of the Monday)
    const labelDate = new Date(mondayStr + 'T00:00:00');
    const day = String(labelDate.getDate()).padStart(2, '0');
    const month = String(labelDate.getMonth() + 1).padStart(2, '0');
    
    history.push({
      weekStart: mondayStr,
      label: `${day}/${month}`,
      count
    });
  }

  return {
    limit,
    usedThisWeek,
    remaining,
    isOverLimit,
    history
  };
}
