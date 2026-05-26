import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { runMigrations } from './db/migrate.js';
import { pool } from './db/pool.js';
import { categoriesRouter } from './routes/categories.js';
import { transactionsRouter } from './routes/transactions.js';
import { budgetsRouter } from './routes/budgets.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const port = Number(process.env.API_PORT ?? 3000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = join(__dirname, '..', 'public');
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(staticDir, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error('[api] migration failed', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`[api] listening on http://0.0.0.0:${port}`);
  });
}

start();
