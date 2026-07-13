# @aragon/assistant-contracts

Shared zod schemas and types forming the HTTP contract between the assistant service (`apps/assistant`) and the assistant-chat widget (`packages/assistant-chat`). Both sides depend on this package; neither depends on the other.

Domain-scoped on purpose: contracts for other domains get their own package, this one never becomes a catch-all. zod is the only runtime dependency.

The package is built with `tsup` to `dist/` (CJS + ESM + `.d.ts`) so Node runtimes (Vercel lambdas) can `require` it. Consumers depend on it via `workspace:*`; Turbo `^build` ensures `dist/` exists before type-check/test/dev of dependents.

```sh
pnpm --filter @aragon/assistant-contracts build
pnpm --filter @aragon/assistant-contracts dev   # tsup --watch
```

Phase 2 note: the pinned `searchDocs` result shape (`Array<{ title; url; excerpt; score }>`) lands here when docs answering ships.
