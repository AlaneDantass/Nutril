import { Ingredient, Meal, Recipe, UserGoals, Measurement, WeekPlan, DailyLog } from '@/types';
import { calculateKcal, recalculateMealMacros } from './calculations';
import { getMondayOfDate, formatDateISO } from './dates';

// 1. Ingredients
export const initialIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Ovo Inteiro', carbsPer100g: 0.7, proteinPer100g: 13, fatPer100g: 11, kcalPer100g: calculateKcal(0.7, 13, 11), category: 'Proteínas' },
  { id: 'ing-2', name: 'Clara de Ovo', carbsPer100g: 0.7, proteinPer100g: 11, fatPer100g: 0.2, kcalPer100g: calculateKcal(0.7, 11, 0.2), category: 'Proteínas' },
  { id: 'ing-3', name: 'Frango Grelhado (Peito)', carbsPer100g: 0, proteinPer100g: 31, fatPer100g: 3.6, kcalPer100g: calculateKcal(0, 31, 3.6), category: 'Proteínas' },
  { id: 'ing-4', name: 'Patinho Moído Grelhado', carbsPer100g: 0, proteinPer100g: 32, fatPer100g: 7.5, kcalPer100g: calculateKcal(0, 32, 7.5), category: 'Proteínas' },
  { id: 'ing-5', name: 'Whey Protein Concentrado', carbsPer100g: 8, proteinPer100g: 80, fatPer100g: 6, kcalPer100g: calculateKcal(8, 80, 6), category: 'Suplementos' },
  { id: 'ing-6', name: 'Arroz Branco Cozido', carbsPer100g: 28, proteinPer100g: 2.5, fatPer100g: 0.2, kcalPer100g: calculateKcal(28, 2.5, 0.2), category: 'Carboidratos' },
  { id: 'ing-7', name: 'Feijão Carioca Cozido', carbsPer100g: 14, proteinPer100g: 4.8, fatPer100g: 0.5, kcalPer100g: calculateKcal(14, 4.8, 0.5), category: 'Carboidratos' },
  { id: 'ing-8', name: 'Aveia em Flocos', carbsPer100g: 57, proteinPer100g: 14, fatPer100g: 8.5, kcalPer100g: calculateKcal(57, 14, 8.5), category: 'Carboidratos' },
  { id: 'ing-9', name: 'Banana Nanica', carbsPer100g: 23, proteinPer100g: 1.1, fatPer100g: 0.3, kcalPer100g: calculateKcal(23, 1.1, 0.3), category: 'Frutas' },
  { id: 'ing-10', name: 'Maçã', carbsPer100g: 13, proteinPer100g: 0.3, fatPer100g: 0.2, kcalPer100g: calculateKcal(13, 0.3, 0.2), category: 'Frutas' },
  { id: 'ing-11', name: 'Pasta de Amendoim Integral', carbsPer100g: 19, proteinPer100g: 29, fatPer100g: 49, kcalPer100g: calculateKcal(19, 29, 49), category: 'Gorduras' },
  { id: 'ing-12', name: 'Azeite de Oliva Extra Virgem', carbsPer100g: 0, proteinPer100g: 0, fatPer100g: 100, kcalPer100g: calculateKcal(0, 0, 100), category: 'Gorduras' },
  { id: 'ing-13', name: 'Pão de Forma Integral', carbsPer100g: 43, proteinPer100g: 12, fatPer100g: 3.5, kcalPer100g: calculateKcal(43, 12, 3.5), category: 'Carboidratos' },
  { id: 'ing-14', name: 'Queijo Cottage', carbsPer100g: 3.4, proteinPer100g: 11, fatPer100g: 4.3, kcalPer100g: calculateKcal(3.4, 11, 4.3), category: 'Proteínas' },
  { id: 'ing-15', name: 'Cuscuz de Milho Cozido', carbsPer100g: 25, proteinPer100g: 2.2, fatPer100g: 0.6, kcalPer100g: calculateKcal(25, 2.2, 0.6), category: 'Carboidratos' }
];

// Helper to construct a meal and compute its macros automatically
function createMeal(
  id: string,
  name: string,
  type: Meal['type'],
  items: { ingredientId: string; quantityGrams: number }[],
  tags: string[] = []
): Meal {
  const macros = recalculateMealMacros(items, initialIngredients);
  return {
    id,
    name,
    type,
    items,
    tags,
    ...macros
  };
}

// 2. Pre-calculated Meals
export const initialMeals: Meal[] = [
  createMeal('meal-1', 'Mingau de Aveia Proteico', 'cafe', [
    { ingredientId: 'ing-8', quantityGrams: 40 },  // Aveia
    { ingredientId: 'ing-5', quantityGrams: 30 },  // Whey
    { ingredientId: 'ing-9', quantityGrams: 100 }  // Banana
  ], ['rápido', 'pós-treino']),

  createMeal('meal-2', 'Almoço Clássico (Frango e Arroz)', 'almoco', [
    { ingredientId: 'ing-3', quantityGrams: 120 }, // Frango
    { ingredientId: 'ing-6', quantityGrams: 150 }, // Arroz
    { ingredientId: 'ing-7', quantityGrams: 80 },  // Feijão
    { ingredientId: 'ing-12', quantityGrams: 8 }   // Azeite
  ], ['marmita', 'dia-a-dia']),

  createMeal('meal-3', 'Jantar Prático (Carne Moída e Cuscuz)', 'jantar', [
    { ingredientId: 'ing-4', quantityGrams: 120 }, // Patinho
    { ingredientId: 'ing-15', quantityGrams: 150 }, // Cuscuz
    { ingredientId: 'ing-12', quantityGrams: 6 }   // Azeite
  ], ['jantar-rápido']),

  createMeal('meal-4', 'Pão com Ovo e Queijo Cottage', 'cafe', [
    { ingredientId: 'ing-13', quantityGrams: 50 }, // 2 fatias Pão
    { ingredientId: 'ing-1', quantityGrams: 100 }, // 2 Ovos inteiros
    { ingredientId: 'ing-14', quantityGrams: 30 }  // Cottage
  ], ['favorito', 'café-completo']),

  createMeal('meal-5', 'Lanche Anabólico de Banana', 'lanche', [
    { ingredientId: 'ing-9', quantityGrams: 100 }, // Banana
    { ingredientId: 'ing-11', quantityGrams: 20 }, // Pasta Amendoim
    { ingredientId: 'ing-5', quantityGrams: 15 }   // Meio scoop Whey
  ], ['rápido', 'pré-treino']),

  createMeal('meal-6', 'Salada de Frutas com Whey', 'lanche', [
    { ingredientId: 'ing-9', quantityGrams: 80 },  // Banana
    { ingredientId: 'ing-10', quantityGrams: 100 }, // Maçã
    { ingredientId: 'ing-5', quantityGrams: 20 }   // Whey
  ], ['sobremesa', 'rápido'])
];

// 3. Recipes
export const initialRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Mingau de Aveia Proteico',
    prepTime: 5,
    method: 'Micro-ondas',
    status: 'fan_favorite',
    instructions: '1. Adicione a aveia e 120ml de água em um bowl.\n2. Leve ao micro-ondas por 1 minuto e meio.\n3. Retire, misture o Whey Protein vigorosamente até ficar homogêneo.\n4. Corte a banana em rodelas e adicione por cima.\n5. Prontinho!',
    linkedMealId: 'meal-1'
  },
  {
    id: 'rec-2',
    name: 'Cuscuz Nordestino com Carne Moída',
    prepTime: 15,
    method: 'Cuscuzeira',
    status: 'tried',
    instructions: '1. Molhe a farinha de milho (flocão) com água e uma pitada de sal. Deixe hidratar por 10 minutos.\n2. Cozinhe na cuscuzeira por 10-12 minutos após a água ferver.\n3. Enquanto isso, grelhe o patinho moído na frigideira com temperos a gosto e o azeite.\n4. Sirva o cuscuz soltinho acompanhado da carne moída bem quente.',
    linkedMealId: 'meal-3'
  },
  {
    id: 'rec-3',
    name: 'Pão com Ovos Mexidos Cremosos',
    prepTime: 8,
    method: 'Fogão',
    status: 'fan_favorite',
    instructions: '1. Bata os ovos em uma tigela com sal e pimenta.\n2. Aqueça uma frigideira antiaderente em fogo baixo.\n3. Despeje os ovos e mexa devagar.\n4. Pouco antes de finalizar, misture o queijo cottage para dar cremosidade.\n5. Sirva quente sobre duas fatias de pão integral tostado.',
    linkedMealId: 'meal-4'
  }
];

// 4. Default User Goals
export const initialGoals: UserGoals = {
  targetKcal: 1410,
  weight: 70, // 70 kg
  proteinMultiplier: 1.8, // 1.8g/kg = 126g
  fatMultiplier: 0.8,     // 0.8g/kg = 56g
  freeMealsPerWeek: 2     // 2 cheat meals allowance
};

// 5. Weight Measurements history
export const initialMeasurements: Measurement[] = [
  { id: 'm-1', date: '2026-05-15', weight: 72.3, notes: 'Medição inicial em jejum' },
  { id: 'm-2', date: '2026-05-22', weight: 71.8, notes: 'Boa consistência na dieta' },
  { id: 'm-3', date: '2026-05-29', weight: 71.2, notes: 'Semana de treino intenso' },
  { id: 'm-4', date: '2026-06-05', weight: 70.5, notes: 'Estabilizou o peso' },
  { id: 'm-5', date: '2026-06-12', weight: 70.0, notes: 'Peso batido da meta!' }
];

// 6. Generate standard weekly plan (linked to initial meals)
export function generateDefaultWeekPlan(mondayDateStr: string): WeekPlan {
  const days = ['cafe', 'almoco', 'jantar', 'lanche'];
  const weekDays = [
    { suffix: 'Segunda-feira', slots: { cafe: 'meal-1', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-5' } },
    { suffix: 'Terça-feira', slots: { cafe: 'meal-4', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-6' } },
    { suffix: 'Quarta-feira', slots: { cafe: 'meal-1', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-5' } },
    { suffix: 'Quinta-feira', slots: { cafe: 'meal-4', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-6' } },
    { suffix: 'Sexta-feira', slots: { cafe: 'meal-1', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-5' } },
    { suffix: 'Sábado', slots: { cafe: 'meal-4', almoco: 'meal-2', jantar: null, lanche: 'meal-6' }, isFreeMeal: true }, // Free meal slot in Saturday evening
    { suffix: 'Domingo', slots: { cafe: 'meal-1', almoco: 'meal-2', jantar: 'meal-3', lanche: 'meal-5' } }
  ];

  const start = new Date(mondayDateStr + 'T00:00:00');
  const dayPlans = weekDays.map((wd, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return {
      date: formatDateISO(d),
      slots: wd.slots,
      isFreeMeal: wd.isFreeMeal || false
    };
  });

  return {
    id: `plan-${mondayDateStr}`,
    weekStart: mondayDateStr,
    days: dayPlans
  };
}

// 7. Initial Daily Logs for the last couple of days
export const initialDailyLogs = (currentMonday: string): DailyLog[] => {
  const start = new Date(currentMonday + 'T00:00:00');
  
  // Yesterday (Sunday)
  const yesterday = new Date(start);
  yesterday.setDate(start.getDate() - 1);
  const yesterdayStr = formatDateISO(yesterday);

  // Today
  const todayStr = formatDateISO(new Date());

  return [
    {
      date: yesterdayStr,
      entries: [
        { id: 'log-y-1', mealId: 'meal-1', timestamp: `${yesterdayStr}T08:30:00.000Z`, isFreeMeal: false },
        { id: 'log-y-2', mealId: 'meal-2', timestamp: `${yesterdayStr}T12:45:00.000Z`, isFreeMeal: false },
        { id: 'log-y-3', mealId: 'meal-5', timestamp: `${yesterdayStr}T16:15:00.000Z`, isFreeMeal: false },
        { id: 'log-y-4', mealId: 'meal-3', timestamp: `${yesterdayStr}T20:00:00.000Z`, isFreeMeal: false }
      ]
    },
    {
      date: todayStr,
      entries: [
        { id: 'log-t-1', mealId: 'meal-4', timestamp: `${todayStr}T08:15:00.000Z`, isFreeMeal: false },
        { id: 'log-t-2', mealId: 'meal-2', timestamp: `${todayStr}T13:00:00.000Z`, isFreeMeal: false }
      ]
    }
  ];
};
