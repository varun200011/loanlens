# ADR-001: Java Spring Boot as Backend Framework

**Status:** Accepted  
**Date:** 2026-03-01  
**Deciders:** Tech Lead, Backend Team

---

## Context

LoanLens requires a backend that handles financial calculation logic, JWT security, relational data, and PDF generation. We evaluated: Java Spring Boot, Node.js/Express, Python FastAPI.

## Decision

**Java Spring Boot 3** with Java 21.

## Rationale

| Factor | Spring Boot | Node.js | FastAPI |
|--------|------------|---------|---------|
| Financial domain fit | ✅ Strong (BigDecimal, JPA) | ⚠️ float precision issues | ⚠️ |
| Security ecosystem | ✅ Spring Security mature | ⚠️ fragmented | ⚠️ |
| PDF generation | ✅ iText native | ❌ limited | ❌ |
| Type safety | ✅ Java static typing | ❌ runtime only | ✅ |
| JD alignment | ✅ Citi JD explicitly Java | — | — |
| Enterprise adoption | ✅ Citi, Goldman, HDFC | ⚠️ | ⚠️ |

## Consequences

- **Positive:** BigDecimal precision for EMI math, Spring Security for JWT/BCrypt, mature Testcontainers support
- **Negative:** Higher memory footprint vs Node.js (~512MB vs ~128MB), longer startup time
- **Mitigation:** `-XX:+UseContainerSupport` + `MaxRAMPercentage=75` in Docker, GraalVM native image considered for v2
