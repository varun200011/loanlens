# ADR-002: MySQL over MongoDB for Primary Storage

**Status:** Accepted  
**Date:** 2026-03-01

---

## Context

Loan data is inherently relational: users have loans, loans have amortization schedules, stress scenarios reference both. We evaluated MySQL vs MongoDB.

## Decision

**MySQL 8** for primary storage, **Redis** for session cache and rate-limit buckets.

## Rationale

- Loan calculations require ACID transactions (add loan + update portfolio atomically)
- SQL window functions simplify portfolio aggregation queries (`SUM`, `GROUP BY user_id`)
- Financial data has a fixed, well-defined schema — document flexibility not needed
- MySQL 8 JSON column type available if semi-structured data needed later (scenario results stored as TEXT)
- JPA/Hibernate with Flyway migrations gives a clean schema evolution path

## Consequences

- **Positive:** Strong consistency, straightforward JOIN queries, Flyway migrations tracked in VCS
- **Negative:** Schema migrations required for every model change
- **Mitigation:** Flyway versioned migrations + `ddl-auto: validate` in prod prevents silent drift
