# Architectural Decisions — Nestar → Petoria Migration

This log records the decisions made during the Phase-1 migration session, with the
rationale, risks, and alternatives considered for each. Decisions are
**append-only**: supersede rather than delete.

---

## Decision Log

| # | Decision | Rationale | Risks | Alternatives considered |
|---|----------|-----------|-------|-------------------------|
| D1 | **Safe-rename first, zero business-logic change** (Phase 1 = branding only) | De-risks the migration: ship a verifiable, reversible rename before touching domain logic. Keeps the diff reviewable and the app runnable at every step. | Two-phase work means "Petoria" still serves real-estate data until Phase 2; risk of the rename being mistaken for a finished product. | Big-bang rename + domain remap in one pass (rejected: huge diff, hard to validate, breaks API + data simultaneously). |
| D2 | **Keep MongoDB collections AND the DB name `Nestar`** | The connection string points at DB `Nestar`; renaming it targets an empty DB and breaks all reads/writes. Collection names are part of the data contract. | The name `Nestar` lingers in `.env`, slightly inconsistent with branding; could confuse new devs. | Rename DB/collections now (rejected: requires a real data migration, out of safe-rename scope). |
| D3 | **Keep GraphQL operations, DTO and class names** (`Property`, `Member`, `AppModule`, `BatchModule`) | These define the public API contract and domain semantics; renaming them is business logic, not branding. Preserves 100% client compatibility. | Class/operation names still say "Property"/"Agent", mismatching the pet vision until Phase 2. | Rename to pet equivalents now (rejected: breaking API change, belongs to Phase 2). |
| D4 | **Use `git mv` for folder renames** | Preserves file history/blame across the rename; Git records true renames (`R`) rather than delete+add. | None significant. | Plain `mv` (rejected: loses rename tracking, noisier history). |
| D5 | **Fix the stale e2e import** `NestarBatchModule` → `BatchModule` | The test imported a non-existent symbol (the class is `BatchModule`) — already broken before the session. Correcting it both removes "Nestar" and unbreaks the test, aligned with rename intent. | Minimal: touches a test file (allowed — not app source logic). | Leave as-is (rejected: leaves a known-broken, Nestar-named import). |
| D6 | **Defer Property → Pet domain remap to Phase 2** | The user's explicit scope was "no business logic change." Domain remap touches schema, enums, resolvers, collections, and clients — a separate, larger effort. | Product still behaves as real-estate; stakeholders must understand "rebranded, not yet re-domained." | Include domain remap now (rejected: violates stated scope). |
| D7 | **Flag the broken lint config, do NOT alter dependencies in the rename** | `eslint.config.mjs` imports `typescript-eslint`, which is absent from `package.json`/`node_modules` — a pre-existing break unrelated to the rename. Adding deps in a "safe rename" PR mixes concerns and bloats the diff/lockfile. | Lint cannot run until fixed; CI relying on lint will fail for an unrelated reason. | Install `typescript-eslint` immediately (deferred to NEXT_STEPS so the rename stays clean and dependency change is reviewed on its own). |
| D8 | **Document everything in a dedicated `docs/` folder, no source edits** | Centralizes migration knowledge for handoff; keeps documentation changes isolated from code changes for clean review. | Docs can drift from code if not maintained. | Inline READMEs per app / commit messages only (rejected: harder to find, less structured). |
| D9 | **`FRONTEND_MIGRATION.md` written as a stub pending the FE repo** | No frontend exists in this backend-only repo; a page/component map invented without the real code would be inaccurate. | Frontend plan is incomplete until the repo is provided. | Fabricate a full FE plan from the assumed Nestar template (rejected by user: prefer to wait for the real repo). |

---

## Risk Summary & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| "Nestar" DB name retained causes confusion | Low | Documented as intentional (D2); revisit during Phase-2 data migration. |
| Rename mistaken for completed pet migration | Medium | Phase 1/Phase 2 labelled throughout all docs (D1, D6). |
| Lint broken in CI | Medium | Root cause documented (D7); fix queued in NEXT_STEPS as an isolated change. |
| Phase-2 breaking changes (API + data) | High (future) | Plan client + data migration together; version the GraphQL API. |
| Docs drift from code | Low | NEXT_STEPS includes a "keep docs in sync" task. |
