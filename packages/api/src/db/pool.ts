import pg from 'pg';

const { Pool } = pg;

function buildConnectionConfig(): pg.PoolConfig {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  return {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'budget_tracker',
  };
}

export const pool = new Pool(buildConnectionConfig());

pool.on('error', (err) => {
  console.error('[pg] unexpected idle client error', err);
});
