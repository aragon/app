# Workspace architecture — research and options

**Status:** research / pre-decision. Nothing here is implemented.
**Scope:** `aragon/app` (frontend) + `aragon/app-backend` (indexer & API).

## The goal

Introduce **Workspace** as a new top-level entity above the DAO. A Workspace holds:

- a list of **accounts** — a DAO is one account type, a Safe{Wallet} is another;
- **workspace metadata** — name, description, links/resources, avatar (mirroring today's DAO metadata);
- **optional per-account metadata** — needed for Safe accounts, since DAO accounts carry their own.

The conceptual layering is **ACCOUNT / BODY / PROCESS**. A DAO is an account; a DAO plugin can be a body,
a process, or both. A Safe is an account *and* a body *and* a process.

The Workspace page should look exactly like today's DAO page while aggregating across accounts:

| Page | Entity it deals with | Behaviour |
| --- | --- | --- |
| Assets | account | all accounts aggregated, or filtered to one |
| Transactions | account | same as assets |
| Members | **body** | one filter per body of each DAO, plus one per Safe account |
| Proposals | **process** | one filter per process of each DAO, plus one per Safe account, plus an aggregated paginated "All proposals" |

## Locked V1 constraints

These are decided, not open. They drive most of what follows.

1. **Workspace replaces `linkedAccounts`; it does not extend it.** Workspace is a new first-class entity that
   will supersede the parent/child DAO hierarchy. In V1 the two coexist: when a DAO that has child DAOs is
   placed in a workspace, that DAO account shows **all** of its data including children — exactly as its DAO
   page does today. So a DAO account's data scope transparently includes its `linkedAccounts`, and the
   hierarchy becomes an implementation detail of one account rather than the organising principle.
2. **Accounts may span multiple chains.** A workspace can hold accounts on different networks.
3. **Safe is required in V1**, as a full account type: indexed config and owners, indexed assets and
   transactions, a proposals API, action decoding, a members API, and the other DAO-mirrored APIs.
4. **Workspaces must be creatable and editable** in V1.

Constraint 4 combined with 3 means the config-storage decision cannot be deferred behind a validation
phase, and constraint 2 means the existing single-network aggregation design has to change.

## Headline finding: much of the model already exists

The `linkedAccount` feature flag already implements a parent-DAO + child-DAO hierarchy that covers a large
part of the target *page* behaviour. **BODY and PROCESS already exist as first-class concepts.** The missing
layer is ACCOUNT as an abstraction — today it is implicitly the DAO.

This matters even though Workspace replaces `linkedAccounts`: the page-level machinery (filter tabs, per-tab
query retargeting, aggregated lists, per-account asides) is reusable as the Workspace UI, and the parts that
must be replaced are the *membership source* and the *aggregation key*, not the presentation.

| Requirement | What already exists | Fate under Workspace |
| --- | --- | --- |
| Container of many accounts | `IDao.linkedAccounts?: ILinkedAccountSummary[]` — `apps/app/src/shared/api/daoService/domain/dao.ts` | **Replaced** by a workspace account list |
| "All / per-account" filter on Assets & Transactions | `useDaoFilterUrlParam` builds `All` / parent / one tab per account, URL-synced, with an `onlyParent` flag | **Reused**, re-sourced from the workspace |
| Members page deals with bodies | `PluginType.BODY` from `IDaoPlugin.isBody`; `daoMemberListContainer` already calls `useDaoPlugins({ type: BODY, includeSubPlugins: true, includeLinkedAccounts: true })` | **Reused** |
| Proposals page deals with processes | `PluginType.PROCESS` from `isProcess`; the aggregated paginated "All proposals" list already exists (`daoProposalList` group tab) | **Reused** |
| Cross-account aggregation | Controllers expand `daoAddress` → `daoAddresses[]` + Mongo `$in` | **Re-keyed** — see the multi-network decision |
| Per-account metadata (type + UI) | `ILinkedAccountSummary` + `DaoInfoAside`, `LinkedAccountInfo`, `DaoHierarchy` | **Reused** for account metadata |
| Per-account attribution | `DaoTargetIndicator`, `daoTargetUtils.findTargetDao` | **Reused** |
| Retargeting a per-tab query | `daoUtils.resolvePluginDaoId` → `${network}-${plugin.daoAddress}` | **Reused** — already a composite key |

### Safe is already a recognised external body

Not a greenfield integration:

- **Backend** — `PluginDetector.detectAddressType()` (`src/helpers/pluginDetector.ts`) reads contract bytecode,
  looks for the `masterCopy()` selector, and returns `VotingBodyBrandIdentity.SAFE | EOA | OTHER`. Stamped onto
  `plugin.brandId` in `pluginSettingHandler.ts:479`.
- **Frontend** — `PermissionEntityExternalBrandId = { EOA, SAFE, OTHER }`, `brandedExternals` with a
  `Safe{Wallet}` logo and label, `safeAccountAvatar.tsx`, rendering in the permissions graph, permission lists
  and SPP process details, plus `useIsSafeContract` gating the external-address body flow in `setupBodyDialog`.

**A Safe can already be an external voting body of an SPP stage.** What does not exist is Safe as an *account*.

### Infrastructure that makes Safe-as-account cheap

- `modules/daoAddressCache.ts` reads the **`Dao` collection** *per network*, and the transfer crawler matches
  every `Transfer` log against it. A Safe stored as a row there gets **asset and transfer indexing for free**,
  on every indexed chain.
- `PluginMember` is keyed by `(memberAddress, daoAddress, pluginAddress, network)` — a Safe's owners fit
  verbatim, so the members API works unchanged.
- `Plugin.interfaceType` is an enum (`IPluginInterfaceType`) — adding `safe` is additive.

## The structural gaps

1. **No ACCOUNT abstraction.** `ILinkedAccountSummary` is a DAO summary, and the Mongo `Dao` document has no
   `type` field. Nothing can express "this account is a Safe".
2. **Membership is on-chain-permission-derived, so it can only contain OSx DAOs.**
   `handlers/permissionHandler.ts::handleDaoLinkingOnGrant` links two DAOs only when *both*
   `PARENT_TO_SUB_DAO_ACKNOWLEDGEMENT_PERMISSION_ID` and `SUB_DAO_TO_PARENT_ACKNOWLEDGEMENT_PERMISSION_ID`
   are granted. A Safe has no PermissionManager. Since Workspace replaces this anyway, the relevant point is
   that **nothing of this mechanism carries forward** — workspace membership needs a new source.
3. **Membership is structurally same-chain.** Both `Models.Dao.findByAddress(addr, network)` calls in the
   linking handler use one `network`, and `linkedAccounts` is a bare `string[]` of addresses with no network
   qualifier. It cannot express a cross-chain account set.
4. **Aggregation is single-network by construction.** `network` is a scalar on every `*ExtraParams` type and
   `pairFromExtraParams` sets it from the parent DAO.
5. **The precursor has never run in production.** The `linkedAccount` flag is `defaultValue: false` with
   `environments: { local: true }`, and the feature is v3-only in a v2-default world: the v2 `getDaoDetails`
   projection omits `linkedAccounts`/`parentAccount`, and `DaoService.withPlugins` early-returns on v2. Every
   net-new linkedAccount hook and component ships without unit tests. Treat the reusable parts as a spike to
   be hardened, not as a tested foundation.

### Defects in the existing aggregation, to fix either way

- **Aggregation silently collapses to parent-only when any secondary filter is present.** It engages only when
  `hasOnlyDaoAndNetwork` holds — transactions require no `tokenAddress`/`fromAddress`/`toAddress`/`side`/`type`,
  proposals require no `pluginAddress`/`creatorAddress`/`isSubProposal`/`proposalIndex`/`incrementalId`. The
  transactions page's own filters therefore break aggregation, with no error and no signal to the client.
- **Three inconsistent gating conventions:** assets/transactions/policies use `onlyParent` (opt-out), proposals
  use `includeLinkedAccounts` (opt-in), plugins-by-dao aggregates always.
- **Asset aggregation destroys per-account attribution and pagination stability.** In aggregated mode the
  pipeline `$group`s by `(tokenAddress, network)` and skips the per-account `dao` `$lookup`; the `$group` drops
  `id`, so the `{amountUsd:-1, id:-1}` tiebreak degenerates and equal-value assets order non-deterministically
  across pages.
- **`parentAccount` is dropped at the client boundary** — the backend wire type carries it, the frontend `IDao`
  has no such field.
- **Only `metrics.tvlUSD` is workspace-aggregated.** Members, proposalsCreated/Executed, votes and uniqueVoters
  stay parent-only. `useDaoProposalsCount` hard-codes `includeLinkedAccounts: false`.
- **`useFilterUrlParam` deletes its URL param on unmount**, so changing the account filter can wipe the
  selection mid-refetch. `daoTransactionsPageClient` works around it; `daoAssetsPageClient` does not.
- **IPFS metadata `linkedAccounts`/`parentAccount` are dead code** — `Web3Utils.parseDaoMetadata` builds from a
  whitelist that never reads them.

## Decision 1 — where do workspace membership and metadata live?

The backend has **no wallet-signature authentication of any kind** (zero `verifyTypedData`/`recoverAddress`/
`verifyMessage`); the only authenticated write path is admin-only TOTP/JWT (`middlewares/auth.ts::authAssertAdmin`).

Two locked constraints reshape this decision:

- **Create/edit in V1** means a self-serve write path is in scope for V1, so a curated-only channel cannot be
  the whole answer.
- **Multi-chain accounts** actively *penalise* on-chain storage: a workspace's account list is inherently
  cross-chain, so putting it in a contract on one chain makes that chain an arbitrary home and forces
  cross-chain reads to resolve config from elsewhere.

| Option | How it works | Pros | Cons |
| --- | --- | --- | --- |
| **W1. On-chain Workspace registry** | New contract holds accounts + metadata CID, indexed like `daoRegistryHandler` | Same trust model as today; indexable by the existing pipeline; native permissions; verifiable | Contract dev + audit + deploy per network; gas per edit; slowest to ship; **a cross-chain account list has no natural home chain**; must design workspace ownership |
| **W2. Root-DAO IPFS metadata** | Extend `IMetadata` (fields exist, currently dead) | Zero new infra; metadata pipeline exists; governance-gated edits | **Requires a DAO root — fails the Safe-only workspace requirement**; editing needs a governance proposal; anchored to one chain; keeps the `onlyParent` wart |
| **W3. Backend collection + authed write API** | New `Workspace` collection + REST writes | Instant edits; any account type; per-account metadata trivial; no gas; **multi-chain is natural** | Requires net-new wallet-signature auth; centralised and unverifiable; needs an authorisation policy; new attack surface |
| **W4. Signed off-chain config (EIP-712)** | Config signed by an authorised signer; backend verifies against on-chain state (`getOwners` for a Safe, permissions for a DAO) | Verifiable without a contract; no gas; multi-chain natural; authorisation derives from readable on-chain state | Signature-verification infra is new; replay/versioning/revocation design; multi-signer conflict resolution |
| **W5. CMS (`aragon/app-cms`)** | Workspaces as JSON in the existing GitHub-hosted read-only CMS | Literally zero new infra — the app already reads `dao-overrides.json` keyed by DAO id | **Not self-serve, so it cannot satisfy create/edit in V1**; Aragon is the editor; scales to tens |

**Recommendation for V1: W3, with W4's verification model as the authorisation rule.** Store the workspace in a
backend collection so a cross-chain account list and per-account metadata are cheap, and gate writes on a
wallet signature verified against on-chain state — a Safe account may be added by one of its `getOwners()`, a
DAO account by a holder of the relevant permission. This is deliberately the middle path: W1 is the wrong shape
for cross-chain config and too slow for V1; W5 cannot do create/edit. W5 remains useful for **seeding** curated
workspaces before self-serve lands.

The cost to accept explicitly: **wallet-signature auth is net-new backend security work on the V1 critical
path.** It is the single largest new-infrastructure item in this plan and should be scoped first.

> **Trust question this raises.** Today's linking requires *mutual on-chain consent*. Any off-chain membership
> source drops that, so without a rule anyone could assert that your Safe or DAO belongs to their workspace.
> Verifying the writer against `getOwners()` / DAO permissions is what replaces the handshake — that is why it
> is an authorisation requirement, not a nice-to-have.

## Decision 2 — how is an Account modelled?

| Option | Pros | Cons |
| --- | --- | --- |
| **A1. `accountType` discriminator on `Dao`; a Safe is a row in `Dao`** | Asset/transfer indexing **free** via the per-network `daoAddressCache`; every `daoAddresses` aggregation works unchanged; `PluginMember` works; `ILinkedAccountSummary` already shape-matches | Semantic violence; `Dao` has OSx-only required fields (`version`, `isSupported`); needs a migration; **every existing `Dao` query must be audited to filter `accountType: 'dao'`** or Safe rows leak into explore/metrics/sitemap. That audit is the real cost — enumerable and testable |
| **A2. Separate `SafeAccount` collection, joined at the API layer** | Clean separation; no risk to existing DAO queries; Safe fields modelled honestly | Loses the free indexing; **converts already-solved problems (asset/transfer aggregation) back into two-source merges** |
| **A3. Safe as a synthetic plugin (`interfaceType: 'safe'`, `isBody` + `isProcess`)** — composes with A1 or A2 | The whole slot/filter/tab machinery works unchanged; member and process filters appear automatically; matches "a Safe is a body and a process" exactly; precedent exists (`brandId: SAFE`, SPP external bodies) | Must implement a subset of slots (multisig registers 22; a Safe needs ~12–14, skipping install/create ones); no OSx release/build/version |
| **A4. `AccountProvider` capability adapter** | Honest abstraction; a third account type becomes cheap; capability flags handle "a Safe has no delegation" gracefully | A second extension mechanism competing with the slot registry, which already *is* an adapter pattern; large upfront refactor |

**Recommendation: A1 + A3.** A Safe becomes a typed row in `Dao` plus a synthetic body/process plugin. Highest
reuse of existing machinery; the non-negotiable condition is a systematic audit of every `Dao` query for the
discriminator.

### The account reference shape

A workspace account reference must be a composite, not a bare address:

```
{ type: 'dao' | 'safe', network: Network, address: string, metadata?: IAccountMetadata }
```

Bare addresses are unsafe here — see the next decision.

## Decision 3 — multi-network aggregation (new, and now mandatory)

Cross-chain accounts break the current design in three specific ways.

### 3a. Address-only keys are a correctness bug, not just a limitation

Every relevant compound index is address-first, network-second — for example
`@index({ daoAddress: 1, network: 1, blockTimestamp: -1 })` on `Proposal` and
`@index({ daoAddress: 1, tokenAddress: 1, network: 1, amountUsd: -1 })` on `Asset`. Aggregation today issues
`daoAddress: { $in: [...] }` *plus* a scalar `network`.

Drop the scalar `network` for a cross-chain workspace and the `$in` matches an address on **any** chain. That is
not hypothetical for Safes: Safe proxies are deployed with CREATE2, so **the same Safe address very commonly
exists on multiple chains** — and those may be entirely different Safes with different owners. A flat address
`$in` would silently merge their assets, transactions and members.

| Option | Assessment |
| --- | --- |
| **K1. `$or` over `(address, network)` pairs** | Correct, and uses the existing indexes. But the query grows with account count, and `$or` over many branches degrades; it also complicates the existing single-filter code path in five controllers |
| **K2. Denormalised `accountKey = "${network}-${address}"`, indexed, single `$in`** | **Recommended.** Preserves the existing one-query design exactly — `accountKey: { $in: [...] }` — with one new index per collection. The composite is already the frontend's canonical id format (`daoUtils.resolveDaoId`/`parseDaoId`, and `resolvePluginDaoId` returns `` `${network}-${plugin.daoAddress}` ``), so the convention is established. Costs: a new field plus a backfill migration on `Proposal`, `Asset`, `Transaction`, `PluginMember` |
| **K3. Fan out per network and merge in the API layer** | No schema change, but reintroduces multi-source pagination for data that is all in one database — strictly worse than K2 |

### 3b. `blockNumber` is not a cross-chain sort key

Block numbers are per-chain and not comparable: for the same date, Base/Polygon block numbers are far higher
than Ethereum's. Sorting a merged cross-chain list by `blockNumber` clusters one chain at the top.

- **Proposals** already have `@index({ daoAddress: 1, network: 1, blockTimestamp: -1 })`, so the right sort key
  is indexed — but the aggregated path **explicitly forces `sort = 'blockNumber', order = 'desc'`**
  (`controllers/proposal.ts`), overriding the client. That must become `blockTimestamp`, which also removes an
  unindexed sort.
- **Transactions** are worse: every compound index is `(daoAddress, network, …, blockNumber: -1, id: -1)` and
  there is **no `blockTimestamp` index at all**. Cross-chain transaction ordering therefore needs a new index
  (and the field populated) before it can be correct.
- **Assets** sort on `amountUsd`, which is chain-agnostic — fine.

Ties also need a deterministic secondary key that is unique across chains; `accountKey` plus `id` works.

### 3c. Cross-chain semantics that are product decisions

- **Same token on several chains.** Asset aggregation already groups by `(tokenAddress, network)`, so USDC on
  Base and USDC on Ethereum appear as separate rows. Whether the workspace should instead show one combined
  USDC line — and how to reconcile differing decimals and bridged variants — is a product call.
- **Cross-chain valuation.** Total TVL across chains requires per-chain token pricing; `modules/rates.ts` is the
  place to confirm coverage.
- **Indexer coverage.** A workspace can only show data for chains the indexer actually runs. Adding an account
  on an unsupported chain must fail loudly at add-time rather than silently show nothing.

## Decision 4 — frontend migration shape

| Option | Verdict |
| --- | --- |
| **F1. Promote `linkedAccount` in place**, keep `/dao/…`, decouple the root | Rejected. The root stays a DAO, so it cannot express a Safe-only workspace, and it entrenches the mechanism V1 is meant to supersede |
| **F2. New `/workspace/…` route tree; a DAO page becomes a "workspace of one"** | **Recommended.** Clean URL semantics; existing `/dao/…` URLs keep working; page components are reused wholesale because they are already parameterised by a filter; a Safe-only workspace is expressible; no mass rename. Costs: two route trees during migration, a workspace- and network-aware proposal URL builder, SEO/canonical work |
| **F3. Big-bang DAO→Account rename** | **Not viable.** 1031 of 2668 frontend files and 196 of 441 backend files reference `dao`; 555 of 2175 translation keys carry `dao` in their path; 199 files of per-DAO custom code live in `src/daos/`. Enormous, risky, no user value on its own |

### Proposal identity needs redesign for both reasons

`proposalUtils.getProposalUrl` currently links an aggregated linked-account proposal *out* to the owning DAO's
page (`/dao/<network>/<daoAddress>/proposals/<slug>`), where the slug is `${plugin.slug}-${incrementalId}`.

- A Safe has no DAO page, no plugin slug and no `incrementalId` — only a nonce and a `safeTxHash`.
- Cross-chain workspaces mean a workspace-scoped proposal URL must carry the network, since an
  `(address, slug)` pair is no longer unique.

## Decision 5 — Safe proposals

Established facts:

- Pending Safe transactions exist **only** in the Safe Transaction Service and cannot be derived from chain
  events. Executed ones **can** (`ExecutionSuccess`, `SafeMultiSigTransaction`).
- The service uses **limit/offset pagination** — the same scheme as Aragon's backend
  (`ModelUtils.paginateAndSort`). Pending transactions come from
  `GET /v1/safes/{address}/multisig-transactions/?executed=false`; `queued=true` (default) includes
  `nonce >= current nonce`.
- **Unauthenticated use is 2 RPS and 5,000 requests/month**; production requires a paid API key, which cannot
  ship to a browser, so **the backend must proxy**. With multi-chain workspaces the quota scales with
  (accounts × chains), which strengthens the case for caching.
- The service has known ordering defects in `all-transactions` (nonce not used as a secondary sort).

| Option | Pros | Cons |
| --- | --- | --- |
| **P1. Backend merge per request** | Single client contract; centralised caching; key stays server-side | p99 tied to Safe's API; an offset merge over-fetches `offset+limit` from both sources at every page, growing with depth; quota burn per user request |
| **P2. Frontend merge** | — | **Not viable at production scale**: cannot hold the API key, 2 RPS unauthenticated, breaks pagination and counts. Acceptable only for a single-source per-Safe tab |
| **P3. Shadow-index the pending queue (poll + cache in Mongo)** | **Everything existing works unchanged** — the `$in` aggregation, offset pagination, sort keys, counts | Staleness on new transactions and signatures; polling cost scales with (Safes × chains × frequency) against the quota |
| **P4. Hybrid: index history, live-fetch the bounded pending set** | **Recommended** — see below | Counts approximate on page 1; a pathologically deep queue breaks the bounded assumption; needs the backend proxy |

### Why P4

The two sets have opposite shapes. The pending queue is **bounded and small** — exactly the transactions with
`nonce >= currentNonce`, typically tens of items. History is large but **on-chain and therefore indexable**.

So: index executed Safe transactions from chain events as `Proposal` rows, where they join the `accountKey`
`$in` aggregation natively; fetch the pending set **live and whole** (one request per Safe per chain, no
pagination) and merge it at the **head** of the list, page 1 only.

This removes merged-offset pagination entirely — the live set never spans a page boundary, so pages 2+ remain a
single Mongo query with stable ordering. Safe API usage becomes one bounded, cacheable call per Safe per chain
per TTL, and **P3 then becomes an optimisation of that same fetch** rather than a separate architecture.
Mitigate the deep-queue case with a cap plus a "view in Safe" link.

Safe-specific fields with no Aragon analogue still need modelling: `safeTxHash`, `nonce` ordering and
collisions, replacement/"rejection" transactions, `operation`/delegatecall, off-chain signatures held only by
the service versus on-chain `approveHash`, module transactions, and the fact that a queued transaction can
become permanently un-executable.

## Recommended composite for V1

Because Safe and create/edit are both in V1, there is no DAO-only validation phase. V1 is the whole vertical.

| Track | Content |
| --- | --- |
| **Workspace core** | `Workspace` collection (W3) with account refs `{type, network, address, metadata?}`; wallet-signature-verified writes authorised against `getOwners()` / DAO permissions (W4's model); workspace metadata mirroring DAO metadata |
| **Aggregation re-key** | Denormalised indexed `accountKey` (K2) on `Proposal`, `Asset`, `Transaction`, `PluginMember` + backfill; sort keys moved to `blockTimestamp` with a new transaction index; fix the silent parent-only collapse |
| **Account layer** | `accountType` discriminator on `Dao` (A1) + synthetic `safe` plugin with `isBody`/`isProcess` (A3); audit every existing `Dao` query for the discriminator |
| **Safe indexing** | Safe rows in `Dao` per chain → assets/transfers free via `daoAddressCache`; owners + threshold → `PluginMember` + settings, normalised to the multisig shape; executed Safe transactions → `Proposal` rows; action decoding incl. MultiSend batches |
| **Safe live data** | Backend-proxied Safe Transaction Service client with API key, per-chain base URLs, caching and quota control; pending queue merged at the head (P4) |
| **Frontend** | `/workspace/…` route tree (F2) reusing the existing filter/tab machinery, re-sourced from the workspace; DAO account tabs expand to include child DAOs; network-aware proposal URLs |
| **Deferred** | Retire `linkedAccounts` once workspaces carry the same cases; optionally revisit an on-chain registry |

### Prerequisites, whichever options win

1. **Ship v3 as the default API version, or backport `linkedAccounts` to v2** — otherwise the reusable code
   path has no production mileage.
2. Fix the silent aggregation collapse when secondary filters are present.
3. Fix asset-aggregation attribution and pagination stability.
4. Add `parentAccount` to the frontend `IDao` so an account page can resolve upward.
5. Add a `blockTimestamp` index to `Transaction` and stop forcing `blockNumber` sort on aggregated proposals.
6. **Write tests for the `linkedAccount` machinery before reusing it.** It currently has none.

## Open product questions

1. **Same token across chains** — separate rows per network (today's grouping) or one combined line?
2. **Who may edit a workspace**, precisely: any Safe owner, a threshold of them, any DAO permission holder? And
   may an account be added without its consent, given the on-chain handshake is being dropped?
3. **Is a cached pending Safe queue acceptable** (staleness window) or must it be strictly live?
4. **Does "All proposals" need exact total counts**, or is an approximate count on page 1 acceptable?
5. **Chains supported at launch**, and what happens when a user adds an account on an unindexed chain?
6. **Must existing `/dao/…` URLs keep working indefinitely**, or is a redirect acceptable?
7. **Can the same account belong to several workspaces?** This affects uniqueness constraints and caching.

## Appendix — verified reference points

| Fact | Location |
| --- | --- |
| `IDao`, `ILinkedAccountSummary` | `apps/app/src/shared/api/daoService/domain/dao.ts` |
| `IDaoPlugin.isBody` / `isProcess` | `apps/app/src/shared/api/daoService/domain/daoPlugin.ts` |
| `PluginType.BODY \| PROCESS` | `apps/app/src/shared/types/enum/pluginType.ts` |
| Account filter tabs | `apps/app/src/shared/hooks/useDaoFilterUrlParam/` |
| Body/process filter tabs | `apps/app/src/shared/hooks/useDaoPlugins/`, `useDaoPluginFilterUrlParam/` |
| Composite id convention (`network-address`) | `apps/app/src/shared/utils/daoUtils/daoUtils.ts` (`resolveDaoId`, `parseDaoId`, `resolvePluginDaoId`) |
| Proposal slug and URL | `apps/app/src/modules/governance/utils/proposalUtils/proposalUtils.ts` |
| Safe brand identity enum | `apps/app/src/shared/api/daoService/domain/enum/permissionEntity.ts` |
| Safe branding assets | `apps/app/src/plugins/sppPlugin/constants/sppPluginBrandedExternals.ts` |
| Safe contract detection (frontend) | `apps/app/src/shared/hooks/useIsSafeContract/` |
| Feature flag definition | `apps/app/src/shared/featureFlags/featureFlags.constants.ts` |
| CMS source (read-only) | `apps/app/src/shared/api/cmsService/cmsService.ts` → `raw.githubusercontent.com/aragon/app-cms` |
| DAO linking via on-chain permissions | `app-backend/src/handlers/permissionHandler.ts` |
| Safe contract detection (backend) | `app-backend/src/helpers/pluginDetector.ts` |
| Cross-account aggregation + forced sort | `app-backend/src/services/aragon-api/controllers/{asset,transaction,proposal,policy}.ts` |
| Offset pagination | `app-backend/src/models/schema/proposal.ts::findWithPagination` |
| Index shapes (address-first, network-second) | `app-backend/src/models/schema/{proposal,asset,transaction,pluginMember}.ts` |
| Transfer crawler address source (per network) | `app-backend/src/modules/daoAddressCache.ts` |
| DAO metadata schema (whitelist parse) | `app-backend/src/types/daos.ts`, `src/helpers/web3Utils.ts::parseDaoMetadata` |
| Admin-only auth | `app-backend/src/middlewares/auth.ts` |
