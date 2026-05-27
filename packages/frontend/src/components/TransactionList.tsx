import { Trash2, Edit2 } from 'lucide-react'

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

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (id: string) => void
}

export function TransactionList({ transactions, categories, onDeleteTransaction, onEditTransaction }: TransactionListProps) {
  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.color || '#6366f1'
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (transactions.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-2xl mt-6">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60"></div>
        <div className="relative z-10 p-8 text-center">
          <p className="text-slate-300 font-medium">No transactions yet. Add one to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl mt-6">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60"></div>

      {/* Mobile: card list */}
      <ul className="md:hidden relative z-10 divide-y divide-slate-700/40">
        {sortedTransactions.map((transaction) => (
          <li key={transaction.id} className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="inline-block px-2 py-0.5 rounded-md text-white text-[11px] font-bold shadow-sm"
                  style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                >
                  {getCategoryName(transaction.categoryId)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
              {transaction.note && (
                <p className="text-sm text-slate-300 truncate">{transaction.note}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`text-base font-bold ${
                transaction.type === 'income' ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditTransaction(transaction.id)}
                  className="text-slate-400 hover:text-indigo-400 active:text-indigo-300 rounded-lg p-2 -m-2"
                  aria-label="Edit transaction"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="text-slate-400 hover:text-red-400 active:text-red-300 rounded-lg p-2 -m-2"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block relative z-10">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">Note</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-200">Amount</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className="inline-block px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                  >
                    {getCategoryName(transaction.categoryId)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-white text-xs font-bold ${
                    transaction.type === 'income'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 shadow-lg'
                  }`}>
                    {transaction.type === 'income' ? '↓ Income' : '↑ Expense'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{transaction.note || '—'}</td>
                <td className={`px-6 py-4 text-sm text-right font-bold ${
                  transaction.type === 'income' ? 'text-emerald-400' : 'text-orange-400'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEditTransaction(transaction.id)}
                      className="text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
