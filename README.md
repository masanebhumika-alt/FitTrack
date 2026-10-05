# FitTrack — DevOps Mini Project

Personal fitness/wellness web app with a complete DevOps pipeline:
**Git/GitHub → GitHub Actions (test, build, smoke test) → Docker → Docker Compose deployment → Prometheus → Grafana.**

## Features
- Register / login (JWT, bcrypt)
- Profile + goal (weight loss, weight gain, maintain, muscle building)
- BMI, BMR, TDEE, calorie and macro targets
- 7-day workout plan and 4-meal diet plan
- Water, sleep and weight tracking (weight chart), reminders, dashboard
- Prometheus metrics (`/api/metrics`) and a 12-panel Grafana dashboard

## Tech stack
React + TypeScript + Vite + Tailwind · Node.js + Express + TypeScript + Prisma · PostgreSQL · Vitest + Supertest · GitHub Actions · Docker / Docker Compose · Prometheus · Grafana

## Run everything (Docker Desktop required)
```bash
docker compose up --build -d
docker compose ps            # all services should be running / healthy
```
| Service | URL |
|---|---|
| App | http://localhost:8080 |
| API health | http://localhost:8080/health or http://localhost:4000/health |
| Prometheus | http://localhost:9090 (Status → Targets) |
| Grafana | http://localhost:3001 (admin / admin) → Dashboards → FitTrack → FitTrack API |

Register a new account in the UI. Demo user (local seed only): demo@fittrack.local / demo12345 — see Local development.

Stop: `docker compose down` (add `-v` to delete data).

## Local development
```bash
docker compose up db -d                       # PostgreSQL on localhost:5433
cd backend
cp .env.example .env                          # DATABASE_URL points to localhost:5433
npm install
npx prisma migrate deploy
npm run db:seed                               # optional: demo@fittrack.local / demo12345
npm run dev                                   # API on :4000

cd ../frontend
npm install
npm run dev                                   # UI on :5173 (proxies /api to :4000)
```

## Tests
```bash
cd backend  && npm test        # unit tests + API integration tests (needs the DB running)
cd frontend && npm test        # component / client tests
```
Backend `npm run test:unit` runs only the DB-free unit tests.

## API summary
`POST /api/auth/register|login` · `GET /api/auth/me` · `GET|PUT /api/profile` · `POST /api/profile/generate-plan` ·
`GET /api/plans`, `/plans/workout`, `/plans/diet` · `GET|POST /api/weight|water|sleep` · `GET|POST|PUT|DELETE /api/reminders` ·
`GET /api/dashboard` · `GET /health` · `GET /api/metrics`

## CI/CD pipeline (`.github/workflows/ci.yml`)
1. **backend** – Postgres service, `prisma migrate deploy`, tests + coverage, TypeScript build, upload JUnit/coverage artifacts
2. **frontend** – tests, type-check, production build
3. **docker** – build both images, `docker compose up`, smoke-test app, API proxy, Prometheus target and Grafana dashboard
4. **publish** (push to `main` only) – push images to `ghcr.io/<owner>/fittrack-{backend,frontend}`

## Repository layout
```
backend/      Express API, Prisma schema + migrations, tests, Dockerfile
frontend/     React app, nginx.conf, tests, Dockerfile
monitoring/   Prometheus config + alert rules, Grafana provisioning + dashboard
.github/      CI/CD workflow
docs/         Architecture diagram, step-by-step guide
docker-compose.yml, .env.example
```

## Security notes
No real secrets are committed. `.env` is git-ignored; compose uses demo defaults that you can override via `.env`
(see `.env.example`). The backend refuses to start in production with the default JWT secret.
