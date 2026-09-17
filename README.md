# AgriDirect 

A digital marketplace that connects farmers directly with buyers, with market insights and AI-powered tools to support better selling decisions.

## Project structure

```text
ignite_hack/
├── assets/                 # Static assets and test images
├── backend/                # Python FastAPI backend
├── database/               # SQL schema, initialization and seed data
├── docs/                   # Team and project documentation
├── public/                 # Public frontend assets
├── src/                    # React + TypeScript frontend and frontend services
├── server.ts               # Node/Express development server and API integration
├── package.json            # Frontend/Node dependencies and scripts
├── backend/requirements.txt # Python dependencies
├── .env.example            # Root environment variable template
└── README.md
```

## Frontend / Node setup

Prerequisites: Node.js

```bash
npm install
npm run dev
```

The project uses Vite, React, TypeScript and an Express/TypeScript development server.

## FastAPI backend setup

Prerequisites: Python 3.10+

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python run.py
```

For Linux/macOS, activate with `source venv/bin/activate`.

## Environment variables

Copy the example environment files and add local values:

```text
.env.example        -> .env
backend/.env.example -> backend/.env
```

**Never commit `.env` files, API keys, database passwords, or JWT secrets.**

## Database

Database SQL files are in `database/`:

- `init.sql`
- `schema.sql`
- `seed.sql`

See `backend/README.md` for backend/database setup details.

## Team workflow

See [`docs/TEAM_GIT_WORKFLOW.md`](docs/TEAM_GIT_WORKFLOW.md) for the recommended 4-member GitHub workflow.
