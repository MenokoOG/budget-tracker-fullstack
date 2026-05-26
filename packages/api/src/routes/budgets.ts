import { Router } from 'express';
import { pool } from '../db/pool.js';
import { HttpError } from '../middleware/errorHandler.js';

interface BudgetRow {
  id: number;
  category_id: number;
  amount: string;
  period: string;
}

function serialize(r: BudgetRow) {
  return {
    id: String(r.id),
    categoryId: String(r.category_id),
    amount: Number(r.amount),
    period: r.period,
  };
}

export const budgetsRouter = Router();

budgetsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<BudgetRow>(
      'SELECT id, category_id, amount, period FROM budget_limits ORDER BY id ASC'
    );
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

budgetsRouter.put('/:categoryId', async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    if (!Number.isInteger(categoryId)) throw new HttpError(400, 'invalid categoryId');
    const amount = Number((req.body ?? {}).amount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new HttpError(400, 'amount must be a non-negative number');
    }
    const period =
      typeof (req.body ?? {}).period === 'string' ? req.body.period : 'monthly';

    const { rows } = await pool.query<BudgetRow>(
      `INSERT INTO budget_limits (category_id, amount, period)
       VALUES ($1, $2, $3)
       ON CONFLICT (category_id)
       DO UPDATE SET amount = EXCLUDED.amount, period = EXCLUDED.period, updated_at = NOW()
       RETURNING id, category_id, amount, period`,
      [categoryId, amount, period]
    );
    res.status(200).json(serialize(rows[0]));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23503') {
      next(new HttpError(400, 'categoryId does not reference an existing category'));
      return;
    }
    next(err);
  }
});

budgetsRouter.delete('/:categoryId', async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    if (!Number.isInteger(categoryId)) throw new HttpError(400, 'invalid categoryId');
    const { rowCount } = await pool.query(
      'DELETE FROM budget_limits WHERE category_id = $1',
      [categoryId]
    );
    if (!rowCount) throw new HttpError(404, 'budget not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
