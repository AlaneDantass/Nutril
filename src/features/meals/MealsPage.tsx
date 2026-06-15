import React, { useState } from 'react';
import { Search, Plus, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { MealCard } from '@/components/MealCard/MealCard';
import { Meal, MealItem, Ingredient } from '@/types';
import { recalculateMealMacros } from '@/lib/calculations';
import styles from './meals.module.css';

export const MealsPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');

  // --- Meal Builder Form State ---
  const [builderName, setBuilderName] = useState('');
  const [builderType, setBuilderType] = useState<Meal['type']>('lanche');
  const [builderTags, setBuilderTags] = useState('');
  const [builderItems, setBuilderItems] = useState<MealItem[]>([]);
  
  // Builder selected item state
  const [selectedIngId, setSelectedIngId] = useState('');
  const [ingQuantity, setIngQuantity] = useState('100');

  // Open builder for creating a new meal
  const handleOpenAdd = () => {
    setEditingMeal(null);
    setBuilderName('');
    setBuilderType('lanche');
    setBuilderTags('');
    setBuilderItems([]);
    setSelectedIngId(state.ingredients[0]?.id || '');
    setIngQuantity('100');
    setIsBuilding(true);
  };

  // Open builder for editing an existing meal
  const handleOpenEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setBuilderName(meal.name);
    setBuilderType(meal.type);
    setBuilderTags(meal.tags.join(', '));
    setBuilderItems(meal.items);
    setSelectedIngId(state.ingredients[0]?.id || '');
    setIngQuantity('100');
    setIsBuilding(true);
  };

  const handleCloseBuilder = () => {
    setIsBuilding(false);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta refeição?')) {
      dispatch({ type: 'DELETE_MEAL', payload: id });
    }
  };

  const handleAddIngredientToBuilder = () => {
    if (!selectedIngId) return alert('Selecione um ingrediente');
    const quantity = parseFloat(ingQuantity);
    if (isNaN(quantity) || quantity <= 0) return alert('Insira um peso válido');

    // Check if ingredient already added
    const existingIndex = builderItems.findIndex(i => i.ingredientId === selectedIngId);
    if (existingIndex >= 0) {
      const updated = [...builderItems];
      updated[existingIndex].quantityGrams += quantity;
      setBuilderItems(updated);
    } else {
      setBuilderItems([...builderItems, { ingredientId: selectedIngId, quantityGrams: quantity }]);
    }
  };

  const handleRemoveIngredientFromBuilder = (idx: number) => {
    setBuilderItems(builderItems.filter((_, i) => i !== idx));
  };

  const handleSaveMeal = () => {
    if (!builderName.trim()) return alert('Insira o nome da refeição');
    if (builderItems.length === 0) return alert('Adicione pelo menos um ingrediente');

    const calculatedMacros = recalculateMealMacros(builderItems, state.ingredients);
    const parsedTags = builderTags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    if (editingMeal) {
      // Edit
      const updated: Meal = {
        ...editingMeal,
        name: builderName,
        type: builderType,
        items: builderItems,
        tags: parsedTags,
        ...calculatedMacros
      };
      dispatch({ type: 'UPDATE_MEAL', payload: updated });
    } else {
      // Add
      const newMeal: Meal = {
        id: `meal-${Date.now()}`,
        name: builderName,
        type: builderType,
        items: builderItems,
        tags: parsedTags,
        ...calculatedMacros
      };
      dispatch({ type: 'ADD_MEAL', payload: newMeal });
    }

    handleCloseBuilder();
  };

  // Helper to log meal to daily timeline
  const handleLogMeal = (meal: Meal) => {
    const todayStr = new Date().toISOString().split('T')[0];
    dispatch({
      type: 'LOG_MEAL',
      payload: {
        date: todayStr,
        entry: {
          id: `log-${Date.now()}`,
          mealId: meal.id,
          timestamp: new Date().toISOString(),
          isFreeMeal: false
        }
      }
    });
    alert(`"${meal.name}" registrada no diário de hoje!`);
  };

  // Filter list of meals
  const filteredMeals = state.meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'Todos' || meal.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate live preview macros in builder
  const previewMacros = recalculateMealMacros(builderItems, state.ingredients);
  const getIngredientName = (id: string) => {
    return state.ingredients.find(ing => ing.id === id)?.name || '';
  };

  if (isBuilding) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className={`${styles.filterBtn} ${styles.backBtn}`} onClick={handleCloseBuilder} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
        </div>

        <div className={styles.builderGrid}>
          {/* Left panel: Info & items list selector */}
          <div className={`glass-panel ${styles.builderPanel}`}>
            <h2 className={styles.builderTitle}>
              {editingMeal ? 'Editar Refeição' : 'Montar Nova Refeição'}
            </h2>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome da Refeição</label>
              <input
                type="text"
                className={styles.formInput}
                value={builderName}
                onChange={(e) => setBuilderName(e.target.value)}
                placeholder="Ex: Frango Grelhado com Arroz e Salada"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo de Refeição</label>
                <select
                  className={styles.formInput}
                  value={builderType}
                  onChange={(e) => setBuilderType(e.target.value as Meal['type'])}
                >
                  <option value="cafe">Café da Manhã</option>
                  <option value="almoco">Almoço</option>
                  <option value="jantar">Jantar</option>
                  <option value="lanche">Lanche</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={builderTags}
                  onChange={(e) => setBuilderTags(e.target.value)}
                  placeholder="Ex: rápido, pós-treino, favorito"
                />
              </div>
            </div>

            {/* Ingredients builder */}
            <div className={styles.ingredientsSection}>
              <h3 className={styles.sectionSubtitle}>Ingredientes</h3>

              {state.ingredients.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Nenhum ingrediente cadastrado no banco. Vá em "Ingredientes" no menu lateral para adicionar ingredientes primeiro.
                </div>
              ) : (
                <>
                  <div className={styles.addItemRow}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Selecionar Ingrediente</label>
                      <select
                        className={styles.formInput}
                        value={selectedIngId}
                        onChange={(e) => setSelectedIngId(e.target.value)}
                      >
                        {state.ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (C: {ing.carbsPer100g}g P: {ing.proteinPer100g}g/100g)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Quantidade (gramas)</label>
                      <input
                        type="number"
                        min="1"
                        className={styles.formInput}
                        value={ingQuantity}
                        onChange={(e) => setIngQuantity(e.target.value)}
                      />
                    </div>

                    <button 
                      type="button" 
                      className={styles.circleBtn}
                      onClick={handleAddIngredientToBuilder}
                      title="Adicionar ingrediente"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>

                  {/* List of currently added items */}
                  <div className={styles.addedItemsList}>
                    {builderItems.length === 0 ? (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nenhum ingrediente adicionado a esta refeição.</span>
                    ) : (
                      builderItems.map((item, idx) => (
                        <div className={styles.addedItemCard} key={idx}>
                          <div className={styles.addedItemInfo}>
                            <span className={styles.addedItemName}>{getIngredientName(item.ingredientId)}</span>
                            <span className={styles.addedItemWeight}>{item.quantityGrams}g</span>
                          </div>
                          <button 
                            type="button" 
                            className={styles.deleteItemBtn}
                            onClick={() => handleRemoveIngredientFromBuilder(idx)}
                            title="Remover ingrediente"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right panel: Live summary preview */}
          <div className={`glass-panel ${styles.previewPanel}`}>
            <div className={styles.previewHeader}>
              <span className={styles.previewLabel}>Resumo da Refeição</span>
              <h3 className={styles.previewTitle}>{builderName || 'Refeição Sem Nome'}</h3>
            </div>

            <div className={styles.previewMacrosGrid}>
              <div>
                <span className={styles.formLabel} style={{ fontSize: '10px' }}>Calorias</span>
                <span className={`${styles.previewMacroVal}`} style={{ color: 'var(--color-kcal)' }}>
                  {Math.round(previewMacros.totalKcal)} kcal
                </span>
              </div>
              <div>
                <span className={styles.formLabel} style={{ fontSize: '10px' }}>Carbo</span>
                <span className={`${styles.previewMacroVal}`} style={{ color: 'var(--color-carbs)' }}>
                  {Math.round(previewMacros.totalCarbs)}g
                </span>
              </div>
              <div>
                <span className={styles.formLabel} style={{ fontSize: '10px' }}>Proteína</span>
                <span className={`${styles.previewMacroVal}`} style={{ color: 'var(--color-protein)' }}>
                  {Math.round(previewMacros.totalProtein)}g
                </span>
              </div>
              <div>
                <span className={styles.formLabel} style={{ fontSize: '10px' }}>Gordura</span>
                <span className={`${styles.previewMacroVal}`} style={{ color: 'var(--color-fat)' }}>
                  {Math.round(previewMacros.totalFat)}g
                </span>
              </div>
            </div>

            <div className={styles.previewActions}>
              <button 
                className={`${styles.addBtn}`} 
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', flex: 1, justifyContent: 'center' }}
                onClick={handleCloseBuilder}
              >
                Cancelar
              </button>
              <button 
                className={styles.addBtn}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSaveMeal}
              >
                Salvar Refeição
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          {/* Search bar */}
          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar refeição ou hashtag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type filters */}
          <div className={styles.typeFilters}>
            {['Todos', 'cafe', 'almoco', 'jantar', 'lanche'].map((type) => {
              const label = type === 'Todos' ? 'Todos' : 
                            type === 'cafe' ? 'Café' : 
                            type === 'almoco' ? 'Almoço' : 
                            type === 'jantar' ? 'Jantar' : 'Lanches';
              return (
                <button
                  key={type}
                  className={`${styles.filterBtn} ${selectedType === type ? styles.activeFilterBtn : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add button */}
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Montar Refeição</span>
        </button>
      </div>

      {/* Grid of Meal Cards */}
      {filteredMeals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Nenhuma refeição cadastrada ou encontrada. Clique em "Montar Refeição" para criar uma.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              ingredients={state.ingredients}
              onLog={handleLogMeal}
              onEdit={handleOpenEdit}
              onDelete={(m) => handleDeleteMeal(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
