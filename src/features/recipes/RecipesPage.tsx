import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Clock, Flame, Utensils } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { Recipe } from '@/types';
import styles from './recipes.module.css';

export const RecipesPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('10');
  const [formMethod, setFormMethod] = useState('Air Fryer');
  const [formStatus, setFormStatus] = useState<Recipe['status']>('want_to_try');
  const [formInstructions, setFormInstructions] = useState('');
  const [formMealId, setFormMealId] = useState('');

  const handleOpenAddModal = () => {
    setEditingRecipe(null);
    setFormName('');
    setFormPrepTime('10');
    setFormMethod('Air Fryer');
    setFormStatus('want_to_try');
    setFormInstructions('');
    setFormMealId('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: Recipe) => {
    setEditingRecipe(rec);
    setFormName(rec.name);
    setFormPrepTime(rec.prepTime.toString());
    setFormMethod(rec.method);
    setFormStatus(rec.status);
    setFormInstructions(rec.instructions);
    setFormMealId(rec.linkedMealId || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      dispatch({ type: 'DELETE_RECIPE', payload: id });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return alert('Insira o nome da receita');

    const prepTime = parseInt(formPrepTime) || 0;
    const linkedMealId = formMealId || undefined;

    if (editingRecipe) {
      const updated: Recipe = {
        ...editingRecipe,
        name: formName,
        prepTime,
        method: formMethod,
        status: formStatus,
        instructions: formInstructions,
        linkedMealId
      };
      dispatch({ type: 'UPDATE_RECIPE', payload: updated });
    } else {
      const newRec: Recipe = {
        id: `rec-${Date.now()}`,
        name: formName,
        prepTime,
        method: formMethod,
        status: formStatus,
        instructions: formInstructions,
        linkedMealId
      };
      dispatch({ type: 'ADD_RECIPE', payload: newRec });
    }

    handleCloseModal();
  };

  const getStatusLabel = (status: Recipe['status']) => {
    switch (status) {
      case 'fan_favorite': return 'Favorito';
      case 'tried': return 'Já Fiz';
      case 'want_to_try': return 'Quero Fazer';
      default: return status;
    }
  };

  const getMealName = (mealId?: string) => {
    if (!mealId) return null;
    return state.meals.find(m => m.id === mealId)?.name || 'Refeição Desconhecida';
  };

  const getMealMacrosString = (mealId?: string) => {
    if (!mealId) return null;
    const meal = state.meals.find(m => m.id === mealId);
    if (!meal) return null;
    return `${Math.round(meal.totalKcal)} kcal (C: ${Math.round(meal.totalCarbs)}g P: ${Math.round(meal.totalProtein)}g)`;
  };

  const filteredRecipes = state.recipes.filter(rec => 
    rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar receita ou método..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Grid */}
      {filteredRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Nenhuma receita encontrada ou cadastrada. Clique em "Nova Receita" para começar.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{recipe.name}</h3>
                <span className={`${styles.badge} ${styles[recipe.status]}`}>
                  {getStatusLabel(recipe.status)}
                </span>
              </div>

              <div className={styles.meta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {recipe.prepTime} min
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} />
                  {recipe.method}
                </span>
              </div>

              <div className={styles.instructions}>
                {recipe.instructions || 'Nenhuma instrução descrita.'}
              </div>

              {recipe.linkedMealId && (
                <div className={styles.linkedMeal}>
                  <Utensils size={12} />
                  <span>
                    <strong>Vínculo:</strong> {getMealName(recipe.linkedMealId)} <br />
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {getMealMacrosString(recipe.linkedMealId)}
                    </span>
                  </span>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.btn}
                  onClick={() => handleOpenEditModal(recipe)}
                  title="Editar Receita"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className={`${styles.btn}`}
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  title="Excluir Receita"
                  style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome da Receita</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Tapioca com Ovos e Queijo"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tempo de Prep. (min)</label>
                    <input
                      type="number"
                      min="1"
                      className={styles.formInput}
                      value={formPrepTime}
                      onChange={(e) => setFormPrepTime(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Método</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formMethod}
                      onChange={(e) => setFormMethod(e.target.value)}
                      placeholder="Ex: Forno, Frigideira"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vincular à Refeição do Banco</label>
                    <select
                      className={styles.formInput}
                      value={formMealId}
                      onChange={(e) => setFormMealId(e.target.value)}
                    >
                      <option value="">Sem vínculo</option>
                      {state.meals.map(meal => (
                        <option key={meal.id} value={meal.id}>
                          {meal.name} ({Math.round(meal.totalKcal)} kcal)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      className={styles.formInput}
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as Recipe['status'])}
                    >
                      <option value="want_to_try">Quero Fazer</option>
                      <option value="tried">Já Fiz</option>
                      <option value="fan_favorite">Favorito</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Instruções de Preparo</label>
                  <textarea
                    className={`${styles.formInput} ${styles.textarea}`}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="1. Coloque a farinha na frigideira...&#10;2. Adicione os ovos mexidos...&#10;3. Dobre e sirva quente."
                  />
                </div>
              </div>

              <div className={styles.modalFooter} style={{ padding: '16px 24px' }}>
                <button
                  type="button"
                  className={styles.addBtn}
                  style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.addBtn}>
                  {editingRecipe ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
