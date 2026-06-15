import { useNutril } from '@/app/providers/NutrilProvider';
import { UserGoals } from '@/types';

export function useNutrition() {
  const { state } = useNutril();
  const { userGoals } = state;

  // Calculate targets:
  // Protein = weight * proteinMultiplier
  // Fat = weight * fatMultiplier
  // Carbs = (targetKcal - (protein * 4 + fat * 9)) / 4
  const calculateTargets = (goals: UserGoals) => {
    const proteinTarget = Math.round(goals.weight * goals.proteinMultiplier);
    const fatTarget = Math.round(goals.weight * goals.fatMultiplier);
    
    const proteinKcal = proteinTarget * 4;
    const fatKcal = fatTarget * 9;
    const carbsKcal = Math.max(0, goals.targetKcal - (proteinKcal + fatKcal));
    const carbsTarget = Math.round(carbsKcal / 4);

    return {
      kcal: goals.targetKcal,
      protein: proteinTarget,
      fat: fatTarget,
      carbs: carbsTarget,
    };
  };

  const targets = calculateTargets(userGoals);

  return {
    goals: userGoals,
    targets,
    calculateTargets
  };
}
