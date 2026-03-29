# Changelog

All notable changes are documented here. Format: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Planned
- S3 integration for PDF report storage
- Email notification on stress test RED/CRITICAL result
- Loan prepayment calculator with amortization diff view

---

## [1.0.0] — 2026-03-25

### Added
- **Auth**: Register + Login with JWT (access + refresh tokens), BCrypt password hashing
- **Loans**: Full CRUD — add, list, soft-delete. Real-time EMI + amortization calculation
- **Portfolio**: Multi-loan aggregation — DTI ratio, health grade (A+ to F), avalanche/snowball prepayment strategies
- **Stress Simulator**: 4 scenario types — income drop, rate hike, expense shock, job loss. Returns risk band (GREEN/AMBER/RED/CRITICAL) + recommendations
- **Affordability Score**: Real safe borrow limit vs bank's offered eligibility, 0–100 score with insights
- **PDF Reports**: iText-generated financial risk report with loan breakdown, health summary, prepayment strategy comparison
- **Security**: Rate limiting (Bucket4j), AES-256 PII encryption, OWASP Dependency Check, Trivy image scan
- **Observability**: Prometheus metrics + Grafana dashboard, MDC trace IDs, structured JSON logging
- **CI/CD**: GitHub Actions — lint, test, Docker build, Trivy scan, staging deploy, E2E, manual gate, blue-green prod deploy, auto-rollback
- **Infrastructure**: Docker Compose (dev), Kubernetes + HPA (prod), AWS EKS

### Tech Stack
- Backend: Java 21, Spring Boot 3.2, Spring Security, JWT, MySQL 8, Redis 7, Flyway, iText 8
- Frontend: React 18, Redux Toolkit, Chart.js, TypeScript, Vite, React Hook Form + Zod
- DevOps: Docker, Kubernetes, GitHub Actions, AWS EKS, Prometheus, Grafana
- Testing: JUnit 5, Mockito, Testcontainers, Playwright, k6, Postman Newman

---

## Versioning

- **MAJOR**: Breaking API changes or complete architecture overhaul
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, dependency updates, performance improvements
