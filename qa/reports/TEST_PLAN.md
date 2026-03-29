# LoanLens — Test Plan v1.0

**Project:** LoanLens — Loan Eligibility & EMI Risk Analyzer  
**Prepared by:** QA Team  
**Version:** 1.0.0  
**Last updated:** 2026-03-25

---

## 1. Scope

This test plan covers all testing activities for the LoanLens platform across:
- Backend REST API (Spring Boot)
- Frontend SPA (React)
- Integration between both layers
- Infrastructure (Docker, Kubernetes)
- Security and performance

---

## 2. Test Types & Tools

| Type | Tool | Location | Target |
|------|------|----------|--------|
| Unit (BE) | JUnit 5 + Mockito | `backend/src/test/` | 80%+ line coverage |
| Unit (FE) | Jest + RTL | `frontend/src/**/*.test.ts` | 70%+ coverage |
| Integration | Testcontainers | `backend/src/test/` | All API endpoints |
| E2E | Playwright | `qa/playwright/` | 5 critical user journeys |
| API Contract | Postman Newman | `qa/postman/` | All 9 endpoints × pos+neg |
| Load | k6 | `qa/k6/` | p95 < 800ms @ 100 users |
| Security | OWASP ZAP | CI pipeline | No HIGH/CRITICAL |
| Dependency | OWASP Dep-Check + npm audit | CI pipeline | No known CVEs |

---

## 3. Approval Gates

### Gate 1 — Code Review (per PR)
- [ ] 2 peer approvals
- [ ] No linting errors
- [ ] Unit tests added and passing
- [ ] Coverage not reduced

### Gate 2 — Sprint QA Sign-Off
- [ ] All sprint stories DONE
- [ ] 0 open P1/P2 bugs
- [ ] Integration tests pass on staging DB
- [ ] Postman collection — all tests green
- [ ] Cross-browser verified (Chrome, Firefox, Safari, Mobile)

### Gate 3 — Security Review
- [ ] OWASP ZAP scan — HIGH/MEDIUM resolved
- [ ] Dependency audit — no unwaived HIGH CVEs
- [ ] PII fields encrypted — confirmed in DB
- [ ] No PII in logs — log grep test passed
- [ ] Rate limiting verified — auth: 5/min, stress: 10/min

### Gate 4 — Production Deploy
- [ ] Full Playwright suite 0 failures on staging
- [ ] k6 load test: p95 < 800ms, error rate < 1%
- [ ] Rollback plan documented
- [ ] Monitoring live (Prometheus + Grafana)
- [ ] Tech Lead + PM written approval

---

## 4. Test Cases Summary

### 4.1 FinanceUtils Unit Tests (8 cases)
| ID | Test | Expected |
|----|------|----------|
| FU-01 | EMI: 5L @ 8.5% × 240 months | ₹4,300–₹4,400 |
| FU-02 | EMI: zero interest rate | principal / tenure |
| FU-03 | Outstanding at halfway point | < 80% of principal |
| FU-04 | Outstanding at tenure end | ₹0 |
| FU-05 | DTI: 30K EMI / 1L income | 30.00% |
| FU-06 | DTI: 50K EMI / 1L income | 50.00% |
| FU-07 | DTI with zero income | 100% |
| FU-08 | Health grade mapping | A+/A/B/C/D/F per DTI band |

### 4.2 StressService Unit Tests (3 cases)
| ID | Test | Expected |
|----|------|----------|
| SS-01 | Income drop 50% | AMBER/RED/CRITICAL risk |
| SS-02 | Rate hike +2% | projectedEmi > currentEmi |
| SS-03 | Job loss | CRITICAL + isAtRisk=true |

### 4.3 AuthController Tests (4 cases)
| ID | Test | Expected |
|----|------|----------|
| AC-01 | Register valid | 201 + accessToken |
| AC-02 | Register invalid email | 400 |
| AC-03 | Login valid | 200 + tokenType=Bearer |
| AC-04 | Login wrong password | 401 |

### 4.4 LoanController Tests (4 cases)
| ID | Test | Expected |
|----|------|----------|
| LC-01 | GET /loans authenticated | 200 + array |
| LC-02 | GET /loans unauthenticated | 401 |
| LC-03 | POST /loans valid | 201 + loanType |
| LC-04 | POST /loans negative principal | 400 |

### 4.5 E2E Playwright (5 journeys)
| ID | Journey | Steps |
|----|---------|-------|
| E2E-01 | Register | Fill form → Submit → Dashboard |
| E2E-02 | Add Loan | Login → /loans → Fill form → Submit |
| E2E-03 | Stress Test | Login → /stress → Select → Run → See result |
| E2E-04 | Affordability | Login → /affordability → See score |
| E2E-05 | Logout | Click Sign out → Redirect to /login |

### 4.6 Postman API (9 endpoints × positive + negative)
All documented in `qa/postman/LoanLens.postman_collection.json`

---

## 5. Performance Targets

| Metric | Target | Measured by |
|--------|--------|-------------|
| API p95 latency | < 800ms | k6 |
| Stress API p95 | < 1200ms | k6 custom metric |
| Error rate | < 1% | k6 |
| Report generation | < 3s | manual |
| Frontend FCP | < 1.5s | Lighthouse |

---

## 6. Known Limitations

- Stress scenario engine uses simplified linear model — not ML-based prediction
- PDF report charts are text-only (no embedded Chart.js images in v1.0)
- No real S3 integration in dev — reports saved to local `/tmp`
- Load test seed user is single-use; parallel VUs share same account

---

## 7. Test Environment

| Env | URL | DB | Notes |
|-----|-----|----|-------|
| Local | localhost:3000 | Docker Compose | Dev seed data |
| Staging | staging.loanlens.app | AWS RDS | Deployed on push to develop |
| Production | loanlens.app | AWS RDS | Manual gate deploy |
