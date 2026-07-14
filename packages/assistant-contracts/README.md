# @aragon/assistant-contracts

Shared zod schemas and types forming the HTTP contract between the assistant service (`apps/assistant`) and the assistant-chat widget (`packages/assistant-chat`). Both sides depend on this package; neither depends on the other.

Domain-scoped on purpose: contracts for other domains get their own package, this one never becomes a catch-all. zod is the only runtime dependency. The package is consumed as TypeScript source via `workspace:*` (no build step) and is not published.

Phase 2 note: the pinned `searchDocs` result shape (`Array<{ title; url; excerpt; score }>`) lands here when docs answering ships.
