import { useEffect, useState } from 'react'
import { LayoutDashboard, ArrowLeftRight, Tag, BarChart3, Target } from 'lucide-react'
import './App.css'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { CategoriesManager } from './components/CategoriesManager'
import { Dashboard } from './components/Dashboard'
import { Reports } from './components/Reports'
import { BudgetLimits } from './components/BudgetLimits'
import { api, type Category, type Transaction } from './api/client'

export type { Category, Transaction }

type Tab = 'dashboard' | 'transactions' | 'categories' | 'reports' | 'budgets'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'budgets', label: 'Budgets', icon: Target },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(),
      ])
      setCategories(cats)
      setTransactions(txs)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const addTransaction = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    try {
      const { id: _ignored, ...payload } = transaction
      if (editingId) {
        const updated = await api.updateTransaction(editingId, payload)
        setTransactions((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
        setEditingId(null)
      } else {
        const created = await api.createTransaction(payload)
        setTransactions((prev) => [created, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }

  const startEdit = (id: string) => setEditingId(id)
  const cancelEdit = () => setEditingId(null)

  const addCategory = async (name: string, color: string) => {
    try {
      const created = await api.createCategory(name, color)
      setCategories((prev) => [...prev, created])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    }
  }

  const deleteCategory = async (id: string) => {
    if (transactions.some((t) => t.categoryId === id)) {
      alert('Cannot delete category with transactions. Delete the transactions first.')
      return
    }
    try {
      await api.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const updateBudget = async (categoryId: string, budget: number) => {
    try {
      await api.setBudget(categoryId, budget)
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, budget } : c))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget')
    }
  }

  const activeMeta = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 sm:px-8 sm:py-6">
        <h1 className="text-xl sm:text-3xl font-bold text-indigo-400">Budget Tracker</h1>
        <p className="hidden sm:block text-slate-400 text-sm mt-1">Track your finances with ease</p>
      </header>

      {/* Desktop tabs */}
      <nav className="hidden sm:block bg-slate-800 border-b border-slate-700 px-8">
        <div className="flex gap-8">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Padding bottom on mobile reserves space for the bottom nav */}
      <main className="p-4 sm:p-8 pb-24 sm:pb-8">
        {error && (
          <div className="mb-4 sm:mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-xs uppercase tracking-wider text-red-200 hover:text-white"
            >
              dismiss
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{activeMeta.label}</h2>
            {activeTab === 'dashboard' && (
              <Dashboard transactions={transactions} categories={categories} />
            )}
            {activeTab === 'transactions' && (
              <>
                <TransactionForm
                  categories={categories}
                  onAddTransaction={addTransaction}
                  onAddCategory={addCategory}
                  editingTransaction={
                    editingId ? transactions.find((t) => t.id === editingId) : undefined
                  }
                  onCancelEdit={cancelEdit}
                />
                <TransactionList
                  transactions={transactions}
                  categories={categories}
                  onDeleteTransaction={deleteTransaction}
                  onEditTransaction={startEdit}
                />
              </>
            )}
            {activeTab === 'categories' && (
              <CategoriesManager
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
              />
            )}
            {activeTab === 'reports' && (
              <Reports transactions={transactions} categories={categories} />
            )}
            {activeTab === 'budgets' && (
              <BudgetLimits
                categories={categories}
                transactions={transactions}
                onUpdateBudget={updateBudget}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile bottom nav. pb-safe via env() so it sits above the home indicator on iOS. */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-800/95 backdrop-blur border-t border-slate-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] transition ${
                  active ? 'text-indigo-400' : 'text-slate-400 active:text-white'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
