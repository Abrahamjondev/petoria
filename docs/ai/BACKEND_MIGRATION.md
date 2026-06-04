# Backend Migration — Nestar → Petoria

> **Status:** Phase 1 (safe rename) **COMPLETE**. Phase 2 (Property → Pet domain remap) **PLANNED, not implemented**.
> **Scope of this document:** backend monorepo only (`apps/petoria-api`, `apps/petoria-batch`).

---

## 1. Original Project Summary (Nestar)

Nestar was a **real-estate marketplace** backend built as a NestJS monorepo.

| Aspect | Detail |
|--------|--------|
| Framework | NestJS 10, TypeScript, Express |
| API style | GraphQL (Apollo, code-first, `autoSchemaFile`) + REST controllers |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (30-day) + bcryptjs, role-based (`USER`/`AGENT`/`ADMIN`) |
| Real-time | WebSockets (`ws`) for chat |
| Apps | `nestar-api` (GraphQL API) + `nestar-batch` (cron/ranking jobs) |
| Domain | Properties (apartment/villa/house), Korean-city locations, price/beds/rooms/square, agents listing properties, community board, likes/views/comments/follows/notifications |

## 2. New Project Summary (Petoria)

Petoria is the **same backend rebranded** from Nestar. As of Phase 1 it is a
**1:1 functional copy** with new project/app identifiers only — the real-estate
domain is still in place. The long-term target is a **petshop / pet-adoption
platform** (Phase 2), where the `Property` domain becomes a `Pet` domain.

| Aspect | Phase 1 (now) | Phase 2 (planned) |
|--------|---------------|-------------------|
| Branding | Petoria | Petoria |
| Domain | Real-estate (unchanged) | Pets / adoption |
| API contract | Identical to Nestar | Renamed pet operations |
| Database | Same collections + DB name | New pet fields / enums |

## 3. Backend Migration Goal

**Phase 1 goal (achieved):** Rename every *visible project/app identifier* from
Nestar → Petoria **without changing business logic, the GraphQL API contract, or
the database**. The build must compile and no user-facing "Nestar" identifier
should remain in source/config.

**Phase 2 goal (future):** Remap the real-estate domain to a pet domain
(`Property` → `Pet`, `AGENT` → `SELLER`/`SHELTER`, drop beds/rooms/square, add
species/breed/age/etc.), including GraphQL operations and Mongoose collections.

## 4. Naming Changes (Phase 1 — DONE)

| # | Location | Old | New |
|---|----------|-----|-----|
| 1 | App folder | `apps/nestar-api` | `apps/petoria-api` |
| 2 | App folder | `apps/nestar-batch` | `apps/petoria-batch` |
| 3 | `package.json` | `"name": "nestar"` | `"name": "petoria"` |
| 4 | `package.json` script | `start:dev:batch → nest start nestar-batch` | `nest start petoria-batch` |
| 5 | `package.json` script | `start:prod → dist/apps/nestar-api/main` | `dist/apps/petoria-api/main` |
| 6 | `package.json` script | `start:prod:batch → dist/apps/nestar-batch/main` | `dist/apps/petoria-batch/main` |
| 7 | `package.json` script | `test:e2e → ./apps/nestar-api/test/jest-e2e.json` | `./apps/petoria-api/test/jest-e2e.json` |
| 8 | `nest-cli.json` | project keys/roots/sourceRoots `nestar-*` | `petoria-*` |
| 9 | `petoria-api/tsconfig.app.json` | `outDir ../../dist/apps/nestar-api` | `../../dist/apps/petoria-api` |
| 10 | `petoria-batch/tsconfig.app.json` | `outDir ../../dist/apps/nestar-batch` | `../../dist/apps/petoria-batch` |
| 11 | `batch.module.ts` (2 imports) | `../../nestar-api/src/schemas/...` | `../../petoria-api/src/schemas/...` |
| 12 | `batch.service.ts` (4 imports) | `../../nestar-api/src/...` | `../../petoria-api/src/...` |
| 13 | `app.service.ts` | `'Welcome to Nestar API Server!'` | `'Welcome to Petoria API Server!'` |
| 14 | `batch.service.ts` | `'Welcome to Nestar BATCH Server!'` | `'Welcome to Petoria BATCH Server!'` |
| 15 | `main.ts` | comment `.../nestar` | `.../petoria` |
| 16 | `batch/test/app.e2e-spec.ts` | import `NestarBatchModule` (stale/broken) | `BatchModule` + describe `PetoriaBatchController` |

## 5. Module Changes

**No NestJS modules were renamed, added, or removed in Phase 1.** All domain
modules remain intact and functionally identical:

| Module | Path (under `apps/petoria-api/src/components/`) | Phase 1 |
|--------|-----|---------|
| Member | `member/` | unchanged |
| Property | `property/` | unchanged (Phase 2: → `pet/`) |
| Board-Article | `board-article/` | unchanged |
| Comment | `comment/` | unchanged |
| Like | `like/` | unchanged |
| View | `view/` | unchanged |
| Follow | `follow/` | unchanged |
| Auth | `auth/` (guards, decorators) | unchanged |
| Socket | `socket/` (WS gateway) | unchanged |
| Batch app | `apps/petoria-batch/` (ranking jobs) | imports re-pathed only |

Class names (`AppModule`, `BatchModule`, `PropertyModule`, etc.) were **kept** —
renaming them is domain logic, deferred to Phase 2.

## 6. GraphQL Changes

**Phase 1: NONE.** The schema is code-first (`autoSchemaFile`), and no resolver,
`@ObjectType`, `@InputType`, query, or mutation was touched. The generated GraphQL
SDL is byte-for-byte identical to Nestar — **fully backward-compatible** for any
existing client.

**Phase 2 (PROPOSED — not implemented):**

| Old GraphQL operation | Proposed Petoria operation |
|-----------------------|----------------------------|
| `getProperties` | `getPets` |
| `getProperty` | `getPet` |
| `createProperty` | `createPet` |
| `updateProperty` | `updatePet` |
| `likeTargetProperty` | `likeTargetPet` |
| `getAgentProperties` | `getSellerPets` |
| `PropertyType` / `PropertyLocation` / `PropertyStatus` enums | `PetType` / `PetLocation` / `PetStatus` |

## 7. MongoDB Collection / Schema Changes

**Phase 1: NONE.** Collection names are preserved exactly (`properties`,
`members`, `boardArticles`, `comments`, `likes`, `views`, `follows`,
`notifications`, `notices`). The **database name `Nestar`** in `.env`
(`MONGO_DEV` / `MONGO_PROD`) was **intentionally kept** — renaming it would point
the app at a different, empty database and break all data access.

**Phase 2 (PROPOSED — not implemented):** field-level remap of the `Property`
schema. Collection rename (`properties` → `pets`) would require a data migration.

| Old `Property` field | Proposed `Pet` field | Note |
|----------------------|----------------------|------|
| `propertyType` (APARTMENT/VILLA/HOUSE) | `petType` (DOG/CAT/BIRD/...) | enum remap |
| `propertyLocation` (Korean cities) | `petLocation` / shelter | enum remap |
| `propertyTitle` | `petName` | |
| `propertyPrice` | `adoptionFee` | |
| `propertyBeds` / `propertyRooms` / `propertySquare` | — | **drop** |
| `propertyBarter` | `petExchangeAllowed` | |
| `propertyRent` | `fosteringAllowed` | |
| `constructedAt` | `dateOfBirth` / `arrivalDate` | |
| `soldAt` | `adoptedAt` | |
| `propertyViews/Likes/Comments/Rank` | `petViews/Likes/Comments/Rank` | keep semantics |

## 8. Compatibility Notes

- **API compatibility:** 100% backward-compatible after Phase 1. No GraphQL or REST
  contract changed; existing frontends/clients work unmodified.
- **Database compatibility:** 100%. Same collections, same DB name `Nestar`. No
  migration required to run Petoria against existing Nestar data.
- **Build:** `npm run build` (= `nest build`) compiles successfully as `petoria@0.0.1`.
- **Breaking changes:** all deferred to Phase 2 (operation renames, collection
  rename, schema-field changes), which will require client + data migration.
- **Outstanding (non-blocking):** lint is broken by a pre-existing missing
  `typescript-eslint` dependency (not caused by this migration); a stray junk file
  `apps/petoria-api/src/app.module 2.ts` exists; Phase-1 changes are not yet committed.
