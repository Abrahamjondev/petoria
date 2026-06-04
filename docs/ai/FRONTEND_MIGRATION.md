# Frontend Migration — Nestar → Petoria

> ⚠️ **STATUS: PENDING / STUB.**
> No frontend exists in this repository (it is a **backend-only** NestJS monorepo:
> `apps/petoria-api`, `apps/petoria-batch`). The page/component mapping below
> **cannot be finalized** until the actual Next.js frontend repository is provided.
>
> **To complete this document:** supply the frontend repo path (e.g. add it to the
> workspace or share the URL), then the real pages/components/GraphQL operations
> will be enumerated and the `TODO` rows below replaced with verified entries.

This file is a **structured skeleton**. Tables marked `TODO` are placeholders;
tables that are knowable today (terminology, brand strings, GraphQL rename intent)
are filled as a **template/proposal** to apply once the repo is available.

---

## 1. Step-by-Step Migration Plan (generic, ordered)

1. **Obtain & inventory the FE repo.** Confirm framework version (Next.js
   pages-router vs. app-router), GraphQL client (Apollo Client / urql), and codegen setup.
2. **Phase 1 — Brand rename only (mirror backend).** Replace user-visible
   "Nestar" strings, logos, titles, env labels, package name → "Petoria". **No**
   route, component, or GraphQL operation rename. Verify build + lint.
3. **Point the client at Petoria API.** Update GraphQL endpoint env var if the
   host/name changed; confirm schema introspection still matches (Phase-1 API is
   identical, so no query changes needed).
4. **Phase 2 — Domain remap (after backend Phase 2).** Rename routes/pages,
   components, GraphQL operations, and UI terminology from property→pet in lockstep
   with the backend schema/operation changes. Regenerate GraphQL types via codegen.
5. **Regression test** each page against the API; update e2e/visual tests.
6. **Update FE docs** and remove this stub banner.

## 2. Page / Component Map (TODO — requires FE repo)

> Replace placeholder rows once the repo is available. Columns reflect the typical
> Nestar structure; **verify against the real codebase** — do not assume.

| Old Nestar page/route | Proposed Petoria page/route | Phase | Status |
|-----------------------|-----------------------------|-------|--------|
| `/` (home) | `/` (home, Petoria brand) | 1 | TODO |
| `/property` (list) | `/pet` (list) | 2 | TODO |
| `/property/detail` | `/pet/detail` | 2 | TODO |
| `/agent` (agent list) | `/seller` (seller list) | 2 | TODO |
| `/agent/detail` | `/seller/detail` | 2 | TODO |
| `/mypage` | `/mypage` | 1 | TODO |
| `/community` (board) | `/community` | 1 | TODO |
| `/account/join` & `/login` | same (brand only) | 1 | TODO |
| `/cs` / FAQ / notice | same (brand only) | 1 | TODO |

| Old component (assumed) | Proposed Petoria component | Phase | Status |
|-------------------------|----------------------------|-------|--------|
| `PropertyCard` | `PetCard` | 2 | TODO |
| `PropertyFilter` | `PetFilter` | 2 | TODO |
| `AgentCard` | `SellerCard` | 2 | TODO |
| Brand `Header` / `Footer` logos | Petoria logos | 1 | TODO |

## 3. GraphQL Query / Mutation Rename Plan

**Phase 1: NO frontend GraphQL changes.** The backend Phase-1 rename did not touch
any GraphQL operation, so existing queries/mutations keep working unmodified.

**Phase 2 (PROPOSED — apply in lockstep with backend Phase 2):**

| Old operation (FE call) | Proposed Petoria operation | Type |
|-------------------------|----------------------------|------|
| `getProperties` | `getPets` | Query |
| `getProperty` | `getPet` | Query |
| `getAgentProperties` | `getSellerPets` | Query |
| `createProperty` | `createPet` | Mutation |
| `updateProperty` | `updatePet` | Mutation |
| `likeTargetProperty` | `likeTargetPet` | Mutation |
| Enum args `PropertyType/Location/Status` | `PetType/Location/Status` | Input |

> After backend Phase 2, regenerate FE types (`graphql-codegen`) so the compiler
> surfaces every call site that needs updating.

## 4. UI Terminology Changes

**Phase 1 (brand — apply now with FE repo):**

| Old text | New text |
|----------|----------|
| Nestar | Petoria |
| "Nestar API" / page titles | "Petoria" |
| Logo / favicon / meta tags | Petoria assets |

**Phase 2 (domain — apply with backend Phase 2):**

| Real-estate term | Pet term |
|------------------|----------|
| Property / Listing | Pet |
| Agent | Seller / Shelter |
| Price | Adoption fee |
| Location (city) | Pet location / Shelter |
| Beds / Rooms / Square | (removed) |
| "For sale" / "For rent" | "For adoption" / "For fostering" |
| Sold | Adopted |
| Barter | Exchange |

## 5. Checklist Before Marking Complete

- [ ] FE repo provided and inventoried
- [ ] Page/component tables verified against real files (no `TODO` rows left)
- [ ] Phase-1 brand rename applied + FE build/lint pass
- [ ] GraphQL endpoint env confirmed against Petoria API
- [ ] Phase-2 operation renames scheduled with backend Phase 2
- [ ] Stub banner removed
