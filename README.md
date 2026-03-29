# LoanLens — Loan Eligibility & EMI Risk Analyzer

**Java Spring Boot + React | Fintech | Full-Stack**

A production-grade financial risk analyzer that goes beyond simple EMI calculators to provide:
- **Stress simulation** (income drop, rate hike, expense shock, job loss)
- **Multi-loan portfolio view** with DTI, health grade, and prepayment strategies
- **Real affordability score** — not just bank eligibility
- **PDF risk report** generation

---

## Quick Start (Docker)

```bash
# 1. Clone
git clone https://github.com/varun/loanlens && cd loanlens

# 2. Set secrets
cp .env.example .env && nano .env

# 3. Start all services
docker compose up --build

# App:       http://localhost:3000
# API:       http://localhost:8080
# Swagger:   http://localhost:8080/swagger-ui.html
# Grafana:   http://localhost:3001  (admin/admin)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3, Spring Security, JWT |
| Frontend | React 18, Redux Toolkit, Chart.js, TypeScript |
| Database | MySQL 8, Redis 7 |
| Security | BCrypt, AES-256, OWASP Dependency Check, Trivy |
| DevOps | Docker, Kubernetes (EKS), GitHub Actions, Prometheus |
| Testing | JUnit 5, Mockito, Testcontainers, Playwright, k6 |

---

## Project Structure

```
loanlens/
├── backend/               # Java Spring Boot API
│   └── src/main/java/com/loanlens/
│       ├── controller/    # REST endpoints (8 endpoints)
│       ├── service/       # Business logic
│       ├── model/         # JPA entities
│       ├── dto/           # Request/Response objects
│       ├── security/      # JWT filter, SecurityConfig
│       ├── repository/    # Spring Data JPA repos
│       └── util/          # FinanceUtils (EMI, DTI, stress)
├── frontend/              # React + Redux SPA
│   └── src/
│       ├── pages/         # LoginPage, Dashboard, Loans, Stress...
│       ├── store/slices/  # auth, loans, portfolio, stress Redux slices
│       ├── services/      # axios API client
│       └── utils/         # format helpers
├── qa/
│   ├── playwright/        # E2E tests
│   └── k6/               # Load tests (p95 < 800ms @ 100 users)
├── devops/
│   ├── docker/            # Dockerfiles (multi-stage), nginx.conf
│   ├── k8s/base/          # Kubernetes manifests, HPA
│   ├── github-actions/    # CI/CD pipeline
│   └── monitoring/        # Prometheus + Grafana
└── docker-compose.yml     # Full local dev stack
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register, returns JWT |
| POST | /api/auth/login | None | Login, returns tokens |
| POST | /api/loans | JWT | Add a loan |
| GET | /api/loans | JWT | List active loans |
| DELETE | /api/loans/{id} | JWT | Soft-delete a loan |
| GET | /api/portfolio/summary | JWT | DTI, health grade, prepayment strategies |
| POST | /api/stress/simulate | JWT | Stress scenario simulation |
| GET | /api/affordability/score | JWT | Real affordability score |
| POST | /api/reports/generate | JWT | Generate PDF report |

---

## CI/CD Pipeline

```
Push → Lint+Test → Build → Docker Build → Security Scan (Trivy) 
     → Push ECR → Deploy Staging → E2E Tests → Manual Gate → Deploy Prod
                                                              ↓
                                                    Auto-rollback on failure
```

---

## Team Architecture

- **Backend team** owns: `/backend`, `devops/k8s` manifests, `devops/docker/Dockerfile.backend`
- **Frontend team** owns: `/frontend`, `devops/docker/Dockerfile.frontend`, `devops/docker/nginx.conf`
- **QA team** owns: `/qa` — all test suites, test plan, test report
- **DevOps team** owns: `docker-compose.yml`, `.github/workflows`, `devops/monitoring`

**No cross-team file ownership conflicts by design.**

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DB_URL | ✅ | MySQL JDBC connection string |
| DB_USER | ✅ | MySQL username |
| DB_PASS | ✅ | MySQL password |
| JWT_SECRET | ✅ | Min 32-char JWT signing secret |
| REDIS_HOST | ✅ | Redis hostname |
| REDIS_PASS | ❌ | Redis password (if secured) |

---

*Built as a portfolio project demonstrating Java Fullstack capabilities for fintech domain.*
