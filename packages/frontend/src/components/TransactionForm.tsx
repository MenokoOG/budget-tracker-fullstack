import { useState, useEffect } from 'react'
import { Plus, X, Palette, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
}

interface Transaction {
  id?: string
  amount: number
  categoryId: string
  date: string
  note?: string
  type: 'income' | 'expense'
}

interface TransactionFormProps {
  categories: Category[]
  onAddTransaction: (transaction: Transaction) => void
  onAddCategory?: (name: string, color: string) => void
  editingTransaction?: Transaction
  onCancelEdit?: () => void
}

export function TransactionForm({ categories, onAddTransaction, onAddCategory, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const [showForm, setShowForm] = useState(!!editingTransaction)
  const [amount, setAmount] = useState(editingTransaction?.amount.toString() || '')
  const [categoryId, setCategoryId] = useState(editingTransaction?.categoryId || categories[0]?.id || '')
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(editingTransaction?.note || '')
  const [type, setType] = useState<'income' | 'expense'>(editingTransaction?.type || 'expense')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')

  useEffect(() => {
    if (editingTransaction) {
      setShowForm(true)
      setAmount(editingTransaction.amount.toString())
      setCategoryId(editingTransaction.categoryId)
      setDate(editingTransaction.date)
      setNote(editingTransaction.note || '')
      setType(editingTransaction.type)
    }
  }, [editingTransaction])

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !categoryId || !date) return

    onAddTransaction({
      id: editingTransaction?.id,
      amount: parseFloat(amount),
      categoryId,
      date,
      note: note || undefined,
      type,
    })

    setAmount('')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId(categories[0]?.id || '')
    setType('expense')
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setShowNewCategory(false)
    setAmount('')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId(categories[0]?.id || '')
    setType('expense')
    onCancelEdit?.()
  }

  const colorOptions = [
    { hex: '#6366f1', name: 'Indigo' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#8b5cf6', name: 'Violet' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#14b8a6', name: 'Teal' },
    { hex: '#3b82f6', name: 'Blue' },
  ]

  const getTypeColor = (txType: 'income' | 'expense') => {
    return txType === 'income'
      ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
      : 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
  }

  const getTypeIcon = (txType: 'income' | 'expense') => {
    return txType === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 mb-6"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden shadow-2xl mb-6">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60"></div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            {!showNewCategory ? (
              <>
                {/* Transaction Type with Icons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                    Transaction Type
                  </label>
                  <div className="flex gap-3">
                    {(['expense', 'income'] as const).map((txType) => (
                      <label
                        key={txType}
                        className={`flex-1 flex items-center gap-2 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          type === txType
                            ? txType === 'income'
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-red-500 bg-red-500/20'
                            : 'border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={txType}
                          checked={type === txType}
                          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                          className="w-4 h-4"
                        />
                        <span className={`font-semibold ${txType === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {txType === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-bold text-lg"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Category
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition text-slate-300 hover:text-white font-bold"
                      title="Create new category"
                    >
                      <Palette size={20} />
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-medium"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Note <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Groceries at Whole Foods"
                    className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-medium"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 bg-gradient-to-r ${getTypeColor(type)} text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                  >
                    {getTypeIcon(type)}
                    {editingTransaction ? '✓ Update' : '+ Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* New Category Form */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Groceries"
                    className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                    Choose Color
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.map(({ hex, name }) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setNewCategoryColor(hex)}
                        className="h-12 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-md relative group"
                        style={{ backgroundColor: hex }}
                        title={name}
                      >
                        {newCategoryColor === hex && (
                          <div className="absolute inset-0 rounded-lg ring-2 ring-white shadow-lg"></div>
                        )}
                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        onAddCategory?.(newCategoryName, newCategoryColor)
                        setNewCategoryName('')
                        setNewCategoryColor('#6366f1')
                        setShowNewCategory(false)
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg hover:shadow-xl"
                  >
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategoryName('')
                      setNewCategoryColor('#6366f1')
                      setShowNewCategory(false)
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-md"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
