import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, ArrowUpDown } from 'lucide-react';
import { useNutril } from '@/app/providers/NutrilProvider';
import { Ingredient } from '@/types';
import { calculateKcal } from '@/lib/calculations';
import styles from './ingredients.module.css';

type SortField = 'name' | 'carbsPer100g' | 'proteinPer100g' | 'fatPer100g' | 'kcalPer100g';
type SortOrder = 'asc' | 'desc';

export const IngredientsPage: React.FC = () => {
  const { state, dispatch } = useNutril();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Proteínas');
  const [formCarbs, setFormCarbs] = useState('0');
  const [formProtein, setFormProtein] = useState('0');
  const [formFat, setFormFat] = useState('0');

  // Categories list for filtering
  const categories = ['Todos', 'Proteínas', 'Carboidratos', 'Frutas', 'Gorduras', 'Suplementos'];

  const handleOpenAddModal = () => {
    setEditingIngredient(null);
    setFormName('');
    setFormCategory('Proteínas');
    setFormCarbs('0');
    setFormProtein('0');
    setFormFat('0');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setFormName(ing.name);
    setFormCategory(ing.category || 'Proteínas');
    setFormCarbs(ing.carbsPer100g.toString());
    setFormProtein(ing.proteinPer100g.toString());
    setFormFat(ing.fatPer100g.toString());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ingrediente?')) {
      dispatch({ type: 'DELETE_INGREDIENT', payload: id });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return alert('Insira o nome do ingrediente');

    const carbs = parseFloat(formCarbs) || 0;
    const protein = parseFloat(formProtein) || 0;
    const fat = parseFloat(formFat) || 0;
    const kcal = calculateKcal(carbs, protein, fat);

    if (editingIngredient) {
      // Edit mode
      const updated: Ingredient = {
        ...editingIngredient,
        name: formName,
        category: formCategory,
        carbsPer100g: carbs,
        proteinPer100g: protein,
        fatPer100g: fat,
        kcalPer100g: kcal
      };
      dispatch({ type: 'UPDATE_INGREDIENT', payload: updated });
    } else {
      // Add mode
      const newIng: Ingredient = {
        id: `ing-${Date.now()}`,
        name: formName,
        category: formCategory,
        carbsPer100g: carbs,
        proteinPer100g: protein,
        fatPer100g: fat,
        kcalPer100g: kcal
      };
      dispatch({ type: 'ADD_INGREDIENT', payload: newIng });
    }

    handleCloseModal();
  };

  // Sort and filter logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredIngredients = state.ingredients
    .filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || ing.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle category/string cases if needed
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, 'pt-BR') 
          : valB.localeCompare(valA, 'pt-BR');
      }

      // Handle numbers
      valA = valA || 0;
      valB = valB || 0;
      return sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  // Calculate live preview kcal in modal
  const liveKcal = calculateKcal(
    parseFloat(formCarbs) || 0,
    parseFloat(formProtein) || 0,
    parseFloat(formFat) || 0
  );

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories filters */}
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.categoryBtn} ${
                selectedCategory === cat ? styles.activeCategoryBtn : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Novo Ingrediente</span>
        </button>
      </div>

      {/* Table */}
      <div className={`glass-panel ${styles.tableWrapper}`}>
        {filteredIngredients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Nenhum ingrediente cadastrado ou encontrado.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Ingrediente <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th onClick={() => handleSort('kcalPer100g')}>
                  Kcal/100g <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th onClick={() => handleSort('carbsPer100g')}>
                  Carbos <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th onClick={() => handleSort('proteinPer100g')}>
                  Proteína <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th onClick={() => handleSort('fatPer100g')}>
                  Gordura <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ing) => (
                <tr key={ing.id}>
                  <td style={{ fontWeight: '600' }}>{ing.name}</td>
                  <td className={styles.macroCell} style={{ color: 'var(--color-kcal)' }}>
                    {Math.round(ing.kcalPer100g)}
                  </td>
                  <td className={styles.macroCell} style={{ color: 'var(--color-carbs)' }}>
                    {ing.carbsPer100g}g
                  </td>
                  <td className={styles.macroCell} style={{ color: 'var(--color-protein)' }}>
                    {ing.proteinPer100g}g
                  </td>
                  <td className={styles.macroCell} style={{ color: 'var(--color-fat)' }}>
                    {ing.fatPer100g}g
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleOpenEditModal(ing)}
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteIngredient(ing.id)}
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome do Ingrediente</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Arroz Integral Cozido"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoria</label>
                  <select
                    className={styles.formInput}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Proteínas">Proteínas</option>
                    <option value="Carboidratos">Carboidratos</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Gorduras">Gorduras</option>
                    <option value="Suplementos">Suplementos</option>
                  </select>
                </div>

                <div className={styles.row3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Carbo/100g (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className={styles.formInput}
                      value={formCarbs}
                      onChange={(e) => setFormCarbs(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Proteína/100g (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className={styles.formInput}
                      value={formProtein}
                      onChange={(e) => setFormProtein(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gordura/100g (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className={styles.formInput}
                      value={formFat}
                      onChange={(e) => setFormFat(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.kcalDisplay}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Calorias por 100g calculadas:
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-kcal)' }}>
                    {liveKcal} kcal
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.addBtn}`}
                  style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.addBtn}>
                  {editingIngredient ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
