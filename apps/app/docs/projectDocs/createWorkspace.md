# Create workspace (v1)

Implementation plan for the workspace creation flow. Written to be picked up cold — every decision, file and
deviation is recorded here.

Background on the wider workspaces effort (Safe accounts, aggregated pages, registry options) lives in
`workspaces.md` on the `app-1096-outstanding-aragon-workspaces-questions` branch. That branch already ships a
`workspace` module with assets/transactions/members pages against a mocked registry. **This work branches off
`main` instead and builds the module from scratch**, so the two will need reconciling — see
[Relationship to branch 1096](#relationship-to-branch-1096).

## Scope

In scope:

- A `workspace` module under `src/modules/workspace/`.
- A `/create/workspace` wizard page modelled on `/create/dao`: workspace metadata, a list of targets, a list of
  accounts (each account with optional metadata).
- A mocked, `localStorage`-backed workspace registry.
- A `/workspace/{workspaceId}` overview page with the workspace layout and navigation.
- A CTA on the explore page.
- The whole feature behind the `workspaces` feature flag.

Out of scope (deliberate, deferred to follow-ups):

- An account `type` picker — the type is detected, not chosen.
- The other four workspace query endpoints (assets, transactions, proposals, members).
- Target-based account discovery.
- Editing and deleting workspaces.
- Per-account `links` / `nickname` metadata.
- A real registry (on-chain or off-chain authenticated) and any backend API.
- Server-side prefetching of workspaces.

## Data model

Domain types live in `src/modules/workspace/api/workspaceService/domain/`. They are deliberately kept
byte-compatible with branch 1096 apart from the addition called out below.

```ts
// workspace.ts
interface IWorkspace {
    id: string;                     // `workspaceId` URL parameter, slug of the name
    name: string;
    description: string;
    avatar: string | null;          // ipfs:// URI or null
    links: IResource[];             // `IResource` from @/shared/api/daoService
    accounts: IWorkspaceAccount[];
    targets: IWorkspaceTarget[];    //                                       (NEW vs 1096)
}

// workspaceAccount.ts
interface IWorkspaceAccount {
    id: string;                     // `${network}-${checksummedAddress}` — equals the backend daoId
    type: WorkspaceAccountType;     // always DAO in v1 (no UI field)
    address: string;
    network: Network;
    metadata?: {                    // omitted entirely when the user adds none
        name: string;
        description?: string;
        avatar?: string;            // ipfs:// URI
    };
}

// workspaceTarget.ts
interface IWorkspaceTarget {
    address: string;
    network: Network;
}

// enum/workspaceAccountType.ts
enum WorkspaceAccountType {
    DAO = 'DAO',
    SAFE = 'SAFE',
}
```

`type` has no form field: it is detected from the accounts API (see [Account resolution](#account-resolution)),
so stored objects satisfy `IWorkspaceAccount` and 1096's pages can consume them unchanged.

A target is an **opaque `{ network, address }` pair in v1** — no derived behaviour, no validation beyond address
format. The next phase is expected to scan targets for permissions/access control and offer the discovered
accounts for the user to add, which is why Targets is entered *before* Accounts in the wizard.

## Wizard

Route `/create/workspace`, three steps:

| Order | Step id    | Content                                                        |
| ----- | ---------- | -------------------------------------------------------------- |
| 0     | `METADATA` | name, avatar, description, resources                           |
| 1     | `TARGETS`  | repeatable `{ network, address }` rows, may be empty            |
| 2     | `ACCOUNTS` | repeatable `{ network, address, metadata? }` rows, optional |

Both flows render `WorkspaceWizard` (`components/workspaceWizard/`); `WorkspaceWizardStep` fixes the steps, and each
page passes its translation namespace, default values and submit action.

Metadata is step 0 because naming the thing first reads as a creation flow and leaves the first screen as a text
field rather than an address row. Targets precede Accounts for the discovery reason above.

### Form data

`src/modules/workspace/components/createWorkspaceForm/createWorkspaceFormDefinitions.ts`:

```ts
interface ICreateWorkspaceFormMetadataData {
    name: string;
    avatar?: IInputFileAvatarValue;
    description: string;
    resources: IResourcesInputResource[];
}

interface ICreateWorkspaceFormNetworkAddress {
    network: Network;
    address: string;
}

interface ICreateWorkspaceFormAccountMetadata {
    name: string;
    description: string;
    avatar?: IInputFileAvatarValue;
}

interface ICreateWorkspaceFormAccount extends ICreateWorkspaceFormNetworkAddress {
    metadata?: ICreateWorkspaceFormAccountMetadata;
}

interface ICreateWorkspaceFormData extends ICreateWorkspaceFormMetadataData {
    targets: ICreateWorkspaceFormNetworkAddress[];
    accounts: ICreateWorkspaceFormAccount[];
}
```

The metadata step is `createDaoFormMetadata` **minus the `ens` field** — a DAO has an ENS subdomain because it
registers one on-chain; a workspace has no contract and nothing to register. Everything else (`name` max 128,
`description` max 480 with `sanitizeMode: 'multiline'`, `AvatarInput`, `ResourcesInput`) is the same.

### Rows

Rows are a `useFieldArray` + `Card`-per-row structure modelled on `resourcesInput` / `resourcesInputItem`:
an "Add" button under the list, an overflow `Dropdown` per row with a remove action.

`AddressesInput` is intentionally **not** reused. It is typed to `ICompositeAddress[]` and its dedupe
(`addressesListUtils.checkIsAlreadyInList`) compares addresses only, which would wrongly reject the same address
on two different networks — a legitimate case, e.g. a Safe deployed at one address on several chains.

Each row has:

- `NetworkInput` — the new shared network dropdown (below).
- gov-ui-kit `AddressInput`, with `chainId={networkDefinitions[row.network].id}` so ENS resolution and the
  explorer link follow the row's own network.

Account rows additionally have a **collapsible metadata block** toggled by a button inside the card, revealing
`AvatarInput`, name and description. Local `useState` per row drives the toggle; collapsing clears the block via
`setValue(metadataFieldName, undefined)` so an untouched or cleared block stores no `metadata` key at all.
When any metadata field is filled, `metadata.name` is required (1096 types `name` as non-optional inside the
block).

### Validation

- Addresses: format (`addressUtils.isAddress` plus `AddressInput`'s ENS resolution), then — **for accounts only** —
  resolved against `POST /v2/workspaces/query/accounts` (see [Account resolution](#account-resolution)). Targets are
  arbitrary addresses and are never resolved.
- Duplicates: rejected on the `(network, address)` pair **within** a list. The same pair may appear as both a
  target and an account. Same address on different networks is legal.
- Changing a row's network re-triggers validation of that row's address field (`useFormContext().trigger`),
  otherwise a duplicate created by switching networks would slip through `mode: 'onTouched'`.
- Accounts and Targets are both optional. Accounts start with one removable row, Targets start empty.
- New rows default to `Network.ETHEREUM_SEPOLIA`, matching `createDaoFormNetwork`'s default.

## Shared `NetworkInput`

`src/shared/components/forms/networkInput/` — new peer of `avatarInput` / `resourcesInput` / `addressesInput`.

gov-ui-kit has **no** `Select`/`Combobox` component (form primitives are inputText/inputNumber/radio/checkbox/
textArea/inputFileAvatar + a `Dropdown` menu), so the dropdown is composed:

- `InputContainer` with `useCustomWrapper` for the label/helpText/alert, fed from `useFormField`.
- `Dropdown.Container` with a `customTrigger` button showing the selected network's logo, name and testnet/beta
  tag plus a chevron.
- One `Dropdown.Item` per network, `selected` on the active one.

Options are `networkUtils.getSupportedNetworks()` filtered by `!networkDefinitions[network].disabled` and sorted
by `networkDefinitions[network].order`. Testnets are included and tagged, because testnet DAOs such as
`ETHEREUM_SEPOLIA` ones must be addable through the form. No network sets
`disabled: true` today, so the filter is currently a no-op guard.

`onValueChange` is exposed so a consumer can re-trigger sibling validation.

## Submit

Submitting opens `WorkspaceDialogId.PUBLISH_WORKSPACE` with the form values (`WorkspaceWizard` tracks
`wizard_submit`).

### Ownership

Workspaces have no owner and need no wallet: a client-written owner would protect nothing while the registry is
local. Ownership belongs to the future registry, on publish.

`publishWorkspaceDialog` is **not** a `TransactionDialog` — there is no transaction. It is a plain gov-ui-kit
`Dialog.Header` / `Dialog.Content` / `Dialog.Footer` with local `status` state (`idle | pending | error |
success`), a summary of what is about to be created, an `AlertCard` + retry on error, and a link to the created
workspace on success.

Submit sequence:

1. Pin the workspace avatar file, if any, via `usePinFile` → CID.
2. Pin each account metadata avatar file, if any, via `usePinFile` → CIDs. This is why the flow lives in a
   dialog: it is N+1 pin calls, each of which can fail.
3. `publishWorkspaceDialogUtils.buildWorkspace()` maps form values to `Omit<IWorkspace, 'id'>` —
   `resources` → `links` (same rename `publishDaoDialogUtils.prepareMetadata` does), avatar files → `ipfs://`
   URIs via `ipfsUtils.cidToUri`, account ids via `workspaceUtils.buildAccountId`, `type: DAO`.
4. `useCreateWorkspace` → `workspaceService.createWorkspace`, which assigns the id and persists.
5. Success state links to `/workspace/{id}`.

Pinning works from the client because `usePinFile` wraps `pinFileAction`, a `'use server'` server action —
`NEXT_SECRET_IPFS_JWT` never reaches the browser.

## Registry

`workspaceService` is shaped like a normal service (async, rejects with `AragonBackendServiceError`) so swapping
local storage for real requests is a single-method change:

- `getWorkspace({ urlParams: { id } })` → the stored workspace; rejects with `notFoundCode` / 404 when absent.
- `getWorkspaceList()` → every stored workspace, read by the workspace switcher through `useWorkspaceList`. The
  publish dialog invalidates it after creating a workspace so the new one is listed straight away.
- `createWorkspace({ body })` where `body` is `Omit<IWorkspace, 'id'>` → assigns
  `workspaceUtils.buildWorkspaceId(name, existingIds)`, writes to `localStorage`, resolves with the full
  `IWorkspace`.
- `updateWorkspace({ urlParams: { id }, body })` where `body` is `Omit<IWorkspace, 'id'>` → replaces the
  stored workspace, keeping its ID (so its URLs keep working); rejects with
  `notFoundCode` / 404 when absent. Called by the publish dialog in update mode.

Storage key `aragon-workspaces`, value a `Record<string, IWorkspace>`. Every method rejects when called
server-side (`typeof window === 'undefined'`) rather than silently returning nothing.

The reads seed an empty "My workspace" when the registry is empty (`createWorkspace` does not). Its ID gets a random
suffix (`my-workspace-1a2b3c4d`) so that default workspaces of different users never share one. Unreadable storage
reads as empty and is overwritten by the seed — acceptable, as only outside tampering can produce it.

Ids are slugs: `workspaceUtils.buildWorkspaceId('Demo Workspace')` → `demo-workspace`, `demo-workspace-2` if
taken. Falls back to `workspace` when the name slugifies to nothing.

### Consequence: no server prefetch

`localStorage` is client-only, so the aggregated (`all/`) pages are thin `Page.Container` shells with **no**
`prefetchQuery`; their client components call `useWorkspace`, and `workspaceService` rejects when called on the
server. This diverges from the prefetch-then-hydrate pattern in `dataFetching.md` and is the one shape that can
work with a client-side registry. It reverts to the normal pattern when a real registry lands. Do not add a server
prefetch of anything that comes out of the registry while it is `localStorage`-backed — it will always miss and can
produce hydration mismatches.

**The account-scoped routes are the exception, and not one that breaks the rule.** They read nothing from the
registry: an account ID is a DAO ID, so `LayoutWorkspaceAccount` resolves the DAO straight from the path. The
*workspace* still cannot be prefetched; the *account* always can.

## Routes and layouts

`src/app/create/layout.tsx` currently applies `LayoutWizardCreateDao` to everything under `/create`, and that
component hardcodes `name="app.governance.layoutWizardCreateDao.name"` → **"Create DAO"**. Reusing it as-is
would put "Create DAO" in the workspace wizard header, and a nested layout would double-wrap `LayoutWizard`.

So the layout moves down one level, one thin wrapper per flow:

- **delete** `src/app/create/layout.tsx`
- **add** `src/modules/application/components/layouts/layoutWorkspace/{layoutWorkspace.tsx,index.ts}
src/modules/application/components/navigations/navigationWorkspace/{navigationWorkspace.tsx,navigationWorkspaceUtils.ts,index.ts}
src/app/create/dao/layout.tsx` → existing `LayoutWizardCreateDao`
- **add** `src/app/create/workspace/layout.tsx` → new `LayoutWizardCreateWorkspace`
  (`src/modules/workspace/components/layoutWizardCreateWorkspace/`, same body as `LayoutWizardCreateDao` with
  `name="app.workspace.layoutWizardCreateWorkspace.name"`)
- **add** `src/app/create/workspace/page.tsx` → `CreateWorkspacePage`
- **add** the workspace route tree, every section scoped to an account:

```
src/app/workspace/[workspaceId]/
├─ (workspacePage)/           route group: every page with the workspace navigation
│  ├─ layout.tsx              LayoutWorkspace (WorkspaceGate + navigation)
│  ├─ not-found.tsx           NotFoundBase, so a 404 keeps the workspace navigation
│  ├─ all/
│  │  ├─ {overview,proposals,assets,transactions,members}/page.tsx
│  │  └─ [...section]/page.tsx   WorkspaceSectionNotFoundPage
│  └─ [accountId]/
│     ├─ layout.tsx           LayoutWorkspaceAccount (DAO + overrides prefetch)
│     ├─ overview/page.tsx    WorkspaceAccountOverviewPage (the DAO dashboard)
│     ├─ assets/page.tsx      WorkspaceAssetsPage, the same page the aggregated route renders
│     ├─ transactions/page.tsx   WorkspaceTransactionsPage, likewise the aggregated route's own page
│     ├─ proposals/page.tsx   WorkspaceProposalsPage, likewise
│     ├─ proposals/[proposalSlug]/page.tsx   WorkspaceProposalDetailsPage, the DAO details page reused
│     ├─ members/page.tsx     WorkspaceAccountMembersPage
│     └─ [...section]/page.tsx   WorkspaceSectionNotFoundPage
└─ edit/                      the edit wizard, outside the group (static, wins over [accountId])
   ├─ layout.tsx              LayoutWizardEditWorkspace
   └─ page.tsx                WorkspaceEditPage
```

The route group, as with `(daoPage)`, only decides the layout: `edit/` sits outside it to get the wizard layout.

Each scope needs its own `[...section]` catch-all — `all/` is a static segment holding real pages, so a miss below
it never falls through to the account-scoped one — and both re-export the same page, so the two 404 identically.
A real section page wins over the catch-all, being more specific, which is all it takes to add a section.

The `all/` directory is static and sits beside the dynamic `[accountId]/`. Next resolves static segments first, so
each gets its own route file, its own RSC and its own prefetch behaviour — which is what lets the account tree
prefetch a DAO while the aggregate tree does not try to.

`LayoutWizard` is an async server component that resolves a DAO from `params` when present; with no params it
just renders `NavigationWizard` with no DAO, which is what both create flows want.

## Workspace layout

`/workspace/{workspaceId}` is wrapped by `LayoutWorkspace`
(`src/modules/application/components/layouts/layoutWorkspace/`), adapted from the same file on branch 1096. Three
differences, all forced by this branch:

| 1096 | Here |
| --- | --- |
| Server component: `fetchQuery` for the workspace, `prefetchQuery` per account DAO, `HydrationBoundary` | Fetches nothing. The registry is local storage, unreadable during a server render, so there is no query to hydrate |
| `Page.Error` when the workspace lookup fails | No lookup to fail here; the page renders the not-found empty state itself |
| `NavigationWorkspace` receives the resolved `workspace` | Receives the `workspaceId` and resolves the workspace itself with `useWorkspace` on the client |

`src/app/workspace/[workspaceId]/layout.tsx` is byte-identical to 1096's, so it merges cleanly — the divergence is
contained in the layout component. When a real registry lands, the fetch/hydrate shape of 1096 becomes correct
again and this layout should adopt it.

`navigationWorkspaceUtils.buildLinks` builds every link through `workspaceUtils.getAccountScopeUrl`, scoped to the
account on the route, at orders 100-500: Overview, Proposals, Members, Assets, Transactions. It lists them all,
including the ones that have no account-scoped route yet — so under an account scope those links lead to the
section-not-found page until the route lands.

### Assets page

`workspaceAssetsPage` mirrors `daoAssetsPage`: `Page.Main` with the asset list, plus an aside. **One page serves
both scopes** — `/workspace/{workspaceId}/all/assets` and `/workspace/{workspaceId}/{accountId}/assets` — unlike
the account overview, which renders `DaoDashboardPage` as is. Delegating to the DAO assets page would read the DAO
finance API instead, which breaks the invariant below and has nothing to show for a Safe.

For the same reason **`WorkspaceAccountGate` is deliberately not applied here**. The gate exists for pages that are
DAO pages and therefore assume a resolved DAO; it resolves the DAO with `fetchQuery`, which throws, so wrapping the
assets page would replace a Safe asset list that renders — whatever the endpoint puts in it — with an error state
or a placeholder. `LayoutWorkspaceAccount` says the same thing from the other side: assets and transactions "work
from the workspace query endpoints regardless", which is a claim about the page's data path and not about what
comes back for a Safe (see [the Safe aggregation gap](#known-gaps)). The gate only reads the DAO; the Safe lookup
belongs to the members routes, which run `workspaceAccountInfoUtils.getAccountInfo` before the gate and fall back
to the DAO path when it fails. Neither ever sees these two routes, so they cost them no extra request.

**Every scope reads `POST /v2/workspaces/query/assets`** through `WorkspaceAssetList` — the aggregated one over all
accounts, an account over just that one. The page only decides which accounts to send:

```ts
const { activeOption } = useWorkspaceAccountOptions();
const displayedAccounts = activeOption?.account != null ? [activeOption.account] : accounts;
```

Going through one endpoint throughout keeps the single accounts summing to the aggregated view, since both come out
of the same aggregation. Option labels use the same precedence as the overview rows — `metadata.name ?? accounts-API
name ?? truncated address` — so an option and its row never disagree.

Two properties of that lookup are load-bearing:

- **`useWorkspaceAccountOptions` is the single resolver of the route's account.** Every account type is an option,
  so `activeOption` is the answer to "which account is this page about" and no page keeps a lookup of its own. It
  resolves through `workspaceUtils.findAccountById`, which matches on network and address rather than on the ID
  string, because a stored ID is checksummed while a URL may carry any casing. The assets, transactions and
  proposals pages used to resolve the route themselves precisely because the option could not be trusted for that;
  the blind spot is now closed in the one place instead of three.
- **Anything the lookup does not resolve reads as every account**: the aggregated segment, and — until viewing one
  is supported — an account the workspace does not hold.

A workspace holding no account keeps the query disabled, and a disabled query reads as pending, so
`WorkspaceAssetList` resolves the state itself rather than leaving the list on skeletons forever.
`WorkspaceTransactionList` carries the same guard.

**Every account can be selected, a Safe included.** The aggregated option still covers every account and each
account has an option of its own. The Safe's list and totals come from the same endpoint as a DAO's, which is a
different thing from them being populated: see [the Safe aggregation gap](#known-gaps).

#### Transactions page

`workspaceTransactionsPage` is the assets page's twin: one page for both scopes, no gate, one endpoint
(`query/transactions`), the account from `useWorkspaceAccountOptions`. Its aside card follows the same rule as the
assets one: a selected DAO gets the DAO card, and anything else — the aggregated scope or a Safe — gets
`WorkspaceAllTransactionsAsideCard`, titled by the option's label when one is selected. The Safe write path is
closed by construction rather than by a check at the edge: a Safe has no create destination (`getDaoUrl` cannot name
one), so its row in the select-account dialog is dimmed and picking it navigates nowhere. `DispatchPanel` takes the account address as
a *DAO* address, so it renders only beside a DAO card; tests pin all of this, as the next person to touch a
Safe branch will be tempted to open it.

### Account scope

**The path says what you are looking at; the query string says how.** The account a page shows is therefore a path
segment, not a parameter:

| Route | Shows |
| --- | --- |
| `/workspace/{workspaceId}/all/{section}` | every account of the workspace, aggregated |
| `/workspace/{workspaceId}/{accountId}/{section}` | one account |

The account segment is always filled — by an account ID or by the `all` sentinel
(`workspaceUtils.workspaceAllAccountsSegment`). It cannot collide with an account ID, which is always
`{network}-{address}`. URLs are built only through `workspaceUtils.getAccountScopeUrl`. Three redirects fill in the
segments a URL is missing (`next.config.mjs`): `/workspace/{workspaceId}` opens `all/overview`; a section with no
account in front of it — the shape these URLs had before the account moved onto the path — opens the same section
under `all`; and an account scope with no section, `all` included, opens the overview of that account. The account
rule matches the account segment **on its shape**, so that a section is never read as an account and sent on to a
second redirect. All three are temporary (307): a permanent one is cached by the browser, which would go on
resolving URLs against a shape the app no longer serves.

The account scopes the path **before** the section, mirroring `/dao/{network}/{addressOrEns}/{section}`, so that
everything below one account shares a scope. That is what lets `LayoutWorkspaceAccount` fetch the account's DAO
once and hydrate it for every section below, the way `LayoutDao` does for the DAO pages — an account ID *is* a DAO
ID, so the server resolves it without reading the registry. Both its reads use `prefetchQuery`, which resolves
rather than throws: a workspace holds Safes as well as DAOs, and a Safe has no DAO.

Why not a parameter: the selection used to live on `?account=`, moved with `history.replaceState`. That never
re-runs the server component, so the account was invisible to the server and nothing about an account-scoped page
could be prefetched. It also could not express an account the workspace does not hold — `?account=X` asserts *"the
selected option is X"*, and there is no honest value for it when X is not an option.

Two pieces replace the old provider:

- **`WorkspaceGate`**, in `LayoutWorkspace`, owns the workspace loading lifecycle — a spinner while it loads, an
  error when it fails — so every page below can assume a loaded workspace.
- **`useWorkspaceAccountOptions`** returns the options to switch to plus the `accountId` from the route, read with
  `useParams()`. It is a hook and not a context because both of its reads go through React Query, whose cache
  already shares them. Note `activeOption` may be undefined while `accountId` is set: what is being *looked at* is
  not the same question as what can be *switched to*.

Every account becomes an option, a Safe included. `activeOption` is resolved from the route through
`workspaceUtils.findAccountById`, so a lowercased address on a shared link still lands on its account instead of
widening the page to the whole workspace under a URL naming one. The selector renders a Safe like the overview rows
do: `metadata.avatar`, falling back to the Safe wallet logo, with `metadata.name ?? accounts-API name ?? truncated
address` as its label. Its DAO branch reaches the same precedence by another route: `useWorkspaceDaos` resolves
`metadata.avatar ?? dao.avatar` into every DAO it returns, so both branches prefer the owner's chosen avatar and
fall back — a Safe to the wallet logo, a DAO to its own. The Safe branch exists only because a Safe has no DAO to
carry its metadata.

`WorkspaceSelector`, the workspace avatar pill, switches workspace: a dropdown of every stored workspace plus a
"Create workspace" item. Picking one opens its aggregated overview, since account IDs belong to the previous
workspace. The pill used to open the navigation dialog, so the dialog now opens from the menu button, placed first
in the bar and visible at every width.

The aside is `WorkspaceAssetsAsideCard`, a router over one card per account type: `WorkspaceDaoAssetsAsideCard` for
a DAO account and `WorkspaceAllAssetsAsideCard` for the aggregated scope and for anything without a card of its
own. A Safe is the second case: it gets the totals card, **titled by the option's label** so that the card names the
Safe it describes. This is a deliberate stand-in rather than a missing branch — the card sums the response, which is
what a Safe card would do anyway; a per-type card is worth writing only once a Safe has something of its own to
say.

`WorkspaceAllAssetsAsideCard` is fed `totalAmountUsd`, `totalRecords` and `spamCount` from the response for the
selected accounts; it shares its query key with the list, so the totals cost no extra request.
`WorkspaceDaoAssetsAsideCard` reads the DAO (an account ID *is* the DAO ID, so the query is the DAO pages' own) and
hands it to `DaoFilterAsideCard` with a synthesised `isParent: true` option, i.e. a selected DAO shows the DAO assets
page's card. Two consequences to keep in mind:

- its content is **gated by the `linkedAccount` flag** (`defaultValue: false`, `local: true`), exactly as on the
  DAO page: enabled it shows the description, the stats it is handed, the chain/address list and the Octav link;
  disabled `DaoInfoAside` falls back to `FinanceDetailsList` and drops the stats. Inherited behaviour, not
  introduced here.
- its total value comes from `dao.metrics.tvlUSD`, an indexed DAO metric, while the aggregated card sums
  `totalAmountUsd` over the returned selection. Different quantities, so a selected DAO and the aggregated view can
  legitimately disagree; only the token count comes from the same aggregation on both.

The rows **reuse `AssetListItem` unchanged**: the backend projects the same nested `token` (network and address
included), so a workspace asset satisfies `IAsset`. `allocations` is modelled but unused — with a DAO
account selected "which account holds this" is already answered by the selection.

Two details that do not transfer from the DAO page:

- `getNextPageParam` must bump **`body.pagination.page`**; the inherited `AragonBackendService.getNextPageParams`
  only knows `queryParams`, so `workspaceQueryService.getNextBodyPageParams` replaces it. It is generic over the
  response and params, so every workspace list endpoint can reuse it.
- `useAssetListData` is DAO-specific (it hardcodes `useAssetList` and reads `queryParams.pageSize`), so the
  aggregated list has its own `useWorkspaceAssetListData`. The amount/`priceUsd` derivation both need was extracted
  into `finance/utils/assetUtils.normalizeAsset`, so the two views cannot show a different price for one token.

#### Coverage

The rule lives in `workspaceCoverageUtils` and is shared by every list that reads coverage, because the blunt
`partial` flag cannot tell a failed read from a Safe: three questions, three predicates.

| Predicate | True for | Drives |
| --- | --- | --- |
| `hasUnreadableAccounts` | `unavailable` | "this list is incomplete" warnings |
| `hasIncompleteCount` | `unavailable` or `partial` | the `N+` lower bound on a count |
| `getUnreadableAccounts` | the `unavailable` entries | the count in the warning's copy |

`unverified` triggers none of them. It is the permanent state of every non-indexed account (so every Safe) and says
the history is not guaranteed complete, not that something was left unread; warning about it would leave the banner
on forever and teach readers to ignore it. `unsupported` triggers none either. The assets list, the transactions
list and the aggregated transactions aside card apply it. **The three members call sites still read `partial`**
(the list's warning, the aside's `N+`, and the member-details redirect guard). Safe owners do reach the members
endpoint, and sandbox returned `partial: false` for the Safe checked (2026-10-28, sandbox only). Moving these call
sites to the narrower predicates is open.

`coverage` is surfaced as an `AlertCard` above the list when an account is unreadable — an actual failed read — and
the empty state then says the assets could not be loaded rather than that there are none.

An account scope gets its own copy (`unavailable.descriptionSingle`): the scope *is* the account, so counting
"1 of the accounts could not be read" would only raise the question of which one.

Nothing is prefetched: the asset queries need the account list, which only exists in the local-storage registry.

### Proposals page

`/workspace/{workspaceId}/all/proposals` and `/workspace/{workspaceId}/{accountId}/proposals` are one page,
`workspaceProposalsPage`, as on the assets and transactions pages. **Only DAO accounts take part** — Safes have no
indexed proposals. The aggregated route therefore sends only the DAO accounts, and an account scope naming a Safe
renders the [not-available placeholder](#safe-sections-the-placeholder) and issues no proposal request. It used to
fall back to every DAO account, which answered a question about one Safe with the proposals of every other
account under a URL naming it.

Every scope reads `POST /v2/workspaces/query/proposals` through `workspaceQueryService.getProposalList`, so an
account sums into the aggregated view. `DaoProposalList` is deliberately **not** reused for an account scope, as an
earlier draft of this page did: the process strip is rebuilt on the workspace endpoint by
`useWorkspaceProposalTabs`, which is what lets one component serve both scopes. Two filters of the DAO page's list
have no equivalent on the workspace endpoint and are therefore gone from the group tab: `onlyActive` (which means
*only currently installed plugins*, not *active proposals*) and `includeLinkedAccounts` — the account scope is
explicit and never expands a DAO into its linked accounts.

#### The scope

`workspaceProposalsPageClient` reads `activeOption`, which resolves the route's account by network and address and
so accepts any casing, as `LayoutWorkspaceAccount` does. Only a DAO account becomes the scope; a Safe is caught
before the content renders (the placeholder above), so the DAO narrowing below is never asked about one.

Four questions look like one and are not. Keeping them apart is what the predicates below are for:

| Question | Predicate | Where |
| --- | --- | --- |
| Would the row tag and the tab label repeat themselves? | one account contributing them | `workspaceProposalListDefault`, `useWorkspaceProposalTabs`, `workspaceMemberList` |
| How does the page present itself in its empty and error copy? | the route names an account (`isAccountScoped`) | `useWorkspaceProposalListData` |
| What does the aside card describe? | the process the list is narrowed to, else the scope | `useWorkspaceProposalTabs`, `workspaceProposalsAsideCard` |
| Is there exactly one DAO to subscribe to? | the DAO of a selected process, else the only account in view | `workspaceProposalsPageClient` |

Only the second one is a question about the route. The aside is a question about the **list**: it describes what
is on screen, which is why a route naming no account can still be described by a process card.

A workspace holding a single DAO is where they come apart: on its aggregated route the rows are untagged and the
tabs unlabelled, because repeating one name on every row says nothing; the copy still speaks of the workspace,
because that is the route the reader is on, while the aside describes the lone process the list has narrowed
itself to; and the Telegram card does appear, because there is exactly one DAO in view to subscribe to.

#### Tabs

`useWorkspaceProposalTabs` builds one tab per visible process of every account in view, grouped by account. The
list renders the strip and the page hands the selected tab to the aside card, so both come from one derivation.
The hook reads `useSearchParams` directly rather than going through `useFilterUrlParam`, which would keep a copy of
the selection in state: every reader is then a pure function of the URL and the accounts, and two of them cannot
come to name different tabs. The `PluginFilterComponent` of the list is the single writer of `?proposals=`, and an
unknown parameter resolves to no tab, which is what the group tab stands for.

The strip needs more than one process **and** the CMS overrides, since a tab offered before they land may be one
the CMS hides. Below two processes there is no strip at all: the unfiltered list already shows only that process's
proposals.

With no strip there is still a selection to report, and **what the list has narrowed itself to decides it** —
one account in view holding one process. The list then *is* that process, so `activeTab` is it and the aside
shows `WorkspaceProcessProposalsAsideCard`. This is the DAO page's own rule: `useDaoPlugins` adds its group
filter only above one plugin, so a single-process DAO lands on that process and gets `DaoPluginInfo` on its
aside. The card kind therefore depends on the process count, there as here.

It follows that the aside can describe a process under a route that names none — the aggregated route of a
workspace holding a single DAO, and, before the Safe placeholder existed, that workspace's Safe route, which fell back to the same lone DAO. The aggregated route shows
exactly that process's proposals, so the card is accurate about what is on screen, which is the only thing it
claims to be. Across several accounts the list keeps aggregating all of them unfiltered, so a lone visible process
would describe only part of the screen: `activeTab` stays undefined there and the scope's own card stands.

That only holds while the single account in view holds the single process. Across several accounts the list keeps
aggregating all of them unfiltered, so one visible process describes only part of what is on screen and the
aggregated card stands instead. `useWorkspaceMemberTabs` needs no such guard: a lone body earns a strip as soon as
another account contributes members, so reaching its no-strip branch already means one account and one body.

Three decisions worth keeping:

- **The embedded `dao` is not an `IDao`.** The backend's `daoInfo` projection carries only `{ address, name,
  description, avatar, links }` — **no `plugins`** — and `proposalUtils.getProposalSlug` resolves the plugin out of
  `dao.plugins` to build a slug, without which `getProposalUrl` returns `undefined`. So the embedded metadata names
  a row (via the `tag` prop) while `useWorkspaceDaos` reads the real DAOs with `useQueries` to make rows linkable.
- **Rows wait for those DAOs.** `useWorkspaceProposalListData` forces `initialLoading` while any DAO read is
  pending, because `getDisplayTitle` falls back to the slug: rendering early would show an untitled proposal blank
  and then pop in, with links appearing late. A DAO that fails to read drops its rows rather than half-rendering.
- **`pending` and `coverage` are not modelled.** `pending` is the queued-Safe-transaction block (per the client's doc comments, never observed), which this page
  does not show. And with DAO-only accounts the backend hardcodes every selected account's coverage to `available`
  — the only entries that can report a problem describe process Safes, i.e. exactly the `pending` data that is not
  displayed. Warning on `partial` would flag data the user cannot see. `metadata.totalRecords` counts `data` only,
  so pagination stays correct without them.

#### Aside

`WorkspaceProposalsAsideCard` dispatches over three cards, and a **selected process wins over the scope** — the
same swap `daoProposalsPageClient` makes between `ProposalListStats` and `DaoPluginInfo`. It applies under either
scope, since a process tab names one account whether or not the route does:

- `WorkspaceProcessProposalsAsideCard` — a process is selected. `DaoPluginInfo` on the tab's account, which is
  already a DAO ID.
- `WorkspaceDaoProposalsAsideCard` — the route names a DAO account and more than one process is in view. The DAO
  page's `ProposalListStats`, read off
  the DAO's own endpoints, which is where the stats the aggregated card has to omit come from. It costs two
  requests of its own, so an account scope makes three proposal requests where the DAO page makes two: there the
  stats share the list's query key, which cannot happen across two endpoints. It runs **without** `onlyActive`,
  unlike the DAO page's group tab — the workspace endpoint has no such filter, so asking for it would make the
  total read lower than the rows the list pages through beside it.
- `WorkspaceAllProposalsAsideCard` — anything else, as long as no process is selected:
  with one DAO in view holding one process, the bullet above wins even here, the list being that process. Total,
  DAO count and most recent, all free from the response it shares with the list. "Executed" is omitted there: it
  needs a second full request, which per the client's doc comments also re-triggers the backend's Safe-queue reads
  — that second cost is asserted from those comments and never observed, like the `pending` block it belongs to,
  but the request itself is reason enough.

`TelegramSubscriptionCard` sits below the card whenever exactly one DAO is in view, since a subscription is bound
to a single DAO.

The "New proposal" action asks for the account first (`WorkspaceSelectAccountDialog`) and then for the process
(`SelectPluginDialog`), skipping the account step when the route has already named one — the plugin dialog is then
not stacked and offers no back action, there being nothing underneath to go back to. Creating a proposal stays a
single-DAO act: the per-DAO permission check runs through one `usePermissionCheckGuard` instance whose `check` is
called with the DAO and plugin of the selection, and the flow then hands over to that DAO's own create page.

#### Details page

`/workspace/{workspaceId}/{accountId}/proposals/{proposalSlug}` is `WorkspaceProposalDetailsPage`, which renders
`DaoProposalDetailsPage` unchanged behind `WorkspaceAccountGate` and only adapts the route parameters — the same
shape `WorkspaceAccountMemberDetailsPage` uses. The adaptation is free: `resolveDaoId` returns
`` `${network}-${addressOrEns}` `` for a plain address with no request, so the two halves `parseDaoId` splits out of
`accountId` reconstruct that same `accountId`.

Metadata is adapted rather than dropped. `generateProposalMetadata` cannot be re-exported as it stands — it
destructures `{ proposalSlug, addressOrEns, network }`, which this route does not carry — so
`workspaceMetadataUtils.generateProposalMetadata` parses `accountId` and delegates. It sits in
`modules/workspace/utils/workspaceMetadataUtils/`, beside the module's other utils and matching
`governanceMetadataUtils`, rather than in the route file: no `page.tsx` here is tested, and this adaptation is
worth covering. Its card names the DAO rather than the workspace, which is correct: a proposal lives on the DAO.

It carries the `workspaces` flag gate of its own. Next resolves metadata independently of the page, so the page's
`notFound()` does not stop it: without the gate a probe of the URL would read the proposal and the DAO from the
backend for a feature that does not exist yet, and could title the 404 document with a real proposal.

Both proposals lists link into it. `workspaceProposalListDefault` builds
``workspaceUtils.getAccountScopeUrl(workspaceId, accountId, `proposals/${slug}`)`` per row and passes it as the
`href` of `DaoProposalListDefaultItem` / `SppProposalListItem`, which default to `proposalUtils.getProposalUrl` so
the DAO pages are unaffected. The account comes from the proposal's own DAO, so a row of the aggregated list enters
the scope of the account it belongs to rather than staying under `all`. A proposal whose plugin cannot be resolved
has no slug, so it gets no href and the row renders unlinked.

### Safe support by route

Every route is meant to grow a Safe counterpart. Until one exists, the route **fails** rather than standing in for
the account with a placeholder or with another account's data: `WorkspaceAccountGate` renders its error state, and
that is the deliberate answer, not an oversight. This table is the list — update it in the same change that adds or
removes support.

Flipping a row to **implemented** is not only a new branch; it also means retiring whatever makes that route fail
today, and the two differ by route:

- **overview, proposal details** — the gate stays. It guards the DAO branch, which still
  needs a DAO record. What changes is that the page gains a Safe branch *before* the gate, as the two members routes
  already did.
- **`/{accountId}/proposals`** — the gate wrap in `WorkspaceProposalsPage` must be **deleted**, together with the
  DAO-only narrowing in `workspaceProposalsPageClient`. Both halves in one change: removing the gate alone sends the
  route back to answering for a Safe with every DAO account's proposals, and changing the narrowing alone leaves a
  gate failing a route that works. Both sites are marked `TEMPORARY` in the code.

| Route | Safe support | What a Safe gets today |
| --- | --- | --- |
| `/{workspaceId}/all/assets` | **implemented** | included in the selection, as any account is |
| `/{workspaceId}/all/transactions` | **implemented** | included in the selection |
| `/{workspaceId}/all/members` | **implemented** | Safe owners are in the list (verified on sandbox, 2026-10-28; see Known gaps) |
| `/{workspaceId}/all/proposals` | not yet | excluded from the request; the aggregated list shows DAO proposals only |
| `/{workspaceId}/all/overview` | **implemented** | the workspace overview lists accounts of both types |
| `/{accountId}/assets` | **implemented** | the list and the aside card describe the Safe |
| `/{accountId}/transactions` | **implemented**, read-only | the list and the aside card describe the Safe; no create action, and the dispatch panel is DAO-only |
| `/{accountId}/overview` | not yet | the gate's error state |
| `/{accountId}/members` | **implemented** | the Safe's owners, with its settings in the aside |
| `/{accountId}/members/{address}` | **implemented** (redirect) | a redirect to the Safe's members page |
| `/{accountId}/proposals` | not yet | the gate's error state |
| `/{accountId}/proposals/{proposalSlug}` | not yet | the gate's error state |

Two consequences worth stating, because both are deliberate:

- **A Safe is a selectable account option on every section**, so the selector can lead a reader to a route that
  fails. That is preferred over hiding the option per section: the account exists, and a failure says so plainly
  while a missing option says nothing at all.
- **`/{accountId}/proposals` is gated even though the page needs no DAO.** The aggregated proposals page is shared
  by both scopes and narrows to DAO accounts, so for a Safe it would answer a URL naming one account with the
  proposals of every DAO account of the workspace — the narrowing fails open. `WorkspaceProposalsPage` therefore
  wraps its own account-scoped route in the gate, telling the two apart by whether Next.js passed an `accountId`
  (the aggregated route's `all` is a static segment, so it passes none). The aggregated sentinel is treated as "no
  account" as well, so that removing `all/proposals/page.tsx` — which would let the aggregated URL fall through to
  `[accountId]/proposals` carrying `all` — degrades to the ungated page instead of gating on a DAO named `all`. The
  aggregated route stays ungated either way: it names no account, so there is nothing to resolve and nothing to
  mislead about.

`WorkspaceAccountGate` itself asks nothing about the account type. It reads the DAO record and renders the error
state when that read fails, which is exactly the set of accounts these pages cannot serve — a Safe among them, on the
routes whose Safe branch (which runs before the gate) does not exist yet. It
is **not** merged into `LayoutWorkspaceAccount`, which carried a TODO to do so: a layout cannot withhold a page,
because layout and page render in parallel, so a page's `notFound()` — `DaoMembersPage` raises one for the DAO a
Safe lacks — unwinds to `app/workspace/[workspaceId]/not-found.tsx`, which sits above `[accountId]` and discards
the layout's output along with the page's. Its doc comment records the reasoning where the next reader will look.

The Safe branch of the members routes reads the account through `workspaceAccountInfoUtils.getAccountInfo`, a
`query/accounts` lookup made once per request; the gate adds no lookup of its own. It is not memoised (a POST is not
the way the DAO GET is), so a second caller in the same request — a gate lifted above the page, say — should wrap it
in React `cache` rather than ask twice. A failed or throwing lookup falls back to the DAO path, gate included. Assets and transactions make no such request.

### Members page

`/workspace/{workspaceId}/all/members` is the aggregated route; the account-scoped one renders this page for a Safe
account, narrowed to that account, and the DAO members page (`WorkspaceAccountMembersPage`) otherwise, an account ID
being a DAO ID. The accounts in view are all of them, not just the DAOs, since Safe accounts take part here, unlike
proposals, their owners being members of the workspace. That premise is **verified on sandbox, 2026-10-28**:
`query/members` returns the owners of a Safe account with `source: "safe"`. Sandbox only, like the other findings.

`useWorkspaceMemberTabs` is the counterpart of `useWorkspaceProposalTabs` and follows the same rules: one tab per
visible body of every account and one per Safe account, read by the list that renders the strip and by the page that hands the selected tab
to the aside, derived from the URL alone so no two readers can disagree, with the list's `PluginFilterComponent`
the single writer of `?members=`. A Safe account's tab ID is `${network}-${daoUtils.getPluginTabId(...)}`, like a
body's, so a Safe that is only a body has one tab and a Safe that is also an account has two. Sub-plugins are included, as `DaoMemberListContainer` does: a body nested in a
process holds members of its own. The strip's threshold differs from the proposals one — a single body earns a
strip when another account contributes members without a tab (an unreadable DAO or one whose bodies are all
hidden), because the group tab then shows more than the lone body tab does.

`WorkspaceMembersAsideCard` dispatches like its proposals equivalent on the active tab's `kind`, a selected tab winning
over the aggregate:

- `WorkspaceSafeMembersAsideCard` — a Safe account tab. `SafeSettingsDetails`: the Safe (address, Safe app link,
  version), Threshold and Current nonce rows of the Safe body card, with no stats, description or Octav link.
- `WorkspaceBodyMembersAsideCard` — a body is selected, or a single body covers the whole list. The
  `SETTINGS_PLUGIN_INFO` slot of the tab's body, with `DaoPluginInfo` (`type=BODY`, on the tab's account) as the
  fallback, the swap `daoMembersPageClient` makes. That page also renders a `GOVERNANCE_MEMBER_PANEL` slot component below the
  card; it is left out here, those panels being plugin-specific and written for the DAO page's own context.
- `WorkspaceAllMembersAsideCard` — anything else. Total and account count, out of the response it shares with the
  list. The total reads as a lower bound (`12+`) when the response is `partial`, since an unread account's members
  are missing from it and the list flags the same gap.

#### Safe member details

A Safe account's members page lists its owners only, and a DAO holding the Safe as a body lists the same owners under
that body's tab. The two link differently, by decision:

- **Owner of a Safe account** — links to the block explorer, as `SafeOwnerList` on `/safe/{network}/{address}`
  does, and so do the Safe-only rows of the aggregated page, which already did. There is no in-app details page for
  a Safe owner: `DaoMemberDetailsPage` reads a DAO and reports body-scoped data (voting power, delegations, votes,
  proposals) that a standalone Safe does not have. `/{accountId}/members/{address}` on a Safe redirects to its
  members page.
- **Member of a Safe body of a DAO** — opens `DaoMemberDetailsPage` on that body, like a member of any other body.
  Member links name the body by its tab ID (`getPluginTabId`), the only body ID on the member routes.

**Later:** a Safe owner may get an in-app page, either a dedicated Safe member page or `DaoMemberDetailsPage` made
agnostic of the account type (DAO or Safe), keeping only the sections that apply to the account. Either one would
replace the explorer links of the Safe account members page and of the Safe-only rows of the aggregated page.

### Overview page

`workspaceDetailsPageClient` composes the standard page primitives, matching the DAO pages:

- `Page.Header` — workspace avatar, name, description and `stats` for the account and target counts.
- `Page.Main` → `Page.MainSection` for Accounts, and for Targets only when the workspace has any.
- `Page.Aside` → `Page.AsideCard` for the workspace resources, when present.

Each account renders as a `WorkspaceAccountItem`. The **type tag comes from the registry**, not from a lookup: it
was resolved at creation time and decides which APIs the workspace pages query, so the row keeps showing it even
when the lookup fails. Names are resolved with one batched `useWorkspaceAccounts` call, because the registry does
not store the DAO name — and the account metadata name wins over it, being what the workspace owner chose to call
the account.

## Edit workspace

`/workspace/{workspaceId}/edit` renders `WorkspaceWizard` under `LayoutWizardEditWorkspace`, from the workspace
selector or the empty-accounts state of the overview.

- Outside `(workspacePage)`, so it renders its own `WorkspaceGate`; the wizard reads its default values
  (`workspaceEditPageUtils.buildFormValues`) on mount.
- Submitting opens `PublishWorkspaceDialog` with a `workspaceId`. A stored avatar comes back as a URL with no file
  and keeps its URI instead of being pinned again.
- `?step=ACCOUNTS` opens a given step (`workspaceUtils.getWorkspaceEditUrl` / `parseWorkspaceEditStep`).

## Feature flag

The whole feature sits behind the `workspaces` flag (`src/shared/featureFlags/featureFlags.constants.ts`, key
added to `FeatureFlagKey` in `featureFlags.api.ts`). Enabled in `local` only; `false` by default, so preview,
development, staging and production are off — the registry is a `localStorage` mock, so it must not ship on, and
preview points at the development backend, which has no workspace endpoints yet.

Every route gate is the same server-side check — `await featureFlags.isEnabled('workspaces')`, else `notFound()`:

| Entry point | Gate |
| --- | --- |
| `/create/workspace` | `LayoutWizardCreateWorkspace` and `createWorkspacePage` |
| `/workspace/{workspaceId}/…` | `LayoutWorkspace` and every workspace page |
| `/workspace/{workspaceId}/{accountId}/…` | `LayoutWorkspaceAccount`, on top of the above |
| `/workspace/{workspaceId}/all/assets` and `/{accountId}/assets` | `workspaceAssetsPage` (server) — same, one page for both |
| `/workspace/{workspaceId}/all/proposals` and `/{accountId}/proposals` | `workspaceProposalsPage` (server) — same, one page for both |
| Explore CTA | `exploreDaosPageClient` (client) — `useFeatureFlags().isEnabled('workspaces')` |

Notes:

- The layouts are gated, not only the pages: a layout still renders around its page's 404, so with only the pages
  gated a disabled feature would show the workspace navigation, the gate's error state and the wizard, and the
  layouts would still prefetch from the backend. A 404 raised in `LayoutWorkspace` sits above
  `workspace/[workspaceId]/not-found.tsx`, so it falls through to the root not-found page, without the workspace
  navigation.
- Nested layouts and pages render in parallel, so the 404 of a parent layout does not stop a child from running.
  That is why `LayoutWorkspaceAccount` and the pages keep their own check. The flag snapshot is cached per request
  (`React.cache`), so the repeated checks cost one read.
- The redirects in `next.config.mjs` stay ungated — the flags are read at runtime, which the config cannot do — and
  only fill in missing segments of URLs that now resolve to a 404.
- `notFound()` must not be imported from `next/navigation`: that is aliased to the client-hooks wrapper
  (`src/shared/lib/nextNavigation`), which cannot re-export server functions. See the comment in
  `src/shared/utils/notFoundUtils/notFoundUtils.ts`.
- `workspaceDialogsDefinitions` stays registered in `providersDialogs` unconditionally. The publish dialog can
  only be opened from the create wizard, which is itself gated, so registration alone exposes nothing.

## Account resolution

Account addresses are resolved through the workspace query API
([app-backend#1556](https://github.com/aragon/app-backend/pull/1556)):

```
POST /v2/workspaces/query/accounts     body: { accounts: [{ network, address }] }
     -> { data: [{ network, address, type, status, indexed, name?, safe?, error? }] }
```

`src/modules/workspace/api/workspaceQueryService/` wraps **the whole `query/*` surface**, one client service per
API surface rather than one per resource — `accounts` and `assets` today, the remaining three when they are wired.
Notes that shape the client:

- **v2 only** — the version is forced with `apiVersionUtils.buildVersionedUrl(path, { forceVersion: 'v2' })`, the
  same way `daoService` forces v2 for permissions.
- **POST that only reads.** The account list does not fit in a URL. Query-string params are rejected with 400.
- **Never match the response by index.** The backend removes duplicates and checksums addresses, so the response can
  be shorter and reordered than the request — `workspaceUtils.findAccountInfo` matches on network + address.
- Max 100 accounts per request; a bigger list is a 400. Not enforced in the UI yet (see Known gaps).
- The response `safe` field (full Safe configuration) is intentionally not modelled: nothing in the create flow
  needs it.

### Validation and type detection

`status` drives both:

| `status` | Meaning | Row validation | Stored `type` |
| --- | --- | --- | --- |
| `available` | Indexed DAO or readable Safe | passes | `DAO` / `SAFE` from `type` |
| `unsupported` | Neither a DAO nor a Safe on a covered network | `error.unsupportedAccount` | — |
| `unavailable` | Source exists but could not be read now (rate limit, timeout, gateway down) | `error.unverifiedAccount` | — |

`unavailable` is transient, so its message asks the user to retry rather than calling the address invalid. It still
blocks: storing an account whose type is unknown would corrupt the registry, and `WorkspaceAccountType` deliberately
has no `UNKNOWN` member. Locally this means Safe accounts need `aragon-gateway` running — without it every non-DAO
address comes back `unavailable`.

Each account row also shows what resolved, under its network and address fields
(`createWorkspaceFormAccountIdentity`): a `DaoAvatar` plus the DAO's name and a `DAO` tag, or a wallet
`AvatarIcon` plus the truncated address and a `Safe` tag, with a spinner while the lookup is in flight. Nothing is
rendered for an `unsupported`/`unavailable` address — the field error already states the reason. The endpoint names
DAOs only (`name: dao.name ?? null`) and returns no logo, so a Safe shows its address and the avatar falls back to
its initial; naming a Safe is what the optional account metadata is for.

The row lookup follows the `manageMembershipAddressList` precedent: a React Query hook (`useWorkspaceAccounts`)
gated with `enabled` on a well-formed address, a synchronous validator reading its data, and an effect that
re-`trigger`s the field once the lookup resolves. `staleTime` is 5 minutes because resolving a non-DAO address costs
one upstream Safe call — the API docs say explicitly not to poll it.

At submit, `publishWorkspaceDialog` re-resolves **all** accounts in one batched `fetchQuery` and
`buildWorkspace` reads each account's type from it. An account that no longer resolves throws an `invariant` rather
than storing a guessed type, which surfaces as the dialog's error state with a retry.

## Wiring

- `src/modules/application/components/providers/providersDialogs.ts` — spread `workspaceDialogsDefinitions`.
- `src/modules/explore/pages/exploreDaosPageClient.tsx` — a fourth `CtaCard` in the CTA row. It must use
  `onClick: () => router.push('/create/workspace')`, **not** `href`: `CtaCard` forces `target="_blank"` plus an
  external-link icon whenever `href` is set.
- `src/shared/types/workspacePageParams.ts` — `IWorkspacePageParams { workspaceId: string }`, exported from
  `src/shared/types/index.ts` (ported verbatim from 1096).
- `src/assets/locales/en.json` — `app.workspace.*` (new top-level module namespace),
  `app.shared.networkInput.*`, and one new explore CTA block.

## File inventory

New:

```
src/shared/components/forms/networkInput/{networkInput.tsx,networkInput.api.ts,networkInput.test.tsx,index.ts}
src/shared/types/workspacePageParams.ts

src/modules/workspace/
├── api/workspaceQueryService/          # the whole POST /v2/workspaces/query/* surface
│   ├── domain/{workspaceAccountInfo.ts,workspaceAsset.ts,workspaceAssetListResponse.ts,workspaceCoverage.ts,index.ts}
│   ├── domain/enum/{workspaceAccountInfoStatus.ts,workspaceAccountInfoType.ts,workspaceCoverageStatus.ts,workspaceCoverageSource.ts,index.ts}
│   ├── queries/useWorkspaceAccounts/{useWorkspaceAccounts.ts,index.ts}
│   ├── queries/useWorkspaceAssetList/{useWorkspaceAssetList.ts,index.ts}
│   ├── queries/index.ts
│   └── {workspaceQueryService.ts,workspaceQueryService.api.ts,workspaceQueryServiceKeys.ts,workspaceQueryService.test.ts,index.ts}
├── api/workspaceService/
│   ├── domain/{workspace.ts,workspaceAccount.ts,workspaceTarget.ts,index.ts}
│   ├── domain/enum/{workspaceAccountType.ts,index.ts}
│   ├── queries/useWorkspace/{useWorkspace.ts,index.ts}
│   ├── queries/index.ts
│   ├── mutations/useCreateWorkspace/{useCreateWorkspace.ts,index.ts}
│   ├── mutations/useUpdateWorkspace/{useUpdateWorkspace.ts,index.ts}
│   ├── mutations/index.ts
│   ├── {workspaceService.ts,workspaceService.api.ts,workspaceServiceKeys.ts,workspaceService.test.ts,index.ts}
├── components/createWorkspaceForm/
│   ├── createWorkspaceFormDefinitions.ts
│   ├── createWorkspaceFormAccountIdentity/{createWorkspaceFormAccountIdentity.tsx,index.ts}
│   ├── createWorkspaceFormMetadata/{createWorkspaceFormMetadata.tsx,index.ts}
│   ├── createWorkspaceFormTargets/{createWorkspaceFormTargets.tsx,createWorkspaceFormTargetsItem.tsx,index.ts}
│   ├── createWorkspaceFormAccounts/{createWorkspaceFormAccounts.tsx,createWorkspaceFormAccountsItem.tsx,index.ts}
│   └── index.ts
├── components/workspaceAccountItem/{workspaceAccountItem.tsx,index.ts}
├── components/layoutWizardCreateWorkspace/{layoutWizardCreateWorkspace.tsx,index.ts}
├── components/layoutWizardEditWorkspace/{layoutWizardEditWorkspace.tsx,index.ts}
├── components/workspaceWizard/{workspaceWizard.tsx,workspaceWizardDefinitions.ts,index.ts}
├── constants/{workspaceDialogId.ts,workspaceDialogsDefinitions.ts}
├── dialogs/publishWorkspaceDialog/{publishWorkspaceDialog.tsx,publishWorkspaceDialogUtils.ts,index.ts}
├── pages/createWorkspacePage/{createWorkspacePage.tsx,createWorkspacePageClient.tsx,index.ts}
├── components/workspaceAccountSelector/{workspaceAccountSelector.tsx,index.ts}
├── hooks/useWorkspaceAccountOptions/{useWorkspaceAccountOptions.ts,index.ts}
├── components/workspaceSelector/{workspaceSelector.tsx,index.ts}
├── components/workspaceAssetList/{workspaceAssetList.tsx,index.ts}
├── components/workspaceAssetsAsideCard/{workspaceAssetsAsideCard.tsx,workspaceAllAssetsAsideCard.tsx,workspaceDaoAssetsAsideCard.tsx,index.ts}
├── components/workspaceProposalList/{workspaceProposalList.tsx,index.ts}
├── components/workspaceProposalsAsideCard/{workspaceProposalsAsideCard.tsx,workspaceAllProposalsAsideCard.tsx,workspaceDaoProposalsAsideCard.tsx,index.ts}
├── hooks/useWorkspaceAssetListData/{useWorkspaceAssetListData.ts,index.ts}
├── hooks/useWorkspaceDaos/{useWorkspaceDaos.ts,index.ts}
├── hooks/useWorkspaceProposalListData/{useWorkspaceProposalListData.ts,index.ts}
├── pages/workspaceAssetsPage/{workspaceAssetsPage.tsx,workspaceAssetsPageClient.tsx,index.ts}
├── pages/workspaceDetailsPage/{workspaceDetailsPage.tsx,workspaceDetailsPageClient.tsx,index.ts}
├── pages/workspaceProposalsPage/{workspaceProposalsPage.tsx,workspaceProposalsPageClient.tsx,index.ts}
├── pages/workspaceEditPage/{workspaceEditPage.tsx,workspaceEditPageClient.tsx,workspaceEditPageUtils.ts,index.ts}
├── utils/workspaceUtils/{workspaceUtils.ts,workspaceUtils.test.ts,index.ts}
└── index.ts

src/modules/application/components/layouts/layoutWorkspace/{layoutWorkspace.tsx,index.ts}
src/modules/application/components/navigations/navigationWorkspace/{navigationWorkspace.tsx,navigationWorkspaceUtils.ts,index.ts}
src/app/create/dao/layout.tsx
src/app/create/workspace/{page.tsx,layout.tsx}
src/app/workspace/[workspaceId]/{layout.tsx,page.tsx,assets/page.tsx}
```

Modified: `providersDialogs.ts`, `exploreDaosPageClient.tsx`, `src/shared/types/index.ts`, `en.json`,
`finance/hooks/useAssetListData` (uses the extracted normaliser), `finance/components/assetList/index.ts` (exposes
`AssetList.Item`),
`src/shared/featureFlags/{featureFlags.constants.ts,featureFlags.api.ts}`, `src/shared/testUtils/formWrapper.tsx`
(gained an optional `defaultValues` prop).
Deleted: `src/app/create/layout.tsx`.

## Relationship to branch 1096

`app-1096-outstanding-aragon-workspaces-questions` already contains `src/modules/workspace/` with
`IWorkspace`, `IWorkspaceAccount`, `WorkspaceAccountType`, a mocked `workspaceService`, `workspaceMocks`,
assets/transactions/members pages, `layoutWorkspace` and `navigationWorkspace`. This work reimplements the
overlapping pieces on `main`.

Whichever branch lands second must reconcile:

| File | Conflict |
| --- | --- |
| `api/workspaceService/domain/workspace.ts` | this branch adds `targets` |
| `api/workspaceService/domain/workspaceAccount.ts` | identical — should merge clean |
| `api/workspaceService/domain/enum/workspaceAccountType.ts` | identical |
| `api/workspaceService/workspaceService.ts` | 1096 is read-only from mocks; this adds localStorage + create |
| `api/workspaceQueryService/` vs 1096's `api/workspaceFinanceService/` | 1096 splits the query API per resource; this keeps one service for the whole `query/*` surface |
| `constants/workspaceMocks.ts` | removed on this branch: the registry has no seed workspace |
| `index.ts` | both export from the module root — additive |
| `src/app/workspace/[workspaceId]/layout.tsx` | identical in both branches |
| `application/components/layouts/layoutWorkspace/` | 1096 fetches and hydrates, this one cannot (local-storage registry) |
| `application/components/navigations/navigationWorkspace/` | 1096 takes the resolved workspace, this one resolves it client-side; `buildLinks` lists different pages |
| `src/app/workspace/[workspaceId]/` | both add `assets/page.tsx`; 1096 also adds members and transactions |

Paths, type names and file layout were chosen to match 1096 exactly so the merge is additive wherever possible.
Keep it that way when extending this.

## Known gaps

- The 100-account request limit is not enforced in the UI; a longer list fails at submit with a 400.
- All five scopes' sections now have an account-scoped route, though for a Safe the overview and proposals sections
  still fail with the gate's error state (see "Safe support by route").
- **The backend aggregates no Safe assets or transactions (verified on sandbox, `sandbox.backend.aragonservices.in`,
  2026-10-28).** `query/assets` and `query/transactions` return few or no rows for real Sepolia Safes that hold
  balances and transfers (2 asset rows and 5 transaction records on the Safes checked), with coverage `source:
  "index"`, `status: "unverified"`, `partial: true`; `WorkspaceCoverageSource.SAFE` never appears for them.
  `query/members` is the exception: it returns the owners of a Safe account with `source: "safe"`. The accounts endpoint reports such a Safe as `indexed: false`, and the backend does not fall back to the
  Safe transaction service for these two resources. The control isolates the cause: six indexed DAOs sent with the
  identical request body returned five rows each, `source: "index"`, `available`, `partial: false`, so the request
  shape is not at fault. `query/accounts` *does* reach Safe infrastructure (`type: "safe"`, `status: "available"`,
  and the full `safe` block: owners, `threshold`, `version`, `nonce`, `modules`, `guard`, `meta.source: "chain"`),
  so Safe **resolution** works and Safe assets and transactions **aggregation** does not exist. The premise that the workspace endpoints
  aggregate Safe data, which this work was built on, was read off doc comments and was false; this check is what
  caught it. It holds for sandbox only: staging and production may be configured differently, and it says nothing
  about a local `aragon-gateway`.

  **Accepted consequence:** until the backend aggregates Safe assets and transactions, a selected Safe shows a
  list that is empty or incomplete and totals to match, **silently** — no warning and no explanation. That is deliberate. Coverage cannot carry the
  message, since `unverified` is the permanent state of every Safe and must not warn (see Coverage), and both a
  distinct "Safe accounts aren't aggregated yet" message and reverting to the blunt warning were considered and
  declined. The cost of the choice is that a sparse Safe page is indistinguishable from a sparse Safe.
- **`query/members` returns no membership for a DAO's Safe body (verified on sandbox, 2026-10-28,** DAO
  `0x23A16064466201bfB2b096B68c5103B70Da78394` with Safe body `0x1F01e6fe406295c9fe42189A2ef999636a04132a`**).**
  The owners of a Safe are only ever reported on the Safe account, so with the Safe not a workspace account the
  DAO's Safe body tab is empty. When the Safe is also an account its owners do appear, but only as Safe-account
  memberships, which link to the block explorer even under the DAO's Safe body tab. Pending a backend fix.
- **`query/accounts` fails the whole request when one address is unplaceable.** An address that is neither an
  indexed DAO nor a Safe makes the endpoint answer 404 `{"code":"safeNotFound"}` for the *entire* batch, which
  contradicts the per-entry `status: "unsupported"` that `IWorkspaceAccountInfo` and
  `workspaceUtils.validateAccountInfo` are built around. It predates and is independent of the Safe aggregation
  work, and it affects the create form today, so one such address in the list probably fails the validation of the others (inferred from the whole-request 404, not exercised in the form), with
  the error state rather than `error.unsupportedAccount`. The Safe branch of the members routes is written around
  it: `workspaceAccountInfoUtils.getAccountInfo` falls back to the DAO path when the lookup throws.
  `WorkspaceAccountGate` only reads the DAO and never calls `query/accounts`.
- **A URL naming an account the workspace does not hold still widens the page.** Every account type resolves to an
  option now and a lowercased address resolves too, so what remains is an account that is not in the workspace
  at all: the assets, transactions and proposals pages read it as the aggregated selection and show every account
  under a URL naming one. The members page does the same for a Safe outside the workspace, which takes the Safe
  branch and widens to every account. Properly, it should show that account and offer adding it to the workspace from the
  selector — the next gap.
- The workspace proposal details page is the DAO page as is, so the links inside it still leave the workspace: its
  breadcrumb and its error `actionLink` resolve to `/dao/…`, as do the voter, publisher and settings links of its
  nested plugin components. Held back on purpose until the rest of the migration lands and every call site is
  visible; the row links into the page are done.
- The workspace proposals endpoint has no `onlyActive`, so an account scope counts the proposals of uninstalled
  plugins where the DAO proposals page does not. The list and its aside card agree with each other; the DAO page's
  own total for the same DAO can read lower.
- Viewing an account the workspace does not hold is not supported (see above). The intended behaviour is to show it
  and offer adding it to the workspace, from the account selector.
- The All tab merges before paging, so page 1 is the 20 largest holdings across accounts — a quiet account may only
  appear on a later page. That is the API's design.
- The two tabs read different endpoints, so a backend difference (spam or decimals rules) could still show
  different numbers for one DAO; the shared normaliser only removes the client-side source of drift.
- Workspaces cannot be deleted.
