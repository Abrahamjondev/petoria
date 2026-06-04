---
name: backend-migration
description: Continue the Petoria backend migration from Nestar property concepts to Petoria product concepts while preserving the existing NestJS architecture.
---

# Petoria Backend Migration

Use this skill when changing backend code for the Petoria product migration.

## Workflow

- Search for affected property/product references before editing.
- Preserve the resolver/service/module structure already used by `petoria-api`.
- Keep DTOs, enums, and schemas in their existing folders.
- Keep `MemberType.USER | AGENT | ADMIN` unchanged.
- Use product terminology for catalog behavior and database lookups.
- Update social modules consistently when product counters, likes, views, comments, or notifications are involved.
- Update batch logic when product ranking or `memberProducts` affects rank calculations.
- Update `docs/ai/COMPLETED_TASKS.md` after major completed work.