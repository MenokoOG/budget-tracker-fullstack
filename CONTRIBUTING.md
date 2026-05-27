# Contributing to Budget Tracker

Thank you for your interest in contributing to Budget Tracker! This document outlines how to get started, report issues, submit features, and work with the codebase.

## Code of Conduct

We're building a community that welcomes developers of all backgrounds, including those with neurocognitive differences. Be respectful, inclusive, and kind in all interactions.

## Getting Started

### Local Development

1. **Fork and clone:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/budget-tracker-fullstack.git
   cd budget-tracker-fullstack
   ```

2. **Install dependencies:**
   ```bash
   npm install --workspaces --include-workspace-root
   ```

3. **Set up PostgreSQL:**
   ```bash
   docker run -d --name budget-postgres \
     -e POSTGRES_PASSWORD=budget \
     -e POSTGRES_DB=budget_tracker \
     -p 5432:5432 \
     postgres:16-alpine
   ```

4. **Create `.env` file:**
   ```bash
   cp packages/frontend/.env.example .env
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1
   npm run dev --workspace=@budget-tracker/api

   # Terminal 2
   npm run dev --workspace=@budget-tracker/frontend
   ```

6. **Access the app:** http://localhost:5173

## Reporting Issues

### Bug Reports

Create a GitHub issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

### Feature Requests

Describe:
- The problem you're trying to solve
- Why this feature would be useful
- Possible implementation approaches

## Submitting Changes

### Branch Naming

Use descriptive names:
- `feature/add-csv-export` for new features
- `fix/cors-origin-matching` for bug fixes
- `docs/deployment-guide` for documentation

### Commit Messages

Write clear, descriptive commits:
- Use imperative mood ("add feature" not "added feature")
- Reference issues: `fix: resolve login bug (fixes #42)`
- Keep messages concise but informative

### Pull Requests

1. **Keep PRs focused** — one feature or fix per PR
2. **Test locally** — run tests and verify the app works
3. **Update documentation** — if your change affects user-facing behavior, update README or relevant docs
4. **Write a clear description:**
   - What problem does this solve?
   - How were changes tested?
   - Any breaking changes?

### Code Style

We use:
- **Frontend:** React 18 + TypeScript with Vite
- **Backend:** Express.js with Node 20
- **Database:** PostgreSQL 16

Follow existing patterns in the codebase. No formal linter is enforced yet, but keep code clean and readable.

## Testing

Currently, Budget Tracker has limited automated tests. Help appreciated! When submitting a feature:
- Test manually in both development and Docker
- Document any edge cases
- Consider unit tests for complex logic

## Documentation

Good documentation is crucial. Help us improve:
- Clarify existing docs if something is unclear
- Add examples or tutorials
- Document your feature additions

## Areas to Contribute

### High Priority

- [ ] Unit and integration tests (critical gap)
- [ ] E2E tests for core workflows
- [ ] Deployment guides for additional platforms
- [ ] Dark mode support
- [ ] Mobile-responsive design improvements
- [ ] Accessibility audit (WCAG 2.1)

### Medium Priority

- [ ] CSV/JSON export functionality
- [ ] Category and budget UI enhancements
- [ ] Transaction filtering and search
- [ ] Data visualization (charts, reports)
- [ ] Multi-user support

### Good for New Contributors

- [ ] Documentation improvements
- [ ] Bug fixes
- [ ] Code cleanup and refactoring
- [ ] Adding examples

## Development Workflow (for TBI and Neurodivergent Contributors)

This project was built with input from someone with TBI. If you have neurocognitive differences:

- **Use what works for you:** If code snippets overwhelm you, ask for explanations
- **Work at your pace:** No pressure to rush
- **Take breaks:** Full-stack debugging is cognitively intensive
- **Ask questions:** No such thing as a dumb question here
- **Document your process:** Your perspective helps others

See [CASE_STUDY.md](./CASE_STUDY.md) for more context on how this project embraces diverse working styles.

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Stuck?** Comment on the issue or PR
- **Want to pair?** Reach out — we're open to collaborative debugging sessions

## Review Process

Maintainers will:
1. Review code for correctness and style
2. Test changes in Docker
3. Check documentation
4. Provide feedback (be patient, constructive reviews take time)

## License

By contributing, you agree that your code will be licensed under MIT. See [LICENSE](./LICENSE).

## Recognition

Contributors will be recognized in:
- GitHub contributor graph
- Future release notes
- Project README (for significant contributions)

Thank you for making Budget Tracker better! 🚀
