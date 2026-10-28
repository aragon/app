# Workspace routing

Decision record for scoping workspace pages to an account through a path segment instead of the `?account=` query
parameter.

- **Status:** accepted 2026-09-30 in the Workspace Routing Sync (Fabrice François, Milos Dzepina). Implemented in
  [#1439](https://github.com/aragon/app/pull/1439). Follow-ups: [#1441](https://github.com/aragon/app/pull/1441),
  [#1451](https://github.com/aragon/app/pull/1451).
- **Details:** [createWorkspace.md → Account scope](./createWorkspace.md#account-scope).

## Context

A workspace holds several accounts. Every section (overview, proposals, members, assets, transactions) shows either
all accounts aggregated or a single account. Proposals, assets and the other entities belong to an account, not to
the workspace.

The selection lived in `?account=`, written with `history.replaceState` through `useFilterUrlParam` and held in
`WorkspaceAccountSelectorProvider`. That had these problems:

1. Two sources of truth. Keeping the selection across tabs and keeping links shareable required context state
   and the URL to stay in sync through effects.
2. We needed explicit, sharable links for account pages (with `account_id` as an url param), in which case we would end
   up with 2 different ways to represent selected account. This introduced additional complexity in already "ugly" logic
   for syncing URL state with React context state for selected account (see previous point 2).
3. Params went stale when switching accounts. Filters that depend on the account, such as proposal body tabs,
   had to be cleaned up when the next account didn't have them.
4. The server never saw the account. `replaceState` does not re-run server components, so nothing that depends
   on the account could be prefetched. Next.js link prefetching and SEO indexing were lost as well.

## Decision

One URL is one state. The path says **what** the page shows. The query string is left for **how** (filters, tabs).

| Route | Shows |
| --- | --- |
| `/workspace/{workspaceId}/all/{section}` | every account, aggregated |
| `/workspace/{workspaceId}/{accountId}/{section}` | one account |

- `accountId` is `{network}-{address}`, the same value as the DAO ID. `all` (`workspaceUtils.workspaceAllAccountsSegment`)
  stands for every account and can't collide with an account ID.
- The account comes before the section, as in `/dao/{network}/{addressOrEns}/{section}`. `LayoutWorkspaceAccount`
  prefetches the account's DAO once for every section below it, without reading the client-side registry.
- The selector provider is removed. `useWorkspaceAccountOptions` as a simple hook reads `accountId` with `useParams()`
  and returns the options, and the selector navigates with standard links.
- `all/` is a static folder next to the dynamic `[accountId]/`, so the aggregated tree has its own route files and
  never tries to prefetch a DAO. Both trees re-export the same page components, which filter by `accountId`.
- URLs are built only through `workspaceUtils.getAccountScopeUrl`.
- Temporary (307) redirects in `next.config.mjs`:
  - `/workspace/{id}` → `/workspace/{id}/all/overview`
  - the legacy `/workspace/{id}/{section}` → `/workspace/{id}/all/{section}`
  - `/workspace/{id}/{accountId}` → `/workspace/{id}/{accountId}/overview`

## Alternatives rejected

- **Keep `?account=` and add it to every workspace link.** Each link has to remember the param, and any link that
  forgets it resets the selection.
- **Context state mirrored to `?account=`.** It works on the client, but it keeps two sources of truth synced by
  effects, and the server still can't see the account.
- **"All accounts" at the workspace level, with no `all` segment** (`/workspace/{id}/{section}`). Rejected because
  section and account segments would collide at the same level.
- **`all` as just one value of `[accountId]`, with no static folder.** The aggregated scope would go through the
  account layout and its DAO prefetch.

## Consequences

- Links can be shared and bookmarked, and back/forward work, with no code to keep state in sync.
- The server sees the account, so account-scoped data is prefetched and hydrated.
- Switching account is a server round-trip. This was accepted because the React Query cache keeps it from being a
  noticeable regression.
- Each section needs a route file in both trees ([all] and [account_id]).
- The redirects stay temporary until the URL shape settles. Then they become `permanent: true`.

## Open

- Move `proposals`, `members` and `transactions` onto account-scoped routes (target: end of the sprint after
  2026-09-30).
- When an account-owned entity, such as a proposal, is opened from the `all` scope, switch the scope to its account.
- Decide how to handle accounts that are not part of the workspace.
- Decide how to handle links with workspace ID which is not found locally or in user's registry. Redirect to first available workspace? Show 404 Not found?
  - How to share links related to specific accounts? Users should see any account data even if it's not in their workspace, plus, we should show an option to add that account to a selected user's workspace.
- Do we need account type as URL param? How to get the type of account (based on network-address) if workspace is not present locally?
  - **Proposed: no.** The type is a fact about the address, not about the view. Putting it in the URL adds a second
    source of truth and invalid combinations to validate (`safe/` with a DAO address). The type can be resolved
    without the workspace: `POST /v2/workspaces/query/accounts` takes `{ network, address }[]` only and returns
    `dao` / `safe` / `unknown`.
  - `LayoutWorkspaceAccount` resolves the type through that endpoint and prefetches and hydrates it, replacing
    today's "DAO or nothing" `daoOptions` prefetch. It then branches: DAO pages for `dao`, Safe pages for `safe`
    once they exist, and `notFound()` for `unknown`. Cost: one extra request per account-scoped server render.
- Decide how best to re-introduce ENS support back into URLs.
