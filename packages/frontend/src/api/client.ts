export interface Category {
  id: string
  name: string
  color: string
  budget?: number
}

export interface Transaction {
  id: string
  amount: number
  categoryId: string
  date: string
  note?: string
  type: 'income' | 'expense'
}

export type NewTransaction = Omit<Transaction, 'id'>

const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      if (body && typeof body.error === 'string') message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  // categories
  listCategories: () => request<Category[]>('/api/categories'),
  createCategory: (name: string, color: string) =>
    request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/api/categories/${id}`, { method: 'DELETE' }),

  // transactions
  listTransactions: () => request<Transaction[]>('/api/transactions'),
  createTransaction: (t: NewTransaction) =>
    request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(t),
    }),
  updateTransaction: (id: string, t: NewTransaction) =>
    request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(t),
    }),
  deleteTransaction: (id: string) =>
    request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),

  // budgets
  setBudget: (categoryId: string, amount: number) =>
    request<{ id: string; categoryId: string; amount: number; period: string }>(
      `/api/budgets/${categoryId}`,
      { method: 'PUT', body: JSON.stringify({ amount }) }
    ),
  clearBudget: (categoryId: string) =>
    request<void>(`/api/budgets/${categoryId}`, { method: 'DELETE' }),
}
