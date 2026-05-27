import { useMemo } from 'react'

interface Category {
  id: string
  name: string
  color: string
}

interface Transaction {
  id: string
  amount: number
  categoryId: string
  date: string
  note?: string
  type: 'income' | 'expense'
}

interface ReportsProps {
  transactions: Transaction[]
  categories: Category[]
}

export function Reports({ transactions, categories }: ReportsProps) {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const months: { [key: string]: { income: number; expense: number } } = {}
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      months[key] = { income: 0, expense: 0 }
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.date)
      const key = tDate.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      })
      if (key in months) {
        if (t.type === 'income') {
          months[key].income += t.amount
        } else {
          months[key].expense += t.amount
        }
      }
    })

    return months
  }, [transactions])

  // Category spending
  const categorySpending = useMemo(() => {
    const catTotals: { [key: string]: number } = {}

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = categoryMap.get(t.categoryId)
        if (cat) {
          catTotals[cat.id] = (catTotals[cat.id] || 0) + t.amount
        }
      })

    return Object.entries(catTotals)
      .map(([catId, amount]) => ({
        name: categoryMap.get(catId)?.name || 'Unknown',
        color: categoryMap.get(catId)?.color || '#6366f1',
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, categoryMap])

  // Overall stats
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const avgMonthlyExpense = totalExpense / 12

    return { totalIncome, totalExpense, avgMonthlyExpense }
  }, [transactions])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-600/30 via-slate-800 to-slate-900 border border-emerald-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Income</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${stats.totalIncome.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-2">All time</p>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-600/30 via-slate-800 to-slate-900 border border-red-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400">
              ${stats.totalExpense.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-2">All time</p>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-600/30 via-slate-800 to-slate-900 border border-indigo-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Avg Monthly</p>
            <p className="text-2xl font-bold text-indigo-400">
              ${stats.avgMonthlyExpense.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-2">Expense</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60">
        <div className="relative z-10 p-4 sm:p-8">
          <h3 className="text-sm font-bold text-slate-200 mb-6 uppercase tracking-wider">12-Month Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/60">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Month</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Income</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Expense</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Net</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthlySummary).map(([month, data]) => (
                  <tr key={month} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-medium">{month}</td>
                    <td className="text-right px-4 py-3 text-emerald-400 font-semibold">
                      ${data.income.toFixed(2)}
                    </td>
                    <td className="text-right px-4 py-3 text-orange-400 font-semibold">
                      ${data.expense.toFixed(2)}
                    </td>
                    <td
                      className={`text-right px-4 py-3 font-bold ${
                        data.income - data.expense >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      ${(data.income - data.expense).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60">
        <div className="relative z-10 p-4 sm:p-8">
          <h3 className="text-sm font-bold text-slate-200 mb-6 uppercase tracking-wider">Spending by Category</h3>
          {categorySpending.length === 0 ? (
            <p className="text-slate-400">No expenses yet.</p>
          ) : (
            <div className="space-y-4">
              {categorySpending.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-md"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-white font-bold">
                      ${cat.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden border border-slate-700/40">
                    <div
                      className="h-full transition-all shadow-lg"
                      style={{
                        backgroundColor: cat.color,
                        width: `${(cat.amount / stats.totalExpense) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
