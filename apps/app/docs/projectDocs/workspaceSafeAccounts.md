# Safe accounts in workspaces — research

Touch-point inventory for making `WorkspaceAccountType.SAFE` a first-class workspace account. No code is proposed
here: the point is to name every place the current implementation assumes "account == DAO", say what a Safe does
there today, and separate what the app already has from what is genuinely missing.

Companion notes: [`createWorkspace.md`](./createWorkspace.md) (the implementation of record),
[`workspaceRouting.md`](./workspaceRouting.md) (the account-scope ADR),
[`workspaceAccess.md`](./workspaceAccess.md) (registry/auth, orthogonal to this).

- **Read on:** `app-1140-v1-of-workspaces-supporting-multiple-daos` @ `a64853af3`, plus
  `safe-biz-logic` ([#1397](https://github.com/aragon/app/pull/1397), open) and
  `app-1165-safe-process-identity` ([#1437](https://github.com/aragon/app/pull/1437), open).
  `safe-account-impl` ([#1336](https://github.com/aragon/app/pull/1336), closed preview) is an ancestor of
  `safe-biz-logic` and contributes nothing of its own.
- **Confidence markers:** claims about the backend response shape are marked *(backend — confirm)* where they come
  from the doc comments in `workspaceQueryService/` rather than from a response I observed.

## TL;DR

1. **Nothing is missing at the registry, create-flow or data-model layer.** A Safe is already resolvable, storable,
   taggable and avatar-able. `WorkspaceAccountType.SAFE` already exists and is already written by
   `publishWorkspaceDialog`. Creation is done.
2. **The account-scoped route tree is where it breaks.** Four of the six account pages resolve a DAO and fail
   closed (`WorkspaceAccountGate`); the proposals page fails *open*, silently widening to every DAO account under a
   URL naming a Safe. Assets and transactions genuinely work.
3. **A Safe never becomes an account option**, so the selector, every aside-card router and every "which account"
   branch routes a Safe into the aggregated fallback. Twelve distinct call sites.
4. **`coverage`/`partial` semantics are the subtlest problem.** `unverified` is the permanent state of every Safe
   and it sets `partial: true`. Assets deliberately filters it out; **transactions, members and the member-details
   redirect do not**, so adding one Safe to a workspace turns on a permanent "this list is incomplete" warning and
   makes every count read `N+`.
5. **"Safes have proposals" is a design decision, not a port.** `app-1165` defines a Safe proposal *relative to a
   DAO* — a Safe transaction whose payload is `DAO.execute(...)`. A workspace Safe account has no DAO behind it, so
   that definition does not transfer. Meanwhile the workspace proposals endpoint already returns a `pending` block
   of queued Safe transactions that the app models as nothing. See [The proposals question](#the-proposals-question).
6. **The three branches collide on 12 files**, including a rename (`buildPluginUniqueId` → `getPluginTabId`) that
   the workspace member list calls, and the `SelectPluginDialog` params block that both branches extend.

## The model today

Three layers answer "what is this account", and only the first two know a Safe exists.

| Layer | Knows Safe? | Where |
| --- | --- | --- |
| **Registry** — `IWorkspaceAccount { id, type, address, network, metadata? }` | yes, `type: SAFE` | `api/workspaceService/` (localStorage) |
| **Workspace query API** — `POST /v2/workspaces/query/{accounts,assets,transactions,proposals,members}` | yes, per-account `coverage` with a `safe` source | `api/workspaceQueryService/` |
| **DAO API** — `GET /daos/{daoId}`, plugins, permissions, member lists | no. A Safe has no DAO | `shared/api/daoService` |

The account scope is a path segment, `{network}-{address}`, deliberately identical to a DAO ID
([`workspaceRouting.md`](./workspaceRouting.md)). That is the load-bearing decision this whole inventory hangs off:
it is why `LayoutWorkspaceAccount` can resolve an account without reading the registry, and why every page that
delegates to a DAO page needs nothing but a parameter reshape — *as long as the account is a DAO*.

## A. Already Safe-complete

Worth stating so it is not rebuilt.

| Surface | What it already does |
| --- | --- |
| `createWorkspaceFormAccountIdentity` | Shows a wallet `Avatar` + `safeWallet.png` + a neutral `Safe` tag while resolving; names a Safe by its truncated address, since the accounts endpoint names DAOs only |
| `workspaceUtils.getAccountType` / `validateAccountInfo` | Maps `WorkspaceAccountInfoType.SAFE` → `WorkspaceAccountType.SAFE`; `unsupported` blocks permanently, `unavailable` blocks with a retry message |
| `publishWorkspaceDialogUtils.buildAccount` | Re-resolves every account at submit and `invariant`s rather than guessing a type |
| `WorkspaceAccountItem` (overview rows) | DAO/Safe branch on avatar and tag, links into the workspace-scoped account route |
| `WorkspaceSelectAccountDialogItem` | Same DAO/Safe branch; the transactions flow already *lists* Safe rows (dimmed, "not eligible") |
| `WorkspaceAssetList` / `useWorkspaceAssetListData` | Reads the aggregation endpoint for every scope, so a Safe's balances are correct in both the aggregated and the account scope; `unverified` deliberately not warned about |
| `WorkspaceTransactionList` | Same, rows and paging are correct for a Safe |
| `WorkspaceMemberList` | Safe **owners** are already in the aggregated list — the members endpoint returns them with `role: owner` and `governance.type: 'safe'` |
| Account-scope URL shape | `next.config.mjs` matches the account segment on `[^/]+-0x[0-9a-fA-F]{40}`, which a Safe address satisfies. No routing change needed |

## B. Touch-point inventory

Severity key: **breaks** = error state or wrong data; **degrades** = renders, but says less or something generic;
**lies** = renders confidently wrong information. Ordered by how much it hurts.

### B1. Routes, layouts and the gate — *breaks*

`WorkspaceAccountGate` (`components/workspaceAccountGate/workspaceAccountGate.tsx:47`) does
`fetchQuery(daoOptions(...))` and renders a generic error when it throws. It wraps four pages:

| Route | Today for a Safe |
| --- | --- |
| `/{accountId}/overview` | gate error. The page is `DaoDashboardPage` verbatim |
| `/{accountId}/members` | gate error. The page is `DaoMembersPage` verbatim |
| `/{accountId}/members/{address}` | gate error. The page is `DaoMemberDetailsPage` verbatim |
| `/{accountId}/proposals/{proposalSlug}` | gate error. The page is `DaoProposalDetailsPage` verbatim |

So **every entry point that leads to a Safe account lands on an error state**: the overview row
(`WorkspaceAccountItem` links to `{accountId}/overview` whatever the type), and any navigation link while a Safe
scope is on the URL.

`LayoutWorkspaceAccount` (`layoutWorkspaceAccount.tsx:62`) uses `prefetchQuery`, which resolves rather than
throws, precisely so the Safe-capable sections keep working. Both files carry the same TODO: merge the gate into
the layout once the gate can tell the account type apart, replacing the DAO prefetch with a type-aware
`fetchQuery` and branching DAO pages / Safe pages / `notFound()`.

`workspaceRouting.md` already proposes the resolution mechanism and rejects putting the type in the URL: the
layout resolves the type through `POST /v2/workspaces/query/accounts`, which takes `{ network, address }[]` only
and needs no registry read. That is the one new server read the whole feature costs, and it replaces the
"DAO or nothing" prefetch rather than adding to it.

**Open sub-question the TODO flags and nobody has answered:** a DAO page rendered under a layout that withholds
its children can still surface its own `notFound()` over the layout's error state (`DaoMembersPage` redirects
when a DAO has no visible body). Verify before moving the gate up.

### B2. `coverage` / `partial` semantics — *lies*

The highest-value finding, because it is invisible until a Safe is added and then it is permanent.

`WorkspaceCoverageStatus.UNVERIFIED` is documented as "the permanent state of every Safe account, not a failure",
and `IWorkspaceQueryResponse.partial` is "true when any coverage entry is not available". Therefore **any
selection containing a Safe returns `partial: true` forever** *(backend — confirm, but both doc comments say so
and the assets hook was written around it)*.

| Call site | Consequence of one Safe in the selection |
| --- | --- |
| `workspaceTransactionList.tsx:204` → `AlertInline` | Permanent "the list is incomplete" warning on the aggregated transactions page |
| `workspaceMemberListDefault.tsx:249` → `AlertInline` | Same, on the aggregated members page |
| `workspaceMembersAsideCard.tsx:69` | Member total permanently rendered `N+` |
| `workspaceAllTransactionsAsideCard.tsx:76` | Transaction total permanently rendered `N+` |
| `workspaceAccountMemberDetailsPage.tsx:95` | `isCompleteLookup` never true, so the "member not found → redirect to the members list" guard silently stops firing |

`useWorkspaceAssetListData.ts:41` shows the intended shape — filter `coverage` to
`WorkspaceCoverageStatus.UNAVAILABLE` and warn only on that. The fix is to apply that rule everywhere instead of
reading the blunt `partial` flag, which means **either** a shared `coverageUtils` the four lists agree on, **or**
asking the backend for a second flag that excludes `unverified`. The first is cheaper and keeps the policy in one
readable place.

### B3. Proposals — *lies*, then *missing*

`workspaceProposalsPageClient.tsx:73` narrows the route account to DAOs and, for a Safe, falls back to
`daoAccounts`:

```ts
const scopedAccount = routeAccount?.type === WorkspaceAccountType.DAO ? routeAccount : undefined;
const accountsToDisplay = scopedAccount != null ? [scopedAccount] : daoAccounts;
```

`/workspace/{id}/{safeAccountId}/proposals` therefore shows **every DAO account's proposals under a URL naming
one Safe**, with an aside card describing the whole workspace. The page is not gated, so nothing stops it. It is
deliberate and documented ("a Safe has no proposals to show"), and it is the single most misleading screen in the
feature: it answers a question about one account with the totals of every other.

Downstream of the same fallback:

- `useWorkspaceProposalTabs` — "Non-DAO accounts have no process and are ignored". A Safe contributes no tab.
- `WorkspaceProposalsAsideCard` — no Safe branch; falls through to `WorkspaceAllProposalsAsideCard`.
- `IGetWorkspaceProposalListBody.accounts` — "Only DAO accounts are sent: Safe accounts have no indexed
  proposals, they only contribute to the queued-transaction block this page does not render."
- The "New proposal" flow passes `daoAccounts` to `WorkspaceSelectAccountDialog`, so a Safe is not offered.
- `WorkspaceProposalDetailsPage` is `DaoProposalDetailsPage` behind the gate, so a Safe proposal has no details
  route of any kind.

See [The proposals question](#the-proposals-question) for what "Safe proposals" should even mean.

### B4. Members — *breaks*, with one correct half

The aggregated list is already right: Safe owners appear, tagged by their `governance.address` (the Safe itself).
Two gaps:

1. **Rows link nowhere useful.** `workspaceMemberListDefault.tsx:265` builds `memberPageAccountIds` from DAO
   accounts only, so a member who holds *only* Safe memberships gets `accountId == null` and the row degrades to
   an **external block-explorer link in a new tab**. The comment says this set "is what grows when Safe account
   pages land".
2. **No Safe tab.** `WorkspaceMemberList` builds tabs from `useWorkspacePlugins({ type: PluginType.BODY })`,
   which reads DAO plugins. A Safe account contributes no tab — correctly handled today (`hasAccountWithoutTab`
   keeps the group tab meaningful), but a Safe account's owners are unfilterable.

The account-scoped page (`WorkspaceAccountMembersPage`) is `DaoMembersPage` behind the gate, and its own doc
comment already names the shape of the fix: *"A workspace holds more than DAOs… a DAO has the members of its
governance plugins, a Safe has its owners. Only the DAO branch exists so far… Another account type is added by
branching here."*

### B5. Transactions — *degrades*

Reads correctly; the write path does not exist.

- `useWorkspaceAccountsExecutePermission.ts:49` carries an explicit `TODO(APP-1140)`: Safes are excluded from the
  `hasPermission` batch and therefore always report `false`. A Safe has no `PermissionManager`; eligibility is
  "the connected address is an owner (`getOwners`/`isOwner`) or sits on the proposer list". Named footholds:
  `useIsSafeContract` and the `brandId: 'safe'` enrichment on `IDaoPermission`.
- `workspaceTransactionsPageClient.tsx:66` — `getCreateTransactionUrl` is `daoUtils.getDaoUrl(dao, 'create/execute')`,
  which returns `undefined` for a Safe. TODO on the same line: "A Safe account will need a destination of its own,
  which `getDaoUrl` cannot name."
- `workspaceTransactionsPageClient.tsx:55` is **the last page still narrowing by `activeOption?.account`** rather
  than `workspaceUtils.findAccountById`. Two blind spots, both already listed under Known gaps in
  `createWorkspace.md`: a lowercased account ID in a shared link, and a Safe — neither becomes an option, so both
  widen the page to every account under a URL naming one.
- `WorkspaceTransactionsAsideCard` passes `account.address` to `DispatchPanel` as `daoAddress`. Unreachable today
  (Safes are never options) but it is a landmine the moment they are.

### B6. Assets — *degrades* (cosmetic only)

The only page that is substantively right. One gap: `WorkspaceAssetsAsideCard` has no Safe branch, so a Safe
scope falls back to `WorkspaceAllAssetsAsideCard` with a generic heading. The list beside it is correctly narrowed
to the Safe; only the card's title is wrong. `createWorkspace.md` says it plainly: "A Safe card slots in as one
more branch."

Also note `WorkspaceDaoAssetsAsideCard` reads `dao.metrics.tvlUSD` while the aggregated card sums
`totalAmountUsd` from the response — two different quantities. A Safe card should sum the response, matching the
aggregated card rather than inventing a third number.

### B7. The account option model — *degrades*, 12 call sites

`useWorkspaceAccountOptions.ts:99` filters to `WorkspaceAccountType.DAO`. Everything that branches on
`activeOption` therefore treats a Safe scope as "no selection":

- `WorkspaceAccountSelector` — a Safe is not switchable to. A reader on a Safe scope sees `activeOption?.label`
  as `undefined`, i.e. an **unlabelled trigger pill with a nameless avatar**. (Reachable by URL and from the
  overview row, so this is live, not hypothetical.)
- `WorkspaceAssetsAsideCard`, `WorkspaceTransactionsAsideCard`, `WorkspaceProposalsAsideCard`, and the
  `scopedOption` lookup in `workspaceProposalsPageClient` — all fall through to the aggregated card.
- The avatar lookup in the selector reads `daos[option.account.id]`, so a Safe has no avatar source even once it
  becomes an option; it needs `metadata.avatar ?? safeWallet.src`, the way `WorkspaceAccountItem` does it.

Making a Safe an option is the single change that un-degrades the most surfaces at once. It is also the change
that *activates* B5's `DispatchPanel` landmine and the aside-card fallbacks — so it should land with the per-type
cards, not before.

### B8. Plugin tab identity — *breaks on the merge*

Two workspace hooks mint their own tab IDs:

```ts
// useWorkspaceProposalTabs.ts and workspaceMemberList.tsx
uniqueId: `${dao.network}-${plugin.address}-${plugin.slug}`
```

`safe-biz-logic` adds `daoUtils.getPluginTabId(plugin, rootDaoAddress)`, which appends the holding DAO address
**for Safe plugins only**, "because a Safe is not installed, so two linked DAOs can share one Safe contract and
produce the same address and slug… Every surface that builds plugin tabs has to agree on this, or a tab selected
in a list cannot be found again by the aside or the detail page." The commit that did it is literally
`fix: Key Safe plugin tabs by their holding DAO so linked accounts stay distinct`.

Two consequences for workspaces:

1. **Collision.** Two DAO accounts in one workspace, on one network, sharing one Safe body → identical
   `uniqueId` → one tab swallows the other.
2. **Disagreement.** The workspace IDs are network-prefixed and the DAO pages' are not, so a workspace member row
   that writes `?members=` / `?proposals=` (via `daoUtils.buildPluginUniqueId`, `workspaceMemberListDefault.tsx:316-318`)
   already hands the DAO page a tab ID it cannot resolve. Adding Safes makes it worse rather than causing it.

Both workspace hooks should route through the shared helper.

### B9. URLs leaking out of the workspace — *degrades*, pre-existing

`daoMembersPage.tsx` on this branch carries a 16-line TODO: every URL `DaoMembersPage` and `DaoMemberDetailsPage`
build is a `/dao/…` URL, so a reader who arrived through the workspace is dropped out of it by the next click.
Three exits named: the member rows, the no-visible-body redirect, and the non-checksummed-address redirect. The
same is logged for the proposal details page under Known gaps.

This matters here because **Safe account pages are the opportunity to fix it rather than inherit it**: a Safe
account page is new code with no `/dao/…` ancestry, and if it is built by delegating to a shared page the way the
DAO branch does, it will acquire the same leak. The TODO already proposes the fix — make the base URL a parameter.

### B10. Metadata / SEO — *missing*

`workspaceMetadataUtils.generateProposalMetadata` parses `accountId` and delegates to
`governanceMetadataUtils.generateProposalMetadata`, which resolves a DAO. A Safe account route has no metadata
generator at all. Low priority, but note the existing one is deliberately flag-gated so a URL probe cannot read
real data for a disabled feature — a Safe equivalent needs the same gate.

### B11. Network coverage — *degrades*

The Safe transaction service covers 11 of the app's 14 networks. `safeTxServiceShortNames` omits
**Citrea, Chiliz and Robinhood**. Today the create form blocks those addresses (`status: unsupported`), which is
correct. Once Safe pages exist, the `isUnsupported` branch of `SafeAccountPageClient` is the precedent: a
first-class "Safe does not serve this chain" empty state, not a failure.

## The proposals question

This is the decision the rest of the Safe work waits on, and the two open PRs answer it differently.

**`app-1165` defines a Safe proposal relative to a DAO.** `safeDaoProposalUtils.findDaoExecuteActions` scans a
Safe transaction (unwrapping MultiSend to a bounded depth) for a plain `CALL` to a *target DAO* whose selector is
`DAO.execute`. A Safe shows up as a **governance process of the DAO it holds Execute permission on**; its
proposals live at `/dao/{network}/{addressOrEns}/proposals/safe/{safeTxHash}`; creation is "action-only proposals"
approved inside Aragon. The comment is explicit about why: *"A Safe's queue and history are account-wide, so
membership is proven, never assumed."* A Safe transaction that is not a `DAO.execute` is **not** a proposal in
that model.

**A workspace Safe account has no DAO behind it.** So the DAO-anchored definition does not transfer, and there are
three candidate models:

| Model | "A Safe account's proposals are…" | Cost | Honesty |
| --- | --- | --- | --- |
| **P1. Account-native queue** | its queued + executed multisig transactions, nonce-ordered | low — `SafePendingTransactionList` and `useSafeDaoProposals`' paging already exist | high: it is exactly what the Safe holds |
| **P2. Reuse the DAO-anchored notion** | only transactions that are `DAO.execute` on some DAO | nil new code | a standalone Safe would show an empty list, which reads as "no governance" |
| **P3. Backend `pending` block** | whatever `POST /v2/workspaces/query/proposals` returns in `pending` | low on the client — **the data is already being returned and thrown away** | depends on what the backend puts there |

**P1 and P3 are probably the same thing seen from two sides, and that is the most actionable finding in this
note.** `workspaceProposalListResponse.ts` documents that the proposals endpoint already returns "a `pending`
block of queued Safe transactions" alongside `data`, which the app deliberately does not model because the page
only sends DAO accounts. If that block covers directly-selected Safe accounts too *(backend — confirm; today only
DAO accounts are ever sent, so it has never been exercised)*, then the aggregated proposals page can show Safe
queue items with no new upstream integration at all — one response, two row kinds.

What P1 implies, and what the open PRs already pay for:

- **Row rendering**: `SafePendingTransactionList` + `safeProposalReportLink` exist on `safe-biz-logic`.
- **Status**: `SafeTransactionState` / `safeExecutionOutcomeUtils` map a Safe transaction to a terminal state.
- **Voting / approval**: `SafeMultisigVoteList`, `SafeMultisigSubmitVote`, `useSafeMultisigVotePermissionCheck`
  build a Votes tab from live confirmations. All slot-registered under `PluginInterfaceType.SAFE`.
- **Details page**: `SafeDaoProposalDetails` exists but resolves against a route DAO, so it needs a
  DAO-free variant for a standalone Safe.
- **Creation**: `safeNativeTransactionDialog` + `useProposeSafeTransaction` on `app-1165` already propose and
  confirm Safe transactions.

What P1 does **not** inherit: nonce semantics in an aggregated list. A Safe queue is nonce-ordered with
same-nonce rivals and staleness (`safe-spp-signing-trust` spends several paragraphs on this); merged into a
timestamp-sorted multi-account proposal list, "queued behind" and "replaced by" become meaningless. A Safe row in
the aggregated list probably has to be a different row kind, not an `IProposal` lookalike.

**Recommendation:** decide P1 vs P3 by asking the backend one question — *does `pending` cover a Safe passed
directly in `accounts`, or only Safes reached through a selected DAO's process?* The answer decides whether the
workspace proposals page gains a second data source or just stops discarding a field it already receives.

## C. What the Safe branches already give us

`safe-biz-logic` (#1397) is large — 223 files — and almost none of it is workspace-aware, but most of it is
reusable. Mapped to the gaps above:

| Gap | Existing asset | Branch |
| --- | --- | --- |
| B1 Safe account overview | **`SafeAccountPage` at `/safe/{network}/{address}`** — owners, nonce-ordered pending queue, balances, a details aside with threshold/version/authority rows, and an `isUnsupported` empty state. Behind the `safeAccountPage` flag | safe-biz-logic |
| B4 Safe members | `SafeOwnerList`, and `safeSettingsUtils.authorityRows` for the threshold | safe-biz-logic |
| B6 Safe assets card | `SafeBalanceList` / `safeBalanceUtils` (note: a *second* source for balances — see below) | safe-biz-logic |
| B5 Safe eligibility | `useSafeInfo().owners` is the owner check the TODO asks for | safe-biz-logic |
| B5 Safe transaction creation | `useProposeSafeTransaction`, `useConfirmSafeTransaction`, `safeTransactionEnvelopeUtils`, `useSafeTransactionExecution`, `safeNativeTransactionDialog` | both |
| Proposals (P1) | `useSafeDaoProposals` paging, `SafeMultisig*` slot components, `SafeTransactionState` | app-1165 |
| Transport | `safeService` + `/api/safe/{chainId}/{...path}` proxy route, `safeServiceError`, `safeQueryConfig`, EIP-3770 Safe-app deep links | safe-biz-logic |

**`SafeAccountPage` is the single biggest find.** It is almost exactly the Safe counterpart of
`DaoDashboardPage`, and `WorkspaceAccountOverviewPage`'s relationship to the dashboard is the template for
rendering it under a workspace: validate the flag, reshape the params, delegate. The sections even line up with
the workspace navigation (owners → Members, pending → Proposals, balances → Assets), which suggests the workspace
Safe pages are mostly a *re-slicing* of that one page across the five sections rather than new screens.

**Two caveats on reuse:**

1. **Double-sourced balances.** `SafeBalanceList` reads the Safe transaction service directly; the workspace
   assets page reads the aggregation endpoint (whose Safe source is `WorkspaceCoverageSource.SAFE`). Rendering
   both in one workspace guarantees drift — the aggregated total and the Safe card could disagree, exactly the
   failure `assetUtils.normalizeAsset` was extracted to prevent between the DAO and workspace asset lists. A
   workspace Safe assets view should read the **workspace** endpoint, as the DAO assets card does not.
2. **`SafeAccountPage` is explicitly read-only** ("Describe the Safe account page as an overview rather than an
   interactive view", "Make the Safe account queue a read-only view with proposal-context actions"). Signing and
   execution were deliberately kept in *proposal* context. A workspace Safe account that can create transactions
   reopens that decision — do not assume the read-only framing was accidental.

## D. Backend: available vs blocked

From the client contracts on this branch. *(All marked confirm — these are read off doc comments and types.)*

| Capability | Status |
| --- | --- |
| Resolve an address to `dao` / `safe` / `unknown` | **available**, `POST query/accounts`, no registry read needed |
| Full Safe configuration at resolve time | **available but unmodelled** — "The response `safe` field (full Safe configuration) is intentionally not modelled: nothing in the create flow needs it." A type-aware layout or an overview header may want it, and it would be free |
| Safe balances, aggregated with DAOs | **available**, `query/assets`, source `safe` |
| Safe transfers, aggregated | **available**, `query/transactions` |
| Safe owners as members | **available**, `query/members`, `role: owner`, `governance.type: 'safe'`, filterable by `governanceAddress` |
| Queued Safe transactions | **available in the proposals response's `pending` block, unmodelled.** Scope for directly-selected Safes is the open question |
| Executed Safe transaction history | **not in the workspace API.** Only the Safe transaction service has it (`getSafeTransactionHistory`), which means a client-side read per Safe — the thing the aggregation endpoints exist to avoid |
| A Safe's Aragon-side name/avatar | **never.** "The endpoint names DAOs only (`name: dao.name ?? null`) and returns no logo" — naming a Safe is what `IWorkspaceAccount.metadata` is for, which is why that field exists |
| A coverage flag that excludes `unverified` | **not available** — hence B2 |
| Safes discovered from `targets` | **not available.** Target-based account discovery is out of scope in v1; targets are opaque `{network, address}` pairs. This is the obvious way a user would *find* the Safes to add |

Local development note from `createWorkspace.md` that applies to all Safe work: "Safe accounts need
`aragon-gateway` running — without it every non-DAO address comes back `unavailable`."

## E. Merge and integration risk

Twelve files are touched by both this branch and `safe-biz-logic`:

```
assets/locales/en.json
modules/application/components/providers/providersDialogs.ts
modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage.tsx   (+ test)
modules/governance/pages/daoMembersPage/daoMembersPage.tsx
modules/governance/pages/daoMembersPage/daoMembersPageClient.tsx         (+ test)
shared/featureFlags/featureFlags.api.ts
shared/featureFlags/featureFlags.constants.ts
shared/hooks/useDaoPlugins/useDaoPlugins.ts
shared/utils/daoUtils/daoUtils.ts                                        (+ test)
```

The ones that are more than textual:

1. **`daoUtils.buildPluginUniqueId` → `getPluginTabId`** is a rename *with a behaviour change*. The workspace
   member list calls the old name twice. Mechanical, but silent if someone resolves the conflict by keeping both.
2. **`daoMembersPage` is restructured** around `daoMemberSourceUtils.resolve`, replacing `plugins[0]` with
   `memberSources[0]` and splitting `daoId` from `memberSource.daoId` for linked accounts. The workspace members
   pages delegate to this page, and the workspaces branch only added a TODO comment to it — so the conflict is
   trivial to resolve and the *semantics* need re-checking afterwards.
3. **`SelectPluginDialog` params**: the workspaces branch adds `onBack`, `app-1165` adds `allowNativeSafe` and
   renames `pluginId` → `uniqueId` on the row component. Same block, same file. Beyond the conflict:
   **`app-1165` excludes Safe plugins from the dialog unless `allowNativeSafe` is passed**, and the workspace
   proposal flow passes `variant: 'process'` without it — so a Safe process of a DAO account would be invisible in
   the workspace create-proposal flow even after everything else lands.
4. **`PluginInterfaceType.SAFE` does not exist on `main` or on this branch.** It arrives with the Safe branches.
   Until then `daoUtils.isSupportedPlugin` classifies a backend `safe` plugin as unsupported and
   `getDaoPlugins` filters it out — which is why no workspace tab builder has ever seen one. **The moment the
   enum member lands, Safe bodies start appearing in `useWorkspacePlugins` output, hence in workspace member and
   proposal tabs, unannounced.** Both hooks will then also want
   `daoUtils.getPluginName`'s Safe branch (`Safe 0x1234…abcd`), since the backend names no Safe.
5. **Flags are independent**: `workspaces` (here) and `safeAccountPage` (safe-biz-logic). Deciding whether Safe
   accounts in workspaces ride the `workspaces` flag, the `safeAccountPage` flag, or a third one is worth doing
   deliberately — `createWorkspace.md` already notes the registry must not ship on, and a Safe page that works
   outside workspaces has a different risk profile.
6. **No e2e coverage** for workspaces at all (`apps/app/e2e/tests/` holds only the support-chat smoke test), so
   the merge has unit tests as its only net.

Ordering: `safe-biz-logic` (#1397) lands before `app-1165` (#1437) — the latter builds on it. Whether either
lands before this branch changes which side absorbs the conflicts, not the total work.

## F. Suggested sequencing

Each step is independently shippable and leaves the feature coherent.

| # | Step | Why first |
| --- | --- | --- |
| 0 | **Answer the `pending` scope question** with the backend | It is the only thing that changes the shape of the proposals work, and it is one question |
| 1 | **Fix `coverage`/`partial`** — shared coverage policy, four call sites | Independent of everything else, fixes live misinformation, and the policy already exists in `useWorkspaceAssetListData` |
| 2 | **Make the gate type-aware** and move it into `LayoutWorkspaceAccount` | Unblocks every Safe page. The `notFound()`-over-error check is the only unknown |
| 3 | **Safe account overview** by delegating to `SafeAccountPage`, as the DAO branch delegates to `DaoDashboardPage` | Turns the first error state into a real page; highest visible payoff per line |
| 4 | **Safe members page + Safe row links**, reading `query/members` filtered to the Safe | The data is already there; grows `memberPageAccountIds` and closes the external-link degradation |
| 5 | **Make a Safe an account option** + the three per-type aside cards (assets, transactions, members) | Un-degrades the selector and the asides at once. Must land *with* the cards, and must handle the `DispatchPanel` `daoAddress` landmine |
| 6 | **Safe eligibility and transaction creation** (`useSafeInfo().owners`, a Safe create destination) | Independent of proposals; the write path |
| 7 | **Safe proposals** per the step-0 answer, plus a DAO-free details route | Largest and most design-dependent |
| 8 | **Route through `getPluginTabId`** in both workspace tab builders | Must happen before or with the Safe-branch merge, whenever that is |

Steps 1, 2 and 8 are worth doing even if Safe accounts slip: 1 fixes present-tense wrong information, 2 pays off
the TODO two files already carry, and 8 fixes a tab-ID disagreement that exists today.

## Open questions for the team

1. **Does the `pending` block of `query/proposals` cover a Safe passed directly in `accounts`?** (Blocks step 0.)
2. **What is a Safe account's "proposal"** — its whole queue, or only Aragon-correlated transactions? P1 vs P2
   above. This is a product question, not a technical one.
3. **Read-only or interactive?** `SafeAccountPage` was deliberately made read-only with signing kept in proposal
   context. Does a workspace Safe account keep that, or is "create a transaction from a Safe account" in scope?
4. **One flag or two?** Does Safe-in-workspace ride `workspaces`, `safeAccountPage`, or its own flag?
5. **Who owns a Safe's identity?** The backend names no Safe and returns no logo, so `metadata` is the only
   source. Is a Safe without owner-supplied metadata always shown as a truncated address, or is there appetite for
   reading the Safe app's own naming?
6. **Is target-based discovery coming?** It is the natural way a user finds the Safes to add, and
   `IWorkspaceTarget` exists for exactly that. Without it, adding a Safe means pasting an address.
7. **Should the `/dao/…` URL leak be closed as part of this** (`daoMembersPage`'s TODO), given Safe pages are new
   code that would otherwise inherit the same pattern?
