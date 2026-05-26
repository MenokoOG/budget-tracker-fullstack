# Budget Tracker — Full-Stack Monorepo

Express + TypeScript API, PostgreSQL, and a React + Vite frontend, in a single npm workspace.

```
packages/
  api/        Express + TypeScript + pg
  frontend/   React + Vite + Tailwind
```

## Quick start (Docker, recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- API:      http://localhost:3000
- Postgres: localhost:5433 (user/pass/db from `.env`) — 5432 is left for any host Postgres install

Migrations run automatically on api startup.

## Local (no Docker)

```bash
npm install
# Start a local postgres yourself, then:
DATABASE_URL=postgres://user:pass@localhost:5432/budget_tracker npm run migrate
npm run dev:api      # http://localhost:3000
npm run dev:frontend # http://localhost:5173
```

## Production image

Multi-stage build that produces a single image serving the API and the built frontend
static files from `/`. API routes live under `/api/*`.

```bash
docker build -t budget-tracker:latest .
docker run -p 3000:3000 --env-file .env budget-tracker:latest
```

## API surface

- `GET    /api/categories`           list categories (includes `budget` if set)
- `POST   /api/categories`           `{ name, color }`
- `DELETE /api/categories/:id`
- `GET    /api/transactions`
- `POST   /api/transactions`         `{ amount, categoryId, date, note?, type }`
- `PUT    /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET    /api/budgets`              list budget_limits rows
- `PUT    /api/budgets/:categoryId`  `{ amount }` — upserts the limit
- `DELETE /api/budgets/:categoryId`
- `GET    /api/health`
