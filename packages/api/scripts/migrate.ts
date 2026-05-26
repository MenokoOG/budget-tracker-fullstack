import 'dotenv/config';
import { runMigrations } from '../src/db/migrate.js';
import { pool } from '../src/db/pool.js';

runMigrations()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
