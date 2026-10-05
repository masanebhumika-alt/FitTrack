# Step-by-step guide: from zero to a finished submission

## 1. Prerequisites
Git, Node.js 20+, Docker Desktop, a GitHub account (one repo per group, all members as collaborators).

## 2. First run on your machine (do this before anything else)
```bash
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```
This creates `package-lock.json` in each folder — **commit both lock files** (CI then uses `npm ci`).
Then start the whole stack: `docker compose up --build -d` and open http://localhost:8080.

## 3. Git workflow with meaningful history (3 members)
```bash
git init -b main
git remote add origin https://github.com/<your-group>/fittrack.git
```
Suggested split (each member commits their own part, via a branch + pull request):

| Member | Branch | Commits |
|---|---|---|
| A – Backend | `feature/backend-api` | `feat: add Prisma schema and migration` · `feat: add auth and profile API` · `feat: add fitness plan generation` · `feat: add tracking and reminders API` · `test: add backend unit and integration tests` |
| B – Frontend | `feature/frontend-ui` | `feat: scaffold React app with routing` · `feat: add auth and profile pages` · `feat: add workout, diet and progress pages` · `test: add frontend tests` |
| C – DevOps | `feature/devops` | `build: add backend and frontend Dockerfiles` · `build: add docker compose stack` · `ci: add GitHub Actions workflow` · `feat: add Prometheus metrics and Grafana dashboard` · `docs: add README and report` |

Workflow per member:
```bash
git checkout -b feature/<name>
git add <files> && git commit -m "feat: ..."      # several small commits
git push -u origin feature/<name>
# open Pull Request on GitHub -> another member reviews -> Merge into main
```
Because the code is already written, split the files across members and commit them in small groups over several days — each person should be able to explain their part.

## 4. Evidence checklist (screenshots for the report)
1. GitHub: commit history, branches, a merged pull request
2. GitHub Actions: green run with all 4 jobs expanded; the test step output; uploaded artifacts
3. Terminal: `docker compose build` / `docker images` showing `fittrack-backend` and `fittrack-frontend`
4. Terminal: `docker compose ps` (all running/healthy)
5. Browser: app login, dashboard, workout, diet, progress pages at http://localhost:8080
6. Browser: http://localhost:4000/health → `{"status":"ok","database":"ok"}`
7. Prometheus: Status → Targets (fittrack-backend **UP**) and a query such as `sum(fittrack_http_requests_total)`
8. Grafana: FitTrack API dashboard with traffic (click around the app first so panels fill)
9. Local test run: `npm test` output in backend and frontend

## 5. Generate traffic for the Grafana demo
```bash
for i in $(seq 1 50); do curl -s http://localhost:8080/health > /dev/null; done
curl -s -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"x@y.com","password":"wrongpass"}'
```
(The failed login shows up in the "Logins" panel.)

## 6. Live demo script (5–7 minutes)
1. Show repo + commit history; make a tiny change (e.g. text in `Auth.tsx`) on a branch and push
2. Show the Actions run starting automatically and passing
3. `docker compose up --build -d`, `docker compose ps`
4. Use the app: register → profile → plan → track water
5. Prometheus targets page, then the Grafana dashboard updating live
6. Optional: `docker compose stop backend` → show **Backend status** panel go to 0 / `BackendDown` alert in Prometheus → start it again

## 7. Troubleshooting
| Problem | Fix |
|---|---|
| Port already in use | Change the left side of the port mapping in `docker-compose.yml` |
| Backend restarts | `docker compose logs backend` – usually the DB wasn't ready or `DATABASE_URL` is wrong |
| Grafana panels empty | Generate traffic (step 5), wait ~15 s, set time range to "Last 15 minutes" |
| Backend tests fail locally | Start the DB: `docker compose up db -d` and use `backend/.env` from `.env.example` |
| Fresh DB wanted | `docker compose down -v` |
