export interface Ingredient {
  id: string;
  name: string;
  carbsPer100g: number;   // grams
  proteinPer100g: number; // grams
  fatPer100g: number;     // grams
  kcalPer100g: number;    // calculated: (carbs*4 + protein*4 + fat*9)
  category?: string;      // e.g., "fruta", "proteína", "grão"
}

export interface MealItem {
  ingredientId: string;
  quantityGrams: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'cafe' | 'almoco' | 'jantar' | 'lanche';
  items: MealItem[];
  tags: string[];          // e.g., "rápido", "marmita", "favorito"
  totalKcal: number;       // calculated
  totalCarbs: number;      // calculated
  totalProtein: number;    // calculated
  totalFat: number;        // calculated
}

export interface Recipe {
  id: string;
  name: string;
  prepTime: number;        // minutes
  method: string;          // e.g., "air fryer", "forno", "panela"
  status: 'want_to_try' | 'fan_favorite' | 'tried';
  instructions: string;    // cooking instructions
  linkedMealId?: string;   // linked to a meal in the database
}

export interface DayPlan {
  date: string;            // ISO date (YYYY-MM-DD)
  slots: {
    cafe: string | null;    // mealId
    almoco: string | null;
    jantar: string | null;
    lanche: string | null;
  };
  isFreeMeal: boolean;     // whether there is a cheat/free meal today
}

export interface WeekPlan {
  id: string;
  weekStart: string;       // ISO date (Monday)
  days: DayPlan[];
}

export interface LogEntry {
  id: string;
  mealId: string;
  timestamp: string;       // ISO timestamp
  isFreeMeal: boolean;
}

export interface DailyLog {
  date: string;            // ISO date (YYYY-MM-DD)
  entries: LogEntry[];
}

export interface UserGoals {
  targetKcal: number;      // e.g., 1410
  weight: number;          // kg
  proteinMultiplier: number; // e.g., 1.8
  fatMultiplier: number;     // e.g., 0.8
  freeMealsPerWeek: number;  // e.g., 2
}

export interface Measurement {
  id: string;
  date: string;            // ISO date (YYYY-MM-DD)
  weight: number;
  notes?: string;
}

export interface NutrilState {
  ingredients: Ingredient[];
  meals: Meal[];
  recipes: Recipe[];
  weekPlans: WeekPlan[];
  dailyLogs: DailyLog[];
  userGoals: UserGoals;
  measurements: Measurement[];
}

export type NutrilAction =
  | { type: 'SET_INITIAL_STATE'; payload: NutrilState }
  | { type: 'ADD_INGREDIENT'; payload: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; payload: Ingredient }
  | { type: 'DELETE_INGREDIENT'; payload: string }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: Meal }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'LOG_MEAL'; payload: { date: string; entry: LogEntry } }
  | { type: 'REMOVE_LOG_ENTRY'; payload: { date: string; entryId: string } }
  | { type: 'SET_WEEK_PLAN'; payload: WeekPlan }
  | { type: 'TOGGLE_FREE_MEAL_DAY'; payload: { date: string } }
  | { type: 'UPDATE_GOALS'; payload: UserGoals }
  | { type: 'ADD_MEASUREMENT'; payload: Measurement }
  | { type: 'DELETE_MEASUREMENT'; payload: string }
  | { type: 'TOGGLE_LOG_ENTRY_FREE'; payload: { date: string; entryId: string } };
