# Next Steps — Petoria Migration

Priority-ordered tasks for the next working session, grouped by area. Priority
labels: **P0** = do first / blocking, **P1** = important, **P2** = nice-to-have.

---

## A. Backend Cleanup

| Priority | Task | Detail / Acceptance |
|----------|------|---------------------|
| **P0** | Commit Phase-1 rename | On a feature branch (e.g. `migration`), commit the completed safe-rename. Message should state "rename only, no logic change". `git status` clean afterward. |
| **P0** | Fix the lint setup | Add `typescript-eslint` to `devDependencies` (matching the flat-config import in `eslint.config.mjs`) and reinstall. **Do this as its own commit**, separate from the rename. Acceptance: `npm run lint` runs to completion. |
| **P1** | Remove stray junk file | Delete `apps/petoria-api/src/app.module 2.ts` (accidental duplicate) after confirming it is unreferenced. |
| **P1** | Rewrite `README.md` | Currently the generic NestJS starter readme. Replace with Petoria project overview, run/build/test commands, and a link to `docs/`. |
| **P2** | Reconcile DB name `Nestar` | Decide whether to keep the `Nestar` Mongo DB name long-term or plan a renamed DB + data migration (tie to Phase 2). |

## B. Frontend Migration

| Priority | Task | Detail / Acceptance |
|----------|------|---------------------|
| **P0** | Provide the FE repo | Add the Next.js frontend to the workspace / share its path so `FRONTEND_MIGRATION.md` can be completed against real files. |
| **P1** | Complete `FRONTEND_MIGRATION.md` | Replace all `TODO` rows with verified page/component entries; confirm GraphQL client endpoint + codegen setup. |
| **P1** | Apply FE brand rename (Phase 1) | Nestar → Petoria strings, logos, titles, package name. No route/operation changes. FE build + lint pass. |
| **P2** | Point FE at Petoria API | Verify GraphQL endpoint env and schema introspection (Phase-1 API is unchanged, so no query edits expected). |

## C. Testing

| Priority | Task | Detail / Acceptance |
|----------|------|---------------------|
| **P0** | Unblock lint (see A) | Required before lint can gate anything. |
| **P1** | Run e2e suite | `npm run test:e2e` against `petoria-api`; confirm the corrected `BatchModule` e2e spec executes. |
| **P1** | Smoke-test both apps | `npm run start:dev` and `npm run start:dev:batch` boot cleanly; welcome endpoints return the "Petoria …" strings. |
| **P2** | Add minimal CI | Wire `build` + `lint` + `test` into CI so future renames/remaps are guarded. |

## D. Documentation

| Priority | Task | Detail / Acceptance |
|----------|------|---------------------|
| **P1** | Keep `docs/` in sync | Update `COMPLETED_TASKS.md` + `BACKEND_MIGRATION.md` as Phase-2 work lands. |
| **P1** | Draft Phase-2 design doc | Detailed Property → Pet remap: schema fields, enums, GraphQL operation renames, collection rename + data-migration strategy, client impact. (See proposals in `BACKEND_MIGRATION.md` §6–§7.) |
| **P2** | Decision log upkeep | Append new Phase-2 decisions to `DECISIONS.md` (append-only). |

---

## Suggested Sequence (next session)

1. **P0 backend:** commit rename → fix lint (separate commit) → run lint/build green.
2. **P0 frontend:** get FE repo → complete `FRONTEND_MIGRATION.md`.
3. **P1 testing:** e2e + smoke test both apps.
4. **P1 docs:** draft the Phase-2 Property→Pet design doc to unblock the real migration.
