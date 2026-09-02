# Workspace Members page

Implementation notes and decision log. Design context lives in [`workspaces.md`](./workspaces.md); the sibling
finance pages are documented in [`workspaceFinancePages.md`](./workspaceFinancePages.md).

## Scope

`/workspace/{workspaceId}/members`, for workspaces of multiple **DAO** accounts, on the existing backend with no API
changes. Safe accounts are out of scope, and there is no workspace-scoped member details page — see decision 4.

## Why this page is much simpler than assets and transactions

Members are fetched **by body**: `/v2/members?daoId=…&pluginAddress=…`. The doc's requirement is "a filter for each
body of each DAO in the workspace", and — unlike the proposals page, where it explicitly adds an aggregating
"All proposals" filter — it asks for **no aggregate**. So every tab maps to exactly one `(daoId, pluginAddress)` pair,
which is precisely the query `DaoMemberList.Default` already issues.

The consequence: **no cross-account aggregation anywhere.** No fan-out, no merge, no frontier cursor, no client-side
pagination. The finance pages needed all of that because `/v2/assets` and `/v2/transactions` are account-scoped and a
workspace view spans accounts; a body, by contrast, belongs to exactly one DAO.

What is actually new is only the *filter source*: collecting bodies across accounts, and labelling them so they stay
distinguishable.

## File map

```
src/modules/workspace/
├── utils/workspaceBodyUtils/          # pure: collects + labels bodies, resolves featured delegates
├── hooks/useWorkspaceBodyPlugins/     # thin reactive wrapper over the util
├── components/workspaceMemberList/    # PluginFilterComponent wiring; reuses DaoMemberList.Default
└── pages/workspaceMembersPage/        # server page + *PageClient

src/app/workspace/[workspaceId]/members/page.tsx
```

Reused unchanged: `DaoMemberList.Default`, `DaoPluginInfo`, the `GOVERNANCE_DAO_MEMBER_LIST` and
`GOVERNANCE_MEMBER_PANEL` slots, `FeaturedDelegatesList`, `daoUtils.getDaoPlugins`,
`daoVisibilityUtils.filterHiddenPlugins`, `pluginSortUtils.sortByDisplayOrder`.

## Where the bodies come from

Per account: `daoUtils.getDaoPlugins(dao, { type: BODY, includeSubPlugins: true, includeLinkedAccounts: true })`, then
the account's CMS `pluginsToHide` override, then `pluginSortUtils.sortByDisplayOrder` — the same three steps the DAO
members page takes. Accounts are then concatenated in workspace order.

`getDao` already returns a parent's **child-DAO plugins** (on v3 it backfills them from
`/v2/plugins/by-dao/:network/:address/details`, each carrying its own `daoAddress`), so child bodies need no extra
fetch. For the demo workspace that yields:

| Account | Body | Owning DAO |
| --- | --- | --- |
| Citrea | `xCTR` (tokenVoting) | Citrea |
| Citrea | ~~`Core Governance Delegates (Polling)`~~ | hidden by CMS `pluginsToHide` |
| Aragon ACF | `Multisig` | Aragon ACF (the account itself) |
| Aragon ACF | `Core Team` (multisig) | Core Team SubDAO |
| Aragon ACF | `Admin` | Rewards SubDAO |
| Aragon ACF | `Admin` | Buyback and Burn SubDAO |

---

## Decision log

### 1. No aggregated "All members" tab

**Decision.** Per-body tabs only.

**Reasoning.** It is what the doc specifies, and the aggregate is semantically ill-defined: one address can be a
member of several bodies with different tokens and voting power, so a deduplicated row has no single meaningful stat
to show. Members are also not time-ordered, so a merge would have none of the ordering guarantees the transactions
merge relies on. Skipping it is what keeps this page free of an aggregation layer entirely.

### 2. Labels are qualified with the DAO that owns the body

**Decision.** Every tab reads `{owning DAO} · {body name}`.

**Reasoning.** Plain body names are ambiguous in a workspace. The demo workspace surfaces **two** unnamed `admin`
plugins, on two different child DAOs, which both render as "Admin" — and they belong to the *same* workspace account,
so qualifying by account would not separate them either. The owning DAO is the only thing that does:

```
[ Citrea · Featured delegates ]
[ Citrea · xCTR ]
[ Aragon Automated Capital Flow (demo) · Multisig ]
[ Core Team SubDAO · Core Team ]
[ Rewards SubDAO · Admin ]
[ Buyback and Burn SubDAO · Admin ]
```

Qualification is unconditional rather than applied only on collision, so the labelling is predictable instead of
depending on which other bodies happen to exist. The cost is long labels, so each toggle carries
`max-w-64 … truncate` via `IFilterComponentPlugin.className`.

### 3. A body is scoped to the DAO that owns it, not to the workspace account

**Decision.** Each option carries both `daoId` (the owning DAO — the child for a linked-account body) and
`accountDaoId` (the workspace account it was reached through). The member query, the aside and the member links all
use `daoId`.

**Reasoning.** The members of "Rewards SubDAO · Admin" are that child DAO's members, and its detail page belongs to
that child DAO. The DAO members page passes the parent id and lets `DaoMemberListDefault` re-derive the child via
`daoUtils.resolvePluginDaoId`; passing the owning id directly is both more accurate and independent of that
inference. Verified: each child body's member links resolve to that child (`0x2491…`, `0x97C5…`, `0x9D80…`), not to
the parent.

### 4. Member links leave the workspace

**Decision.** Members link to `/dao/{network}/{addressOrEns}/members/{address}` on the owning DAO. No workspace member
details route.

**Reasoning.** The doc parks this explicitly — "Member details page — in the first version it could stay the same" —
and the existing page already works for linked DAOs. The known wart: clicking a member navigates out of the workspace
and the back button is the only way back. A `/workspace/{id}/members/{address}` route is the follow-up.

### 5. One featured-delegates tab per account that has a config

**Decision.** Resolve the CMS `featured-delegates.json` config per account and prepend a synthetic tab per match,
labelled `{DAO} · Featured delegates`, rendering `FeaturedDelegatesList` through `renderContent`.

**Reasoning.** Citrea has a config (8 delegates); omitting it would make the workspace members page show strictly less
than the Citrea DAO members page. Because synthetic tabs are prepended, the first tab is a featured-delegates tab
when one exists — the same default the DAO page arranges explicitly.

Two deliberate differences from the DAO page:

- The match is made against the **already visibility-filtered** body list, so a featured-delegates tab is never
  surfaced for a body the CMS hides. The DAO page resolves it against the unfiltered list.
- The token-voting check is `interfaceType === PluginInterfaceType.TOKEN_VOTING` rather than the tokenPlugin's
  structural `'token' in plugin.settings` guard, which keeps `workspaceBodyUtils` free of plugin imports. The cast to
  `IDaoPlugin<ITokenMemberListPluginSettings>` happens in the page client, where importing `@/plugins/tokenPlugin` is
  already the established pattern (the DAO members page does the same).

`useFeaturedDelegatesPlugin` could not be reused: it is a hook, and a workspace has a dynamic number of accounts, so
calling it per account would violate the rules of hooks. The resolution is pure given data the page already holds, so
it moved into the util.

### 6. `workspaceBodyUtils` must not call into `@aragon/gov-ui-kit`

**Decision.** The util uses local `isSameAddress` / `truncateAddress` / `getDaoLabel` helpers instead of
`addressUtils.isAddressEqual`, `addressUtils.truncateAddress` and `daoUtils.getDaoDisplayName`.

**Reasoning.** This is a real constraint, not a preference. `tsconfig` aliases `@aragon/gov-ui-kit` to
`src/shared/lib/@aragon/gov-ui-kit.ts`, which is `'use client'` + `export * from '@aragon/gov-ui-kit-original'`. The
util runs in the members **Server Component** (to pick which body to prefetch), and calling a client-marked export
during server rendering throws:

```
TypeError: {imported module .../gov-ui-kit.ts}.addressUtils.isAddressEqual is not a function
```

This produced a 500 on the first run of the page. `daoUtils` already compares plugin and DAO addresses with raw
`.toLowerCase()` in exactly these server-reachable paths (`filterByLinkedAccounts`, `filterPluginByAddress`) for the
same reason, so this follows the existing pattern rather than inventing one.

> This is a documented deviation from the `CLAUDE.md` rule "compare Ethereum addresses with
> `addressUtils.isAddressEqual`". The rule holds for client code; an isomorphic util cannot honour it. If a
> server-safe address helper is ever extracted to `shared/utils`, these three locals should collapse into it.

### 7. `pluginSortUtils.sortByDisplayOrder` was made generic

**Decision.** `<TPlugin extends IFilterComponentPlugin<IDaoPlugin>>(plugins: TPlugin[]) => TPlugin[]`.

**Reasoning.** The workspace body option carries extra fields (`daoId`, `daoName`, `accountDaoId`) that the old
signature erased, forcing a cast back. Making it generic preserves the caller's type, removes the cast, and is
backward compatible for every existing caller.

### 8. The option `id` stays the interface type

**Decision.** `id: plugin.interfaceType`, `uniqueId: {network}-{pluginAddress}`.

**Reasoning.** `PluginFilterComponent` resolves slot components by `id`, so keeping the interface type is what lets
the token and lockToVote plugins' registered `GOVERNANCE_DAO_MEMBER_LIST` components take precedence over the default
list — exactly as on the DAO page. `uniqueId` is the URL value and must be unique across a multi-chain workspace,
hence the network prefix: a plugin address is only unique per chain.

### 9. The container owns the URL parameter

**Decision.** `WorkspaceMemberList.Container` passes no `onValueChange`, so `PluginFilterComponent`'s internal
`useFilterUrlParam` owns the `body` parameter; the page client reads it with `useSearchParams` to resolve the aside.

**Reasoning.** This is the DAO members page arrangement. The page-owned alternative (used on the DAO *transactions*
page) exists there to survive transient list unmounts on filter change; the members list does not unmount that way, so
the simpler arrangement applies.

### 10. Prefetch covers the first body and, when needed, its child DAO

**Decision.** The server page computes the body list with the pure util, then prefetches the first body's member list
plus — when that body belongs to a linked account — the child DAO itself.

**Reasoning.** The member list resolves the owning DAO for member links and the aside, and that child DAO is not among
the accounts the layout prefetches. Without it the first paint would fetch it client-side. Only the first body is
prefetched, mirroring the DAO page.

---

## Verified behaviour

Against the live backend, workspace `demo`:

| Tab | Members | Member links resolve to |
| --- | --- | --- |
| Citrea · Featured delegates | 8 delegates | `citrea-mainnet-0xA941…6419` |
| Citrea · xCTR | 18 of 32 | `citrea-mainnet-0xA941…6419` |
| Aragon ACF · Multisig | 9 of 9 | `ethereum-sepolia-0xE8fd…0De5` |
| Core Team SubDAO · Core Team | 8 of 8 | `ethereum-sepolia-0x2491…7452` |
| Rewards SubDAO · Admin | 8 of 8 | `ethereum-sepolia-0x97C5…d6a4` |
| Buyback and Burn SubDAO · Admin | 8 of 8 | `ethereum-sepolia-0x9D80…e6c7` |

- The CMS-hidden `Core Governance Delegates (Polling)` body is absent, and the Citrea DAO members page shows the
  matching pair of tabs (`Featured delegates`, `xCTR`), confirming parity.
- Pagination on the xCTR body: 18 → 32 of 32, then "More" disables.
- The two `Admin` tabs resolve to different child DAOs, so the qualification works end to end.
- A fresh load defaults to the featured-delegates tab and settles the URL to `body=featured-delegates-…`.

## Known limitations & follow-ups

1. **Member links leave the workspace** — decision 4. Needs `/workspace/{id}/members/{address}`.
2. **Long tab labels** are truncated rather than laid out better; with many accounts the filter row will need a
   different control (the nested account→body shape considered during design).
3. **No aggregate view** — decision 1. If one is ever wanted, the open question is what a merged row shows for an
   address that belongs to several bodies.
4. **Safe accounts.** Per the doc, Safe accounts are bodies too; `useWorkspaceAccountDaos` filters on
   `type === DAO` and would need a sibling resolver plus a members API for Safe owners.
5. **Three local address helpers** in `workspaceBodyUtils` — decision 6. Collapse them if a server-safe address util
   is extracted to `shared/utils`.
