# FitTrack — DevOps Mini Project Report

## 1. Problem Statement
People often need a simple place to record fitness information and receive basic personalized guidance. FitTrack provides a small web application for profile-based fitness calculations, diet/workout plans and daily wellness tracking.

## 2. Objectives
- Build a working web/API application.
- Maintain source code in Git/GitHub with meaningful commits.
- Automate build and test using GitHub Actions.
- Containerize the application using Docker.
- Deploy locally with Docker Compose.
- Monitor the API using Prometheus and Grafana.

## 3. System Description
The frontend is a React single-page application served by Nginx. Nginx proxies `/api` requests to an Express backend. The backend uses Prisma to access PostgreSQL. Prometheus scrapes backend metrics and Grafana displays them.

## 4. Functional Modules
Authentication, profile and goals, fitness calculations, diet plan, workout plan, dashboard, water/sleep/weight tracking and reminders.

## 5. DevOps Implementation
### Git/GitHub
One repository contains frontend, backend, Docker, CI, monitoring and documentation.
### CI
GitHub Actions installs dependencies, runs backend migration/tests, builds backend and frontend, and builds the Docker images with Compose.
### Docker
Separate backend and frontend images are orchestrated with PostgreSQL, Prometheus and Grafana through Docker Compose.
### Monitoring
The Express server exposes Prometheus metrics at `/api/metrics`. Prometheus scrapes this endpoint. Grafana is provisioned with a FitTrack dashboard for request totals, request rate and latency.

## 6. Testing
Backend unit tests cover BMI, BMR and fitness-plan calculations. An API health test checks the HTTP application path.

## 7. Security Basics
Passwords are bcrypt-hashed. JWT authentication protects user endpoints. Queries filter by the authenticated user ID. Helmet and CORS are enabled. Secrets are provided through environment variables and are not committed.

## 8. Conclusion
FitTrack demonstrates the required end-to-end DevOps pipeline with a deliberately small application scope suitable for a college mini-project and live demonstration.
