import { Router } from 'express';
import { pool } from '../db/pool.js';
import { HttpError } from '../middleware/errorHandler.js';

interface CategoryRow {
  id: number;
  name: string;
  color: string;
  budget: string | null;
}

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<CategoryRow>(`
      SELECT c.id, c.name, c.color, bl.amount AS budget
      FROM categories c
      LEFT JOIN budget_limits bl ON bl.category_id = c.id
      ORDER BY c.id ASC
    `);
    res.json(
      rows.map((r) => ({
        id: String(r.id),
        name: r.name,
        color: r.color,
        budget: r.budget == null ? undefined : Number(r.budget),
      }))
    );
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post('/', async (req, res, next) => {
  try {
    const { name, color } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim()) {
      throw new HttpError(400, 'name is required');
    }
    const safeColor = typeof color === 'string' && color.trim() ? color : '#6366f1';
    const { rows } = await pool.query<CategoryRow>(
      `INSERT INTO categories (name, color) VALUES ($1, $2)
       RETURNING id, name, color, NULL::numeric AS budget`,
      [name.trim(), safeColor]
    );
    const r = rows[0];
    res.status(201).json({
      id: String(r.id),
      name: r.name,
      color: r.color,
      budget: undefined,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      next(new HttpError(409, 'A category with that name already exists'));
      return;
    }
    next(err);
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new HttpError(400, 'invalid id');

    const txCheck = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM transactions WHERE category_id = $1',
      [id]
    );
    if (Number(txCheck.rows[0].count) > 0) {
      throw new HttpError(
        409,
        'Cannot delete category with transactions. Delete the transactions first.'
      );
    }

    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'category not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
