# Nutril — Plano de Implementação

Painel pessoal de nutrição focado em **adesão**, não em registro perfeito. Transformar os dados já estruturados no Notion (metas diárias, banco de ingredientes, receitas, cardápio semanal, refeições livres) em uma ferramenta de uso rápido no dia a dia.

**Princípio central:** o site reduz decisões. Você não monta refeição do zero — escolhe entre opções pré-calculadas do seu próprio banco.

---

## Decisões para Revisão do Usuário

> [!IMPORTANT]
> ### Armazenamento: localStorage vs. Supabase
> O plano usa **localStorage** como primeira fase (funciona imediato, sem configuração de backend). A estrutura de dados já será preparada para migrar para Supabase no futuro, se quiser acessar de vários dispositivos. Isso está ok para você?

> [!IMPORTANT]
> ### Dados iniciais pré-populados
> Pretendo criar um arquivo `seed-data.ts` com os ingredientes, refeições e receitas que você já tem no Notion. Você pode me fornecer a tabela de ingredientes (nome + carbo/proteína/gordura por 100g) e as receitas/refeições atuais? Ou prefere começar com uma estrutura vazia?

> [!WARNING]
> ### Sem autenticação na fase inicial
> O app será local e pessoal — sem login ou contas de usuário. Se no futuro migrar para Supabase, adicionamos autenticação. Correto?

---

## Perguntas Abertas

1. **Fórmula de macros:** Você mencionou `1,8×peso` para proteína e `0,8×peso` para gordura. A meta de **1410 kcal** é fixa ou calculada automaticamente a partir do peso? Quer poder editar esses multiplicadores na interface?
2. **Refeições livres — regra de compensação:** Quando o limite é ultrapassado, o sistema deve apenas alertar, ou deve sugerir ajustes concretos (ex: reduzir X gramas de carbo nos outros dias)?
3. **Dados do Notion:** Você consegue exportar as tabelas do Notion para que eu pré-popule o banco? Se sim, pode compartilhar em CSV ou JSON?
4. **Preferência visual:** Prefere dark mode como padrão? Alguma cor/tema que goste? (Vou sugerir um tema escuro premium com acentos verdes — remetendo a saúde/nutrição.)

---

## Stack Técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Build Tool** | Vite 6+ | Startup instantâneo, HMR rápido |
| **UI Framework** | React 19 + TypeScript | Prática alinhada ao trabalho, tipagem forte |
| **Roteamento** | React Router v7 | Familiar, leve, amplamente documentado |
| **Estilização** | Vanilla CSS (variáveis CSS + módulos) | Controle total, sem overhead de framework CSS |
| **Estado Global** | React Context + `useReducer` | Simples, sem dependência extra |
| **Persistência** | localStorage via hook `useLocalStorage` | Zero config, funciona offline |
| **Drag & Drop** | @dnd-kit | Moderno, acessível, leve (~14kb) |
| **Gráficos** | Recharts | Leve, declarativo, ótimo para barras de progresso |
| **Ícones** | Lucide React | Consistentes, leves, grande variedade |
| **Fonte** | Inter (Google Fonts) | Moderna, legível, profissional |

---

## Estrutura de Dados (TypeScript Interfaces)

```typescript
// === INGREDIENTE ===
interface Ingredient {
  id: string;
  name: string;
  carbsPer100g: number;   // gramas
  proteinPer100g: number; // gramas
  fatPer100g: number;     // gramas
  kcalPer100g: number;    // calculado: (carbs*4 + protein*4 + fat*9)
  category?: string;      // "fruta", "proteína", "grão", etc.
}

// === ITEM DE UMA REFEIÇÃO ===
interface MealItem {
  ingredientId: string;
  quantityGrams: number;
}

// === REFEIÇÃO (card reutilizável) ===
interface Meal {
  id: string;
  name: string;
  type: 'cafe' | 'almoco' | 'jantar' | 'lanche';
  items: MealItem[];
  tags: string[];          // "rápido", "marmita", "fan favorite"
  totalKcal: number;       // calculado
  totalCarbs: number;      // calculado
  totalProtein: number;    // calculado
  totalFat: number;        // calculado
}

// === RECEITA ===
interface Recipe {
  id: string;
  name: string;
  prepTime: number;        // minutos
  method: string;          // "air fryer", "forno", "one pot", etc.
  status: 'want_to_try' | 'fan_favorite' | 'tried';
  instructions: string;    // modo de preparo
  linkedMealId?: string;   // vinculada a uma refeição do banco
}

// === PLANO SEMANAL ===
interface WeekPlan {
  id: string;
  weekStart: string;       // ISO date (segunda-feira)
  days: DayPlan[];
}

interface DayPlan {
  date: string;            // ISO date
  slots: {
    cafe: string | null;    // mealId
    almoco: string | null;
    jantar: string | null;
    lanche: string | null;
  };
  isFreeMeal: boolean;     // se é dia de refeição livre
}

// === LOG DIÁRIO ===
interface DailyLog {
  date: string;            // ISO date
  entries: LogEntry[];
}

interface LogEntry {
  id: string;
  mealId: string;
  timestamp: string;
  isFreeMeal: boolean;
}

// === METAS DO USUÁRIO ===
interface UserGoals {
  targetKcal: number;      // 1410
  weight: number;          // kg
  proteinMultiplier: number; // 1.8
  fatMultiplier: number;     // 0.8
  freeMealsPerWeek: number;  // 2
}

// === MEDIDAS ===
interface Measurement {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}
```

---

## Arquitetura do Projeto

```
src/
├── app/
│   ├── App.tsx                    # Layout principal + rotas
│   ├── Router.tsx                 # Configuração de rotas
│   └── providers/
│       └── NutrilProvider.tsx     # Context global (dados + dispatch)
│
├── components/                    # Componentes UI reutilizáveis
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.module.css
│   ├── MacroBar/
│   │   ├── MacroBar.tsx           # Barra de progresso de macros
│   │   └── MacroBar.module.css
│   ├── MealCard/
│   │   ├── MealCard.tsx           # Card reutilizável de refeição
│   │   └── MealCard.module.css
│   ├── Modal/
│   ├── SearchInput/
│   └── Button/
│
├── features/
│   ├── dashboard/                 # 2.1 — Metas e Macros
│   │   ├── Dashboard.tsx
│   │   ├── DailyProgress.tsx
│   │   ├── MacrosSummary.tsx
│   │   ├── FreeMealIndicator.tsx
│   │   └── dashboard.module.css
│   │
│   ├── ingredients/               # 2.2 — Banco de Ingredientes
│   │   ├── IngredientsPage.tsx
│   │   ├── IngredientTable.tsx
│   │   ├── IngredientForm.tsx
│   │   └── ingredients.module.css
│   │
│   ├── meals/                     # 2.3 — Banco de Refeições
│   │   ├── MealsPage.tsx
│   │   ├── MealBuilder.tsx        # Montar refeição com ingredientes
│   │   ├── MealGrid.tsx           # Grade de cards filtráveis
│   │   └── meals.module.css
│   │
│   ├── recipes/                   # 2.4 — Receitas
│   │   ├── RecipesPage.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   └── recipes.module.css
│   │
│   ├── meal-plan/                 # 2.5 — Planejador Semanal
│   │   ├── MealPlanPage.tsx
│   │   ├── WeekCalendar.tsx       # Grade semanal com drag & drop
│   │   ├── DayColumn.tsx
│   │   ├── SlotDropZone.tsx
│   │   └── meal-plan.module.css
│   │
│   ├── free-meals/                # 2.6 — Refeições Livres ⭐
│   │   ├── FreeMealsPage.tsx
│   │   ├── FreeMealCalendar.tsx
│   │   ├── FreeMealCounter.tsx
│   │   ├── FreeMealHistory.tsx
│   │   └── free-meals.module.css
│   │
│   ├── daily-log/                 # 2.7 — Registro do Dia
│   │   ├── DailyLogPage.tsx
│   │   ├── LogTimeline.tsx        # Timeline de refeições consumidas
│   │   ├── QuickAddMeal.tsx
│   │   └── daily-log.module.css
│   │
│   ├── quick-decide/              # 2.8 — Decisão Rápida
│   │   ├── QuickDecidePage.tsx
│   │   ├── SuggestionCards.tsx
│   │   └── quick-decide.module.css
│   │
│   ├── shopping-list/             # 2.9 — Lista de Compras
│   │   ├── ShoppingListPage.tsx
│   │   ├── ShoppingItems.tsx
│   │   └── shopping-list.module.css
│   │
│   └── measurements/              # 2.10 — Minhas Medidas
│       ├── MeasurementsPage.tsx
│       ├── WeightChart.tsx
│       └── measurements.module.css
│
├── hooks/
│   ├── useLocalStorage.ts         # Persistência em localStorage
│   ├── useNutrition.ts            # Cálculos de macros/kcal
│   ├── useDailyProgress.ts        # Progresso do dia atual
│   └── useFreeMeals.ts            # Contagem e validação de refeições livres
│
├── lib/
│   ├── calculations.ts            # Funções puras de cálculo nutricional
│   ├── dates.ts                   # Utilitários de data (semana atual, etc.)
│   └── seed-data.ts               # Dados iniciais do Notion
│
├── types/
│   └── index.ts                   # Todas as interfaces TypeScript
│
├── index.css                      # Design system global (variáveis, reset, tipografia)
└── main.tsx                       # Entry point
```

---

## Design Visual

### Paleta de Cores (Dark Mode Premium)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e17;          /* Fundo principal — quase preto azulado */
  --bg-secondary: #111827;        /* Cards, sidebar */
  --bg-elevated: #1a2235;         /* Cards elevados, modais */
  --bg-glass: rgba(17, 24, 39, 0.7); /* Glassmorphism */

  /* Accent — Verde saúde */
  --accent-primary: #10b981;      /* Emerald 500 */
  --accent-light: #34d399;        /* Emerald 400 */
  --accent-dark: #059669;         /* Emerald 600 */
  --accent-glow: rgba(16, 185, 129, 0.15);

  /* Macros — Cores distintas */
  --color-carbs: #f59e0b;         /* Amber — Carboidratos */
  --color-protein: #3b82f6;       /* Blue — Proteína */
  --color-fat: #ef4444;           /* Red — Gordura */
  --color-kcal: #10b981;          /* Emerald — Calorias */

  /* Semânticas */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* Texto */
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Bordas e separadores */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);

  /* Sombras */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 20px var(--accent-glow);

  /* Tipografia */
  --font-family: 'Inter', -apple-system, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### Princípios Visuais

- **Sidebar** fixa à esquerda com ícones + labels, indicador de rota ativa com glow verde
- **Cards** com `backdrop-filter: blur(12px)` + borda sutil + hover scale(1.02)
- **Barras de progresso** com gradiente animado e cantos arredondados
- **Botão "Decisão Rápida"** em destaque com animação de pulse sutil
- **Micro-animações**: fade-in ao entrar nas páginas, slide-up nos cards, transições suaves nos dados

---

## Roadmap de Implementação (4 Fases)

### Fase 1 — Fundação + Core (Prioridade Máxima)

> Dashboard funcional com registro diário — já permite uso no dia a dia.

#### Inicialização do Projeto
- `npx create-vite@latest ./ --template react-ts`
- Instalar dependências: `react-router-dom`, `@dnd-kit/core`, `@dnd-kit/sortable`, `recharts`, `lucide-react`
- Configurar path aliases (`@/`)
- Configurar Google Fonts (Inter)

#### Design System (`index.css`)
- CSS Reset moderno
- Variáveis CSS (paleta completa acima)
- Tipografia (escalas, pesos)
- Classes utilitárias base
- Estilos de glassmorphism, sombras, transições

#### Layout Global (`Layout.tsx`, `Sidebar.tsx`, `Header.tsx`)
- Sidebar com navegação (ícones Lucide + label)
- Header com título da página + data
- Responsivo (sidebar collapsa em mobile)

#### Infraestrutura de Dados
- `useLocalStorage.ts` — hook de persistência
- `NutrilProvider.tsx` — Context + Reducer central
- `types/index.ts` — Todas as interfaces
- `seed-data.ts` — Dados iniciais
- `calculations.ts` — Funções de cálculo nutricional

#### Dashboard (Módulo 2.1)
- Barras de progresso: kcal consumidas vs meta
- 3 barras de macros (carbo, proteína, gordura) com cores distintas
- Indicador de refeições livres da semana
- Resumo rápido do dia

#### Banco de Ingredientes (Módulo 2.2)
- Tabela com busca e ordenação
- CRUD de ingredientes (modal de criação/edição)
- Cálculo automático de kcal a partir dos macros

#### Banco de Refeições (Módulo 2.3)
- Grade de MealCards filtráveis por tipo e tags
- MealBuilder: montar refeição selecionando ingredientes + quantidades
- Cálculo automático de totais

#### Daily Log (Módulo 2.7)
- Timeline de refeições consumidas hoje
- "Quick Add": selecionar refeição do banco com 1 clique
- Soma automática ao progresso do Dashboard

---

### Fase 2 — Planejamento (Refeições Livres + Meal Plan)

> Controle da semana inteira e das refeições livres.

#### Refeições Livres (Módulo 2.6) ⭐
- Configuração do limite semanal
- Calendário visual para marcar/desmarcar dias
- Contador visual: "X/Y usadas esta semana"
- Alerta ao ultrapassar o limite
- Histórico das últimas 8 semanas (mini-gráfico)

#### Meal Plan (Módulo 2.5)
- Grade semanal (seg-dom) × 4 slots (café, almoço, jantar, lanche)
- Drag & drop com @dnd-kit: arrastar refeições do banco para os slots
- Soma automática de kcal/macros por dia
- Indicadores visuais: dia dentro/fora da meta

---

### Fase 3 — Funcionalidades Complementares

#### Receitas (Módulo 2.4)
- Cards de receitas com status visual
- Formulário de criação com campos: tempo, método, instruções
- Vínculo com refeição do banco

#### Decisão Rápida (Módulo 2.8)
- Calcula kcal/macros restantes do dia
- Filtra banco de refeições que cabem no restante
- Mostra 2-3 sugestões com card animado
- Botão de destaque na home com animação pulse

#### Lista de Compras (Módulo 2.9)
- Geração automática a partir do Meal Plan da semana
- Agrupa por ingrediente, somando quantidades
- Checkbox para marcar itens comprados
- Botão de copiar/compartilhar lista

---

### Fase 4 — Tracking e Refinamentos

#### Minhas Medidas (Módulo 2.10)
- Formulário simples de registro (peso + data + notas)
- Gráfico de evolução com Recharts (linha temporal)
- Indicadores de tendência

#### Melhorias Gerais
- PWA (service worker para uso offline)
- Export/import de dados (JSON)
- Toggle light/dark mode
- Melhorias de acessibilidade

---

## Plano de Verificação

### Testes Automatizados
- Funções de cálculo nutricional (`calculations.ts`): testes unitários
- Hook `useLocalStorage`: testes de persistência
- Lógica de refeições livres: testes de limites e alertas

### Verificação Manual via Browser
- Dashboard renderiza com dados seed corretos
- CRUD de ingredientes persiste após reload
- MealBuilder calcula macros corretamente em tempo real
- Daily Log soma corretamente ao progresso
- Drag & drop funciona no Meal Plan
- Refeições livres respeita o limite e exibe histórico
- Decisão Rápida filtra e sugere corretamente
- Lista de Compras gera a partir do plano semanal
- Gráfico de medidas renderiza evolução
- Layout responsivo (desktop + mobile)
- Todas as animações e micro-interações funcionam

### Validação de Build
```bash
npm run build  # Confirma que compila sem erros
npm run dev     # Dev server para iteração rápida
```
