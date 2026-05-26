import { Router } from 'express';
import { pool } from '../db/pool.js';
import { HttpError } from '../middleware/errorHandler.js';

interface TransactionRow {
  id: number;
  amount: string;
  category_id: number;
  date: Date;
  note: string | null;
  type: 'income' | 'expense';
}

function serialize(r: TransactionRow) {
  return {
    id: String(r.id),
    amount: Number(r.amount),
    categoryId: String(r.category_id),
    date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
    note: r.note ?? undefined,
    type: r.type,
  };
}

interface TransactionInput {
  amount: number;
  categoryId: number;
  date: string;
  note: string | null;
  type: 'income' | 'expense';
}

function parseBody(body: unknown): TransactionInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const amount = typeof b.amount === 'number' ? b.amount : Number(b.amount);
  const categoryId = Number(b.categoryId);
  const date = typeof b.date === 'string' ? b.date : '';
  const note = typeof b.note === 'string' && b.note.length > 0 ? b.note : null;
  const type = b.type === 'income' || b.type === 'expense' ? b.type : null;

  if (!Number.isFinite(amount)) throw new HttpError(400, 'amount must be a number');
  if (!Number.isInteger(categoryId)) throw new HttpError(400, 'categoryId is required');
  if (!date) throw new HttpError(400, 'date is required (YYYY-MM-DD)');
  if (!type) throw new HttpError(400, "type must be 'income' or 'expense'");
  return { amount, categoryId, date, note, type };
}

export const transactionsRouter = Router();

transactionsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<TransactionRow>(
      `SELECT id, amount, category_id, date, note, type
       FROM transactions ORDER BY date DESC, id DESC`
    );
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

transactionsRouter.post('/', async (req, res, next) => {
  try {
    const input = parseBody(req.body);
    const { rows } = await pool.query<TransactionRow>(
      `INSERT INTO transactions (amount, category_id, date, note, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, amount, category_id, date, note, type`,
      [input.amount, input.categoryId, input.date, input.note, input.type]
    );
    res.status(201).json(serialize(rows[0]));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23503') {
      next(new HttpError(400, 'categoryId does not reference an existing category'));
      return;
    }
    next(err);
  }
});

transactionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new HttpError(400, 'invalid id');
    const input = parseBody(req.body);
    const { rows } = await pool.query<TransactionRow>(
      `UPDATE transactions
         SET amount = $1, category_id = $2, date = $3, note = $4, type = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, amount, category_id, date, note, type`,
      [input.amount, input.categoryId, input.date, input.note, input.type, id]
    );
    if (!rows[0]) throw new HttpError(404, 'transaction not found');
    res.json(serialize(rows[0]));
  } catch (err) {
    next(err);
  }
});

transactionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new HttpError(400, 'invalid id');
    const { rowCount } = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'transaction not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
