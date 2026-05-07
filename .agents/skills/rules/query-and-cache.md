---
name: query-and-cache
description: TanStack Query conventions — query key factories, cache invalidation, prefetch parity, server vs client reads.
applies-to: src/**/api/**, src/**/queries/**, src/**/mutations/**
kind: rule
---

# query-and-cache

TanStack Query is the only sanctioned data-fetching layer. Spec: `docs/projectDocs/dataFetching.md`.

## Query keys

- **Always go through the `*ServiceKeys` factory.** Never inline an array like `['dao', daoId]`. Reference shape (`src/shared/api/daoService/daoServiceKeys.ts`):
  ```ts
  export const daoServiceKeys = {
      dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, apiVersionUtils.getApiVersion(), params],
  };
  ```
- **Adding or changing a key shape is a multi-file change, not a follow-up.** Every consumer is in scope of the same edit:
  - query hooks (`useXxx`)
  - prefetch calls (`prefetchQuery` / `prefetchInfiniteQuery`)
  - `setQueryData` writes
  - `invalidateQueries` calls
  - test cache injectors (anything seeding `queryClient` in `testUtils`)
- **Include `apiVersionUtils.getApiVersion()` for any new key unless the underlying endpoint is version-stable.** Today the codebase is inconsistent; bias toward including it.

## Prefetch parity

- **Server prefetch must use the same options helper as the client query.** Pattern: `await queryClient.prefetchInfiniteQuery(daoListOptions({ queryParams }))` server-side, `useDaoList({ queryParams })` client-side. Same params → same key → cache hits.
- **Never read prefetched data on a Server Component.** Prefetch on the server, consume on the client. React Query has no revalidation story for Server Components.

## Mutations

- **Invalidate via the key factory, not by string-built keys.** Prefer `queryClient.invalidateQueries({ queryKey: [DaoServiceKey.DAO] })` (enum prefix) or `daoServiceKeys.dao(params)` for an exact key. Never reconstruct keys by hand.
- **Mutations live under `api/mutations/`, queries under `api/queries/`** in the same service folder. Don't colocate a mutation inside a query hook.

## Folder shape (when adding a service)

`docs/projectDocs/dataFetching.md` is the spec. Minimum surface:

```
api/{serviceName}/
├── {serviceName}.ts          # singleton class wrapping the third-party
├── {serviceName}.api.ts      # request/param types
├── {serviceName}Keys.ts      # query key enum + factory
├── domain/                   # response types
├── queries/                  # useXxx + xxxOptions
└── mutations/                # useXxxMutation
```

Module-specific service → `src/modules/{module}/api/{serviceName}/`. Cross-module → `src/shared/api/{serviceName}/`.
