# Team Git Workflow

This repository is a monorepo. Keep the application structure intact and use Git branches to divide work between the 4 team members.

## Suggested ownership

- Member 1: `src/` frontend UI and React components
- Member 2: `backend/` FastAPI backend
- Member 3: `database/` schema, seed and database changes
- Member 4: integration, API wiring, testing, documentation and shared files

Ownership is flexible. If two members need to edit the same file, coordinate before pushing.

## Branches

Use one branch per member/feature. Examples:

```bash
git checkout -b frontend
# or
git checkout -b backend
# or
git checkout -b database
# or
git checkout -b integration
```

## Daily workflow

Before starting work:

```bash
git checkout main
git pull origin main
git checkout your-branch
```

After making changes:

```bash
git add .
git commit -m "Describe the change"
git push origin your-branch
```

Open a Pull Request on GitHub and merge into `main` after checking the changes.

After a merge, update your local `main` before starting the next task:

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## Important

- Never commit `.env` or API keys/passwords.
- Never commit `node_modules/`, Python `__pycache__/`, virtual environments, or build output.
- Commit `package-lock.json` and `bun.lock` only if the team intentionally uses both package managers. Prefer one package manager for the project to avoid lockfile drift.
- Avoid editing the same file in multiple branches at the same time when possible.
