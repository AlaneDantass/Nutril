import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { NutrilProvider } from '@/app/providers/NutrilProvider';
import { Layout } from '@/components/Layout/Layout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { DailyLogPage } from '@/features/daily-log/DailyLogPage';
import { FreeMealsPage } from '@/features/free-meals/FreeMealsPage';
import { MealPlanPage } from '@/features/meal-plan/MealPlanPage';
import { MealsPage } from '@/features/meals/MealsPage';
import { IngredientsPage } from '@/features/ingredients/IngredientsPage';
import { RecipesPage } from '@/features/recipes/RecipesPage';
import { QuickDecidePage } from '@/features/quick-decide/QuickDecidePage';
import { ShoppingListPage } from '@/features/shopping-list/ShoppingListPage';
import { MeasurementsPage } from '@/features/measurements/MeasurementsPage';

const App: React.FC = () => {
  return (
    <NutrilProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<DailyLogPage />} />
            <Route path="free-meals" element={<FreeMealsPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route path="meals" element={<MealsPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="quick-decide" element={<QuickDecidePage />} />
            <Route path="shopping-list" element={<ShoppingListPage />} />
            <Route path="measurements" element={<MeasurementsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </NutrilProvider>
  );
};

export default App;
