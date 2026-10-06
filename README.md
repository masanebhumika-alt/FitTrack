# FitTrack — DevOps Mini Project

A small personalized fitness/wellness web application built to demonstrate the complete DevOps flow required by the college mini-project.

## Features
- Register/login with JWT authentication
- User profile: age, gender, height, weight, target weight, activity level
- Goals: weight loss, weight gain, maintain, muscle building
- BMI, BMR, TDEE, calorie and macro calculations
- 7-day workout plan (no interactive timer/session system)
- 4-meal diet plan
- Water, sleep and weight tracking
- Simple reminders
- Dashboard
- Prometheus metrics and Grafana dashboard

## Technology stack
React + TypeScript + Vite + Tailwind CSS + Recharts charts; Node.js + Express + TypeScript + Prisma; PostgreSQL; GitHub Actions; Docker Compose; Prometheus; Grafana.

## Run the complete project
Requirements: Docker Desktop.

```bash
cp .env.example .env     # then edit .env and set your own passwords
docker compose up --build
```

Open:
- App: http://localhost:8080
- API: http://localhost:4000/health
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (user `admin`, password = `GRAFANA_ADMIN_PASSWORD` from your `.env`)

Demo account after running the seed locally is `demo@fittrack.local` / `demo12345`. For the Docker-only demo, register a new account from the UI.

## Local development
1. Start PostgreSQL: `docker compose up db -d`
2. Backend: `cd backend`, copy `.env.example` to `.env`, then `npm install`, `npx prisma migrate deploy`, `npm run dev`.
3. Frontend: `cd frontend`, `npm install`, `npm run dev`.

## DevOps pipeline
Develop → Git/GitHub → GitHub Actions → install/test/build → Docker image build → Docker Compose deployment → Prometheus → Grafana.

The CI workflow is `.github/workflows/ci.yml`. It runs backend migration/tests/build, frontend build, and builds the Docker images with Docker Compose.

## Architecture
```text
Browser :8080
    |
  Nginx /api proxy
    |
Express API :4000 ---- PostgreSQL :5433
    |
 /api/metrics
    v
Prometheus :9090 --> Grafana :3001
```

## Suggested meaningful commits
1. `feat: add backend auth and profile API`
2. `feat: add fitness plan generation and tracking`
3. `feat: add React dashboard and plan pages`
4. `ci: add GitHub Actions pipeline`
5. `devops: add Docker Compose Prometheus and Grafana`
6. `docs: add project report and run instructions`

## College demo checklist
- Show GitHub repository and commit history.
- Show successful GitHub Actions run.
- Run `docker compose up --build`.
- Register/login and complete profile.
- Generate a plan and show dashboard, diet, workout and tracking.
- Open Prometheus and show `/api/metrics` scrape.
- Open Grafana and show the FitTrack API dashboard.
