import { useState } from 'react'
import { Edit2, X, Check, TrendingUp } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
  budget?: number
}

interface Transaction {
  id: string
  amount: number
  categoryId: string
  date: string
  note?: string
  type: 'income' | 'expense'
}

interface BudgetLimitsProps {
  categories: Category[]
  transactions: Transaction[]
  onUpdateBudget: (categoryId: string, budget: number) => void
}

export function BudgetLimits({ categories, transactions, onUpdateBudget }: BudgetLimitsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const getCategorySpending = (categoryId: string) => {
    return transactions
      .filter((t) => t.categoryId === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getStatusColor = (spent: number, budget: number | undefined) => {
    if (!budget) return 'text-slate-400'
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'text-red-400'
    if (percentage >= 80) return 'text-amber-400'
    return 'text-emerald-400'
  }

  const getStatusTextColor = (spent: number, budget: number | undefined) => {
    if (!budget) return 'text-slate-300'
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'text-red-300'
    if (percentage >= 80) return 'text-amber-300'
    return 'text-emerald-300'
  }

  const getProgressBarColor = (spent: number, budget: number | undefined) => {
    if (!budget) return 'bg-slate-600'
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'bg-gradient-to-r from-red-500 to-red-600'
    if (percentage >= 80) return 'bg-gradient-to-r from-amber-500 to-amber-600'
    return 'bg-gradient-to-r from-emerald-500 to-teal-600'
  }

  const getCardBgGradient = (color: string) => {
    // Create a subtle gradient using the category color at low opacity
    return {
      background: `linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)`
    }
  }

  const handleSaveBudget = (categoryId: string) => {
    const value = parseFloat(editValue)
    if (!isNaN(value) && value >= 0) {
      onUpdateBudget(categoryId, value)
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleStartEdit = (categoryId: string, currentBudget: number | undefined) => {
    setEditingId(categoryId)
    setEditValue(currentBudget?.toString() || '')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 rounded-xl p-8 text-center border border-slate-700/50 shadow-xl">
        <div className="flex justify-center mb-4 opacity-30">
          <TrendingUp size={32} className="text-indigo-400" />
        </div>
        <p className="text-slate-400 text-sm font-medium">No categories yet. Create a category to set a budget.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const spent = getCategorySpending(cat.id)
        const budget = cat.budget
        const isEditing = editingId === cat.id
        const percentage = budget ? Math.min((spent / budget) * 100, 100) : 0
        const isOverBudget = spent > (budget || 0)

        return (
          <div
            key={cat.id}
            className="group relative rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
            style={getCardBgGradient(cat.color)}
          >
            {/* Accent bar on left */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
              style={{ backgroundColor: cat.color }}
            />

            <div className="pl-4 pr-4 sm:pr-6 py-4 sm:py-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-lg shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider letter-spacing-1">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      Spent:{' '}
                      <span className={`font-bold ${getStatusColor(spent, budget)}`}>
                        ${spent.toFixed(2)}
                      </span>
                      {budget && (
                        <span className="text-slate-400 ml-1">
                          / <span className="text-slate-300 font-semibold">${budget.toFixed(2)}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(cat.id, budget)}
                    className="text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg p-2 transition-all duration-200"
                    title={budget ? 'Edit budget' : 'Set budget'}
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>

              {budget && (
                <div className="mb-5">
                  <div className="w-full bg-slate-700/40 rounded-full h-2.5 overflow-hidden border border-slate-700/60 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(spent, budget)} shadow-lg`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {percentage.toFixed(0)}% used
                    </p>
                    {isOverBudget && (
                      <p className={`text-xs font-bold uppercase tracking-wide ${getStatusTextColor(spent, budget)}`}>
                        Over budget by ${(spent - budget).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-2 items-end mt-4 pt-4 border-t border-slate-700/40">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-300 mb-3">
                      Monthly Budget Limit
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-semibold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveBudget(cat.id)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg transition-all font-bold shadow-md hover:shadow-lg"
                    title="Save budget"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all font-bold shadow-md"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {!isEditing && !budget && (
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">No budget limit set yet.</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
