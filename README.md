# Budget Tracker

A full-stack personal finance application for tracking income, expenses, and budgets. Built with React, Express, PostgreSQL, and Docker.

**Live Demo:** [Coming soon - exposed via home server]

## Features

- ✅ Track transactions (income & expenses)
- ✅ Organize spending by categories with color coding
- ✅ Set and monitor category budgets
- ✅ Persistent data storage with PostgreSQL
- ✅ Clean, responsive React UI
- ✅ Full Docker deployment support

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- npm with workspaces support
- PostgreSQL 16+ (or use Docker)

### Development Setup

```bash
# Clone and install
git clone https://github.com/MenokoOG/budget-tracker-fullstack.git
cd budget-tracker-fullstack
npm install --workspaces --include-workspace-root

# Create .env file
cp packages/frontend/.env.example .env

# Start PostgreSQL (Docker)
docker run -d --name budget-postgres \
  -e POSTGRES_PASSWORD=budget \
  -e POSTGRES_DB=budget_tracker \
  -p 5432:5432 \
  postgres:16-alpine

# Run development servers
npm run dev --workspace=@budget-tracker/api    # Terminal 1, runs on :3000
npm run dev --workspace=@budget-tracker/frontend # Terminal 2, runs on :5173
```

Open http://localhost:5173 in your browser.

## Docker Deployment

### Home Server / Coolify / CasaOS

```bash
# Build and run
docker compose up -d --build

# Verify
docker compose ps
curl http://localhost:3000
```

Access at `http://<server-ip>:3000`

### Cloud Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for guides on Render, Railway, and other platforms.

## Project Structure

```
packages/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   └── pages/
│   └── vite.config.ts
├── api/               # Express server
│   ├── src/
│   │   ├── routes/
│   │   ├── db/
│   │   └── migrations/
│   └── package.json
└── shared/            # (future) shared types
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express.js + Node 20 |
| Database | PostgreSQL 16 |
| Deployment | Docker + Docker Compose |
| Package Mgmt | npm workspaces |

## API Reference

**Categories:**
- `GET    /api/categories`           list categories (includes `budget` if set)
- `POST   /api/categories`           `{ name, color }`
- `DELETE /api/categories/:id`

**Transactions:**
- `GET    /api/transactions`
- `POST   /api/transactions`         `{ amount, categoryId, date, note?, type }`
- `PUT    /api/transactions/:id`
- `DELETE /api/transactions/:id`

**Budgets:**
- `GET    /api/budgets`              list budget_limits rows
- `PUT    /api/budgets/:categoryId`  `{ amount }` — upserts the limit
- `DELETE /api/budgets/:categoryId`

**Health:**
- `GET    /api/health`

## Development Notes

### API Architecture
- All routes under `/api/` prefix
- Frontend served from `/` (static files from API)
- CORS configured for both dev and production
- Database connection pooled via DATABASE_URL

### Frontend Build
- VITE_API_URL build variable controls API endpoint
- In Docker: set as build arg `VITE_API_URL=/` for relative paths
- In dev: set in `.env` for Vite to pick up at build time

### Environment Variables

**Build-time (Vite):**
- `VITE_API_URL` - Base URL for API calls (baked into compiled code)

**Runtime (Express):**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - production/development
- `CORS_ORIGIN` - CORS allowed origin

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute.

## Security

See [SECURITY.md](./SECURITY.md) for security guidelines and responsible disclosure.

## Case Study

This project is documented with a detailed [case study](./CASE_STUDY.md) showing how it was built using agentic AI engineering practices, including the challenges of deploying a full-stack application to a home server while learning networks and debugging.

## License

MIT - See [LICENSE](./LICENSE) for details.

## Support

- Report bugs: [GitHub Issues](https://github.com/MenokoOG/budget-tracker-fullstack/issues)
- Questions: Check [Discussions](https://github.com/MenokoOG/budget-tracker-fullstack/discussions)
