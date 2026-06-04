# Prompts Library — Petoria Migration

Reusable prompts captured from this session, plus parameterized templates for the
next session. Replace `<PLACEHOLDERS>` before use.

---

## 1. Most Useful Prompts From This Session

### 1.1 Analyze the monorepo before changing anything
> Analyze the current Nestar monorepo structure to understand how to transform this
> existing NestJS monorepo into a Petshop ("Petoria") platform. Map the apps,
> domain modules, GraphQL setup, Mongoose schemas, and enums. Identify exactly which
> concepts are real-estate-specific. Do not change code yet — produce a plan first.

### 1.2 Scope the safe rename (the key prompt that defined Phase 1)
> **Safe Rename Layer (No business-logic change).** Rename all visible project/app
> identifiers from Nestar → Petoria. Do **not** change domain logic. Keep the GraphQL
> APIs and database collections unchanged. Update package names, environment labels,
> and constants. Run lint and typecheck after refactoring. Make a plan first.

### 1.3 Generate handoff documentation
> Create a `docs/` folder with `BACKEND_MIGRATION.md`, `DECISIONS.md`,
> `FRONTEND_MIGRATION.md`, `COMPLETED_TASKS.md`, `NEXT_STEPS.md`, `PROMPTS.md`,
> summarizing the current Nestar → Petoria migration state. Documentation only —
> do not change source code. Be precise and technical; use markdown tables.

---

## 2. Reusable Prompts For Next Session

### 2.1 Commit Phase-1 + fix lint (isolated commits)
> On a feature branch, commit the completed Phase-1 Nestar→Petoria safe rename with a
> message stating "rename only, no logic change". Then, as a **separate** commit, fix
> the broken lint by adding `typescript-eslint` to devDependencies to match
> `eslint.config.mjs`, reinstall, and confirm `npm run lint` runs clean. Do not mix
> the two commits.

### 2.2 Phase-2: Property → Pet domain remap (design first)
> Design Phase 2 of the Petoria migration: remap the real-estate `Property` domain to
> a `Pet` domain. Produce a plan covering: (a) schema field changes
> (`propertyType`→`petType`, drop beds/rooms/square, add species/breed/age/gender/
> vaccinated/adoptionFee), (b) enum remaps (`PropertyType/Location/Status` →
> `PetType/Location/Status`, `MemberType.AGENT`→`SELLER`), (c) GraphQL operation
> renames (`getProperties`→`getPets`, etc.), (d) Mongoose collection rename
> `properties`→`pets` **with a data-migration strategy**, and (e) client/breaking-change
> impact. Plan first; do not implement until approved.

### 2.3 Frontend migration kickoff (once FE repo is available)
> The Petoria frontend (Next.js) is at `<FE_REPO_PATH>`. Inventory its pages,
> components, and GraphQL operations. Then complete `docs/FRONTEND_MIGRATION.md`:
> replace all TODO rows with verified entries, apply the Phase-1 brand rename
> (Nestar→Petoria strings/logos only, no route/operation changes), and confirm the
> GraphQL endpoint points at the Petoria API. Keep Phase-2 domain renames separate.

### 2.4 Remove stray junk file
> Confirm `apps/petoria-api/src/app.module 2.ts` is unreferenced anywhere in the repo,
> then delete it. Run `npm run build` to confirm nothing breaks.

### 2.5 Rewrite the README
> Replace the generic NestJS starter `README.md` with a Petoria project README:
> overview, architecture (api + batch apps, GraphQL, MongoDB), setup, run/build/test
> commands, env vars, and a link to the `docs/` folder. Do not change source code.

### 2.6 Verification prompt (after any migration step)
> After the change: run `npm run build` (typecheck) and `npm run lint`; run
> `grep -rin "nestar" apps nest-cli.json package.json` and report any remaining
> matches; confirm `git status` shows only the intended files changed. Report results
> honestly, including any failures.

---

## 3. Prompt-Writing Tips That Worked

- **State scope boundaries explicitly** ("no business-logic change", "documentation
  only", "keep DB/API unchanged") — this kept the diff small and reviewable.
- **Ask for a plan before edits** — surfaces assumptions (e.g. the DB-name and
  missing-frontend issues) before any code moves.
- **Require verification commands in the prompt** — guarantees the agent reports
  build/lint/grep results instead of assuming success.
- **Separate phases** (rename vs. domain remap) and **separate concerns** (rename vs.
  dependency fix) into distinct commits/prompts.
