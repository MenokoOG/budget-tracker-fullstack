import { useState } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
}

interface CategoriesManagerProps {
  categories: Category[]
  onAddCategory: (name: string, color: string) => void
  onDeleteCategory: (id: string) => void
}

export function CategoriesManager({ categories, onAddCategory, onDeleteCategory }: CategoriesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAddCategory(name, color)
    setName('')
    setColor('#6366f1')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
        >
          <Plus size={20} />
          New Category
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Gradient background with border */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60"></div>

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-8">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles size={24} className="text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">Create New Category</h3>
            </div>

            <div className="mb-7">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Groceries, Utilities, Entertainment"
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-500 transition-all font-medium"
                autoFocus
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                Choose Color
              </label>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map(({ hex, name: colorName }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className={`h-12 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-md relative group`}
                    style={{ backgroundColor: hex }}
                    title={colorName}
                  >
                    {color === hex && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-white shadow-lg"></div>
                    )}
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {colorName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg hover:shadow-xl"
              >
                Create Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setName('')
                  setColor('#6366f1')
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {categories.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-700/60 shadow-xl">
          <div className="divide-y divide-slate-700/40">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-lg shadow-md transition-transform group-hover:scale-125"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                    {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 active:text-red-400 rounded-lg p-2.5 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Delete ${cat.name}`}
                  title="Delete category"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && !showForm && (
        <div className="bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 rounded-xl p-8 text-center border border-slate-700/50 shadow-xl">
          <p className="text-slate-400 text-sm font-medium">No categories yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
