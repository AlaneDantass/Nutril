import { Ingredient, MealItem, Meal } from '@/types';

// Calculate calories based on macronutrients (4 kcal/g carbs, 4 kcal/g protein, 9 kcal/g fat)
export function calculateKcal(carbs: number, protein: number, fat: number): number {
  return Math.round((carbs * 4 + protein * 4 + fat * 9) * 10) / 10;
}

// Calculate macros for a single item of a meal based on its ingredient and weight
export function calculateItemMacros(item: MealItem, ingredient: Ingredient) {
  const ratio = item.quantityGrams / 100;
  const carbs = Math.round((ingredient.carbsPer100g * ratio) * 10) / 10;
  const protein = Math.round((ingredient.proteinPer100g * ratio) * 10) / 10;
  const fat = Math.round((ingredient.fatPer100g * ratio) * 10) / 10;
  const kcal = Math.round((ingredient.kcalPer100g * ratio) * 10) / 10;

  return { carbs, protein, fat, kcal };
}

// Recalculates all macros for a meal based on its list of items and the complete ingredients database
export function recalculateMealMacros(
  items: MealItem[],
  ingredients: Ingredient[]
): Pick<Meal, 'totalCarbs' | 'totalProtein' | 'totalFat' | 'totalKcal'> {
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalKcal = 0;

  for (const item of items) {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    if (ingredient) {
      const macros = calculateItemMacros(item, ingredient);
      totalCarbs += macros.carbs;
      totalProtein += macros.protein;
      totalFat += macros.fat;
      totalKcal += macros.kcal;
    }
  }

  return {
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalKcal: Math.round(totalKcal * 10) / 10,
  };
}
