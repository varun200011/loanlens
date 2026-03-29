# ADR-003: React + Redux Toolkit for Frontend

**Status:** Accepted  
**Date:** 2026-03-01

---

## Context

The frontend needs: auth state management across routes, async API calls with loading/error states, shared portfolio/loan data between multiple pages.

## Decision

**React 18 + Redux Toolkit + React Router v6.**

## Rationale

- Redux Toolkit eliminates boilerplate vs vanilla Redux; `createAsyncThunk` handles API call lifecycle cleanly
- Multiple pages (Dashboard, Portfolio, Stress) read the same portfolio data — shared Redux store avoids prop-drilling and duplicate fetches
- JWT stored in-memory (Redux state) — never localStorage, mitigates XSS token theft
- React Hook Form + Zod provides schema-validated forms with TypeScript inference
- Vite gives sub-second HMR vs CRA, optimised production builds with code splitting

## Consequences

- **Positive:** Predictable state, easy debugging with Redux DevTools, TypeScript throughout
- **Negative:** More boilerplate than React Query for simple fetch-display patterns
- **When to reconsider:** If data-fetching complexity grows, React Query + Zustand is a lighter alternative for v2
