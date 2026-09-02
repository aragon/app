# Workspace Assets & Transactions pages

Implementation notes and decision log for the first workspace slice. Design context and the wider plan (Safe
accounts, members, proposals, workspace persistence) live in [`workspaces.md`](./workspaces.md).

## Scope

Built:

- `/workspace/{workspaceId}/assets`
- `/workspace/{workspaceId}/transactions`

Both aggregate across every account of a workspace, or show a single selected account, using **only the existing
backend** — no API changes, no new endpoints.

Out of scope for this slice: Safe accounts (DAO accounts only), and every other workspace page (dashboard, members,
proposals, settings, permissions). The workspace itself is mocked; there is no workspace registry yet.

## The constraint everything follows from

`/v2/assets` and `/v2/transactions` accept **exactly one `daoId` per request**. Repeated params, a comma-joined list
and a `daoIds` param are all rejected:

```
GET /v2/transactions?daoId=A&daoId=B   → 400 {"errors":["\"daoId\" must be a string"]}
GET /v2/transactions?daoId=A,B         → 400 {"errors":["\"daoId\" is not a valid daoId"]}
GET /v2/transactions?daoIds=A&daoIds=B → 400 "Either daoId must be provided, or network with at least one address…"
```

There is no server-side aggregation across accounts. A workspace-wide view must fan out one request per account and
merge client-side. Everything below is a consequence of that.

### Other verified backend behaviour

| Fact | Consequence |
| --- | --- |
| `pageSize` caps at **50** on both endpoints; larger is a `400` | page sizes are clamped, not passed through |
| Both accept `sort` + `order`, but **silently ignore an unrecognised `sort`** rather than erroring | a typo'd sort field degrades to the default with no signal, so the value must be a real field name |
| Default transaction sort is `blockNumber desc` | block numbers are **not comparable across chains**; a cross-network merge must pin `blockTimestamp` |
| Only execution transactions carry an `id` (48 of 119 on the demo sepolia DAO); transfers have none | a merged list cannot key on `id` |
| Querying a parent DAO's `daoId` **already aggregates its linked accounts** (`onlyParent=true` restricts to the parent) | child DAOs need no client-side work |
| Assets carry `dao: {address,…}` + `network`; transactions carry `daoAddress` + `network` | merged items can be attributed to an account |
| `/v2/daos/{id}` accepts no query params on some deployments (`"value" must have less than or equal to 0 keys`) | don't rely on `onlyParent` there; the transaction/asset endpoints are the ones that honour it |

## File map

```
src/modules/workspace/
├── api/
│   ├── workspaceService/              # the mocked workspace API
│   │   ├── domain/                    #   IWorkspace, IWorkspaceAccount, WorkspaceAccountType
│   │   ├── workspaceService.ts        #   getWorkspace → static map
│   │   ├── workspaceServiceKeys.ts
│   │   └── queries/useWorkspace/
│   └── workspaceFinanceService/       # cross-account aggregation over financeService
│       ├── domain/                    #   IWorkspaceAsset, IWorkspaceTransaction, page shapes
│       ├── workspaceFinanceService.ts #   drain-all (assets) + frontier merge (transactions)
│       ├── workspaceFinanceServiceKeys.ts
│       └── queries/                   #   useWorkspaceAssetList, useWorkspaceTransactionList,
│                                      #   useWorkspaceTransactionAvailability
├── components/
│   ├── workspaceAccountFilter/        # the account toggle group (flat list, children marked "↳")
│   ├── workspaceAssetList/            # aggregated asset list ("All accounts" only)
│   ├── workspaceTransactionList/      # aggregated transaction list ("All accounts" only)
│   └── workspaceFilterAsideCard/      # aside: workspace totals or selected-account details
├── constants/
│   ├── workspaceMocks.ts              # the `demo` workspace definition
│   └── workspaceFilterParam.ts        # URL param name: `account`
├── hooks/
│   ├── useWorkspaceAccountDaos/       # resolves each account's IDao via useQueries
│   ├── useWorkspaceFilterUrlParam/    # builds the nested option tree, syncs with the URL
│   ├── useWorkspaceAssetListData/     # shapes the aggregate for DataListRoot
│   └── useWorkspaceTransactionListData/
└── pages/
    ├── workspaceAssetsPage/           # server page + *PageClient
    └── workspaceTransactionsPage/

src/app/workspace/[workspaceId]/{layout,assets/page,transactions/page}.tsx
src/modules/application/components/layouts/layoutWorkspace/
src/modules/application/components/navigations/navigationWorkspace/
src/modules/finance/utils/assetUtils/                # extracted, shared with the DAO pages
```

---

## Decision log

### 1. The workspace mock is a service with a static map, not the fetch interceptor

**Decision.** `workspaceService.getWorkspace` resolves from `workspaceMocks` (keyed by workspace ID) and rejects with
a real `AragonBackendServiceError(notFoundCode, …, 404)` for an unknown ID. It is otherwise shaped exactly like the
other services — async, same error type, own `*ServiceKeys`, own `queries/useWorkspace`.

**Reasoning.** Swapping in the real endpoint later is a one-method change; no consumer, query key, prefetch or
component has to be touched. Returning the canonical error type means the layout's existing not-found handling works
for free.

**Rejected — the `useMocks` fetch interceptor.** `fetchInterceptorUtils.intercept()` patches `global.fetch` from
`providers.tsx`, a **client** component. The workspace pages prefetch on the server, so the server-side resolution
would bypass the interceptor entirely and 404 against a route that doesn't exist. (`src/backendApiMocks.ts` is also
still an empty array — nothing uses this path yet.)

**Rejected — a bare exported constant.** Every consumer would need rewriting when the real API lands.

### 2. Assets and transactions get *different* pagination strategies

Their volumes differ by orders of magnitude, so one strategy can't serve both.

| | Assets | Transactions |
| --- | --- | --- |
| Typical volume | 2–4 per account | 27 and 119 in the demo workspace; thousands in production |
| Strategy | drain every page of every account, merge, sort, paginate **client-side** | lazy **frontier-cursor** merge |
| Requests up front | ~1 per account | 1 per account |
| Bounded by | `maxAssetPages` (10) × `maxPageSize` (50) = 500 per account | nothing — pages are pulled on demand |

**Assets — drain-all.** With a handful of tokens per account, fetching everything costs one request per account and
buys exact totals (`totalAmountUsd`, `totalRecords`) for the aside stats with no extra queries. "Load more" then just
reveals the next slice of an already-sorted array.

**Transactions — why drain-all is not an option.** The demo sepolia DAO alone is 119 records (6 requests at
`pageSize` 20); a real DAO with thousands of transfers would fire dozens of requests before first paint.

**Transactions — why naive concat is not an option.** Fetch page 1 of each account, concatenate, sort, and advance
every account on "Load more". It is far less code and it is visibly wrong: if account A's oldest fetched item is
shown, account B's *next* page may contain something newer, which then gets appended **below** rows already on
screen. Append-only "Load more" UI cannot retract that.

### 3. The frontier invariant

An item is safe to display only when **no account that still has unfetched pages could produce anything newer.**

Each account offers exactly one piece of evidence about what it is still hiding: the oldest item fetched from it.
Because each stream is sorted descending, everything unfetched from that account is older than that. The binding
constraint is the **newest** of those boundaries, over only the accounts with pages left:

```
frontier = max( oldestFetchedTimestamp(a) : a.page < a.totalPages )
```

Everything `>= frontier` is provably complete and is emitted; everything older is buffered, not discarded, and is
released for free once the frontier drops below it. Accounts with no pages left impose no boundary, so when every
account is drained the frontier is `-Infinity` and the whole list is emitted.

```
A: fetched [90, 80, 70]   pages left → boundary 70
B: fetched [85, 60]       pages left → boundary 60

frontier = max(70, 60) = 70
emit:  90, 85, 80, 70
hold:  60                 ← A's page 2 may hold 65, which belongs above 60
```

`getFrontier` + `mergeTransactionPages` in `workspaceFinanceService.ts`.

### 4. Advance only the accounts *at* the frontier

**Decision.** `getNextTransactionPageParams` advances only accounts where `oldestTimestamp >= frontier`, returning a
page map naming just those: `{ ...previousParams, pages: { a: 2 } }`.

**Reasoning.** In the example above B is already fetched down to 60, well past the frontier of 70. Fetching more of B
buys nothing — its items below 70 are withheld regardless. The account *starving* the list is the one sitting at the
frontier. Advancing everything would re-fetch accounts that already have unshown items buffered, growing both request
count and memory for no visible gain.

The payoff compounds: after A returns `[65, 50]` its boundary drops to 50, the frontier becomes `max(50, 60) = 60`,
and **both 60 and 65 become displayable** — one request, two items released.

**Edge case.** If every pending account sits *below* the frontier (possible when an account returns an empty page
while claiming more pages), advance all of them rather than stalling. Accounts that returned nothing at all also
contribute no boundary — `getFrontier` filters on `Number.isFinite` — because an infinite boundary would hide the
entire list.

### 5. Emit `>= frontier`, not `> frontier` — a deliberate trade

**Decision.** Items whose timestamp *equals* the frontier are emitted.

**Reasoning.** `>` is strictly airtight but can **stall**: an account whose entire page carries one repeated timestamp
would have `oldest == frontier`, release nothing, and need a second request to make any progress. These DAOs do have
ties — two sepolia executions share `blockTimestamp 1777034736`.

**The cost, stated plainly.** An account at the frontier can return more items with that identical timestamp on its
next page, and since the merged list is re-sorted from scratch each render, those can land *between* already-displayed
items sharing that timestamp. So **positions can shift within a single-timestamp band across loads.** The list is
always correctly sorted by timestamp; only the arbitrary intra-timestamp order wobbles.

The `localeCompare` tie-break makes that order **deterministic** (independent of fetch order) — it does not make it
positionally stable across loads. If this ever matters, the fix is a compound cursor (`blockTimestamp` + `logIndex`),
not switching to `>`.

### 6. The cursor is recomputed, never stored

**Decision.** `getAccountStates(allPages)` folds every fetched round back into one record per account — `max` page
reached, `min` timestamp seen, `totalPages`, `totalRecords`. Both the frontier and the next page map are derived from
`allPages` on every call.

**Reasoning.** Idempotent and order-independent, so it survives React Query rehydrating the cache from the SSR
payload, the component remounting, and rounds replaying. A stored cursor would have to be kept in sync with the query
cache, which is the kind of duplicated state that goes stale.

### 7. A React Query "page" is a *round*, not one account's page

`useWorkspaceTransactionList` is an ordinary `useInfiniteQuery`, with the page unit redefined:

- `initialPageParam` — the params **without** a `pages` map. `getTransactionList` reads that as "first round" and
  fetches page 1 of every account.
- `queryFn` fetches only the accounts named in `pages`, in parallel, returning `{ accounts: [...] }` — one entry per
  account with its `page`, `totalPages`, `totalRecords` and items.
- `getNextPageParam` returns the next page map, or `undefined` once no account has `page < totalPages`, which is what
  disables the "More" button.

The `pages` cursor is **excluded from the query key** (`workspaceFinanceServiceKeys.transactionList` keys on
`queryParams` only) — it is a position within the query, not part of its identity. Including it would make every
round a separate query.

### 8. Sort is pinned explicitly

**Decision.** Every transaction request sends `sort=blockTimestamp&order=desc`; every asset request sends
`sort=amountUsd&order=desc`. `IGetAssetListQueryParams` and `IGetTransactionListQueryParams` were extended with
`IOrderedRequest` to allow this.

**Reasoning.** Two independent reasons, either sufficient:

1. The backend's default transaction sort is `blockNumber desc`. Block numbers from Citrea and Ethereum Sepolia are
   **meaningless to compare** — the merge would produce confidently-ordered nonsense.
2. The merge requires every account to be ordered identically by the field it compares. Relying on an undocumented
   default is a silent-breakage risk, made worse by the backend ignoring unrecognised sort fields instead of erroring.

### 9. Transactions are keyed by block coordinates, and `ITransaction.id` was wrong

**Decision.** The dedupe key is
`network + transactionHash + transactionIndex + logIndex + actionIndex + side`. `id` moved from `ITransactionBase` to
`ITransactionExecution` (required there), and the optional index fields were added to `ITransactionBase`.

**Reasoning.** `id` was declared required on the base type, but **71 of 119** sepolia records ship without it —
exactly the transfers; only the 48 executions have one. Deduping on `id` would collapse every transfer into one
entry. The composite key was verified unique across all 119 records.

This is a genuine type-accuracy fix, not a workaround: the only consumer of `id` is `transactionDetailDialog`, which
is reached through `onTransactionClick: (transaction: ITransactionExecution) => void` and so always has one. The test
generator was updated to match (`id` now only on the execution branch).

### 10. Single-account views reuse the DAO components verbatim

**Decision.** The account filter picks between two renderers:

- **`All accounts`** → `WorkspaceAssetList` / `WorkspaceTransactionList` (the aggregating components).
- **any single account or child** → `AssetList.Default` / `TransactionList.Default`, unchanged, with
  `{ queryParams: { daoId, onlyParent, pageSize } }`.

**Reasoning.** One account is one backend query, which is precisely what those components already do. Reusing them
means the type filters, empty/error states, search and pagination behave identically to the DAO pages by
construction, and the aggregation code only has to exist for the case that genuinely needs it.

### 11. The filter is the DAO filter lifted one level up

**Decision.** A flat toggle group: `All accounts` | one entry per workspace account | one entry per linked account of
those accounts, marked `↳`.

```
[ All accounts ]                          → fan out, no onlyParent
[ Citrea ]                                → daoId=citrea-…    (no children)
[ Aragon ACF ]                            → daoId=sepolia-…  onlyParent=true
[ ↳ Core Team SubDAO ]                    → daoId=child-…
[ ↳ Rewards SubDAO ]                      → daoId=child-…
[ ↳ Buyback and Burn SubDAO ]             → daoId=child-…
```

**Reasoning.** This mirrors `useDaoFilterUrlParam` exactly, including the `onlyParent` mechanism: an account whose DAO
has linked accounts carries `onlyParent: true` so it does not double-count the children listed beneath it. The
`All accounts` option queries each top-level account **without** `onlyParent`, so the backend folds in every child —
verified: 119 records vs 48 with `onlyParent=true`.

Child entries are built from `dao.linkedAccounts` at runtime and simply don't render when that array is empty, so the
filter degrades to flat against older backends and lights up automatically against newer ones. Options are built by
`useWorkspaceFilterUrlParam`, which resolves each account's `IDao` through `useWorkspaceAccountDaos` (a `useQueries`
over the same `daoOptions` the DAO pages use, so the cache is shared).

The `↳` prefix is applied in `WorkspaceAccountFilter`, not baked into the option label — presentation stays in the
component. The filter renders nothing when there are fewer than two options, matching how
`PluginFilterComponent.isSingleComponent` collapses a single-option toggle group on the DAO pages.

### 12. Type-filter availability is its own fan-out query

**Decision.** `useWorkspaceTransactionAvailability` runs one `useQuery` per filter that fans out `pageSize=1` requests
across accounts and **sums `metadata.totalRecords`**. Three such queries decide which of
`All / Executions / Deposits / Withdrawals` to show.

**Reasoning.** It mirrors what `TransactionListDefault` already does for a single DAO, so the two surfaces show and
hide the same filters under the same conditions. `TransactionListTypeFilter`,
`transactionListTypeQueryParams`, `transactionListTypeFilters` and `transactionListTypeFilterParam` are **exported
and reused** rather than redeclared, so the URL parameter values stay in sync and the selection survives switching
between the aggregate and a single account.

Cost is 3 × N lightweight requests, cached by React Query. Verified exact against the raw API:
executions 20+23=43, deposits 10+3=13, withdrawals 18+1=19, all 119+27=146.

### 13. Asset `itemsCount` reports what was fetched, not the backend total

**Decision.** `useWorkspaceAssetListData` returns `itemsCount: data?.assets.length`, with the backend's summed
`totalRecords` exposed separately.

**Reasoning.** The list is paginated client-side. If the fetch cap (`maxAssetPages`) ever truncates an account,
reporting the backend total would leave a "Load more" button that reveals nothing. `isTruncated` is surfaced on the
result so a future UI can say so explicitly. `totalRecords` stays exact because it comes from response metadata, not
from counting rows.

### 14. The reveal window resets via derived state, not an effect

**Decision.** The client-side page window is `useState({ accountsKey, count })`, with
`visibleCount = revealed.accountsKey === accountsKey ? revealed.count : pageSize`.

**Reasoning.** The window must collapse to one page when the set of aggregated accounts changes. Doing that in a
`useEffect` keyed on the account list is the "reset state on prop change" anti-pattern — it also trips
`useExhaustiveDependencies`, because the account key appears in the dependency array but not in the effect body. The
derived-state form needs no effect, no lint suppression, and no extra render.

### 15. Prefetch is split between the layout and the page

**Decision.** `LayoutWorkspace` fetches the workspace and prefetches every account's `IDao`. Each page fetches the
workspace again (a local map lookup, free) and prefetches only its own list query.

**Reasoning.** The account DAOs back the filter labels and the aside details on *every* workspace page, so they are
fetched once in the layout rather than repeated per page. The page still needs the workspace to know the account IDs,
but while the API is mocked that costs nothing. Both hydrate into the same client cache via `HydrationBoundary`.

Server prefetch and client query go through the same options helpers (`workspaceAssetListOptions` /
`workspaceTransactionListOptions` / `daoOptions`) so the keys match and the client gets cache hits.

> Note: only the `All accounts` list is prefetched. Single-account tabs are client-only queries, so their rows appear
> as skeletons in the SSR HTML and populate after hydration. This is why inspecting `curl` output alone is misleading
> — verify those tabs in a browser.

### 16. The detail dialog's DAO is resolved per item

**Decision.** `WorkspaceTransactionList` takes `accounts`, builds a `daoId → IDao` map from `useWorkspaceAccountDaos`,
passes the owning DAO to each `TransactionListItem`, and hands it to `onTransactionClick(transaction, dao)`. The page
opens the dialog only when that DAO resolved.

**Reasoning.** `ITransactionDetailDialogParams.dao` is required — the dialog normalizes actions against it and builds
the proposal link from it — and `TransactionListItem` also needs it to label executions with the source plugin name
instead of a raw address. In an aggregated list there is no single DAO, but every item carries the `daoId` it was
**fetched for**, and a parent account's children report the parent's ID, so this always resolves to a workspace
account.

### 17. `assetUtils.normalizeAsset` was extracted

**Decision.** The amount/price normalization inlined in `useAssetListData` moved to
`src/modules/finance/utils/assetUtils/` and is now used by both the DAO and workspace hooks.

**Reasoning.** The workspace aggregate needs the same handling (missing `amount`, `priceUsd` of 0 with a known
`amountUsd`, unknown token names). Two copies of a pricing fallback would drift.

---

## Cost model

| Interaction | Requests |
| --- | --- |
| Assets, `All accounts`, first load | ~1 per account (2 in the demo) |
| Assets, "Load more" | **0** — client-side reveal |
| Assets, single account | 1 (+1 for the aside count) |
| Transactions, `All accounts`, first load | 1 per account, + 3 per account for filter availability |
| Transactions, "Load more" | 1 per account *at the frontier* — typically 1, never more than N |
| Transactions, single account | as the DAO page: 1 + 3 availability |

## Verified behaviour

Against the live backend, workspace `demo`
(`citrea-mainnet-0xA941…6419` + `ethereum-sepolia-0xE8fd…0De5`, the latter a parent with 3 SubDAOs):

**Assets, `All accounts`** — 4 tokens merged across both networks, ordered by USD value desc: CTR $25.47M, BTC $0.12,
WETH, MERC. Aside: `$25.47M` / `4 unique tokens`.

**Transactions, `All accounts`** — `20 of 146` on load (119 + 27). Successive "Load more":

```
20 → 40 → 45 → 65 → 87 → 107 → 127 → 146   then "More" disables
```

Strictly descending at **every** step, and 146 rows for 146 records — no gaps, no duplicates. The `45` step is the
frontier working as designed: one request released only 5 held items because the other account was already far ahead
of the frontier.

**Single account / child** — Citrea tab: `2 of 2 Assets`, correct aside. `↳ Buyback and Burn SubDAO` tab:
`20 of 45 Transactions`, aside titled `Buyback and Burn SubDAO`.

**Unknown workspace** — `/workspace/nope/assets` renders the layout's not-found state.

## Testing

`workspaceFinanceService.test.ts` covers the merge and the cursor: the hold-back invariant, full emission once
drained, dedupe across rounds, summed totals, the empty-page edge case, frontier-only advancement, repeated
advancement of the same account, and termination.

The suite was validated by mutation — neutering `getFrontier` fails exactly the two hold-back tests and nothing else.

## Known limitations & follow-ups

1. **Intra-timestamp position wobble** on the aggregated transaction list — see decision 5. Fix is a compound cursor.
2. **Asset fetch cap** of 10 pages × 50 = 500 per account. `isTruncated` is computed and returned but no UI surfaces
   it yet.
3. **Type-filter counts don't sum to the total** (43 + 13 + 19 ≠ 146). This is pre-existing backend filter semantics,
   identical on the DAO pages (sepolia alone: 20 + 10 + 18 ≠ 119) — some record types match none of the three
   filters. Not introduced here.
4. **Availability costs 3 × N requests** per aggregated view. If N grows, a single endpoint returning per-type counts
   would collapse this to one call.
5. **Workspace persistence.** `workspaceMocks` is the whole registry. When a real endpoint exists, change
   `workspaceService.getWorkspace` to issue the request — nothing else needs touching.
6. **Safe accounts.** `IWorkspaceAccount` already carries a `WorkspaceAccountType` discriminator and an optional
   `metadata` block for accounts with no on-chain metadata of their own, so adding `SAFE` does not reshape the domain.
   `useWorkspaceAccountDaos` filters on `type === DAO` and would need a sibling resolver.
7. **A server-side `daoIds` param** on `/v2/assets` and `/v2/transactions` would make the entire aggregation layer
   redundant. That is the right long-term fix; this slice exists because it does not exist yet.
