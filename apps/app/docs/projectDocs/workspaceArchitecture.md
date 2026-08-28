# Workspace architecture — research and options

**Status:** research / pre-decision. Nothing here is implemented.
**Scope:** `aragon/app` (frontend) + `aragon/app-backend` (indexer & API).

## The goal

Introduce **Workspace** as a new top-level entity above the DAO. A Workspace holds:

- a list of **accounts** — a DAO is one account type, a Safe{Wallet} is a new one;
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

## Headline finding: a partial Workspace already exists

The `linkedAccount` feature flag already implements a parent-DAO + child-DAO hierarchy that covers a
large part of the target model. **BODY and PROCESS already exist as first-class concepts.** The missing
layer is ACCOUNT as an abstraction — today it is implicitly the DAO.

| Requirement | What already exists |
| --- | --- |
| Workspace contains multiple accounts | `IDao.linkedAccounts?: ILinkedAccountSummary[]` — `apps/app/src/shared/api/daoService/domain/dao.ts` |
| "All / per-account" filter on Assets & Transactions | `useDaoFilterUrlParam` builds exactly `All` / parent / one-tab-per-account, URL-synced, with an `onlyParent` flag. Rendered via `DaoFilterComponent`, `daoFilterAsideCard`, `linkedAccountInfo` |
| Members page deals with bodies | `PluginType.BODY` from `IDaoPlugin.isBody`; `daoMemberListContainer` already calls `useDaoPlugins({ type: BODY, includeSubPlugins: true, includeLinkedAccounts: true })` — one tab per body across all accounts, already the target shape |
| Proposals page deals with processes | `PluginType.PROCESS` from `IDaoPlugin.isProcess`; **the aggregated paginated "All proposals" list already exists** — `daoProposalList.tsx` group tab sends `onlyActive: true, includeLinkedAccounts: true` |
| Cross-account aggregation | Backend controllers expand `daoAddress` → `daoAddresses[]` and query Mongo with `$in`: `controllers/{asset,transaction,proposal,policy,plugins}.ts` |
| Per-account metadata (type + UI) | `ILinkedAccountSummary` (name/description/avatar/links/metrics) + `DaoInfoAside`, `LinkedAccountInfo`, `DaoHierarchy` |
| Per-account attribution | `DaoTargetIndicator` + `daoTargetUtils.findTargetDao` |
| Retargeting a per-tab query to the owning account | `daoUtils.resolvePluginDaoId` → `${network}-${plugin.daoAddress}` |

### Safe is already a recognised external body

This is not a greenfield integration. Safe awareness already ships:

- **Backend** — `PluginDetector.detectAddressType()` (`src/helpers/pluginDetector.ts`) reads contract
  bytecode, looks for the `masterCopy()` selector, and returns `VotingBodyBrandIdentity.SAFE | EOA | OTHER`.
  It is stamped onto `plugin.brandId` in `pluginSettingHandler.ts:479`.
- **Frontend** — `PermissionEntityExternalBrandId = { EOA, SAFE, OTHER }`
  (`shared/api/daoService/domain/enum/permissionEntity.ts`), `brandedExternals` with a `Safe{Wallet}`
  logo and label, `safeAccountAvatar.tsx`, rendering in the permissions graph, permission lists and
  SPP process details, plus `useIsSafeContract` gating the "external address as body" flow in
  `setupBodyDialog`.

**A Safe can already be an external voting body of an SPP stage.** What does not exist is Safe as an
*account* — with assets, transactions, indexed owners and proposals.

### Infrastructure that makes Safe-as-account unusually cheap

- `modules/daoAddressCache.ts` reads the **`Dao` collection**, and the transfer crawler matches every
  `Transfer` log against it. A Safe stored as a row in `Dao` gets **asset and transfer indexing for free**.
- `PluginMember` is keyed by `(memberAddress, daoAddress, pluginAddress, network)` — a Safe's owners fit
  this shape verbatim, so the existing members API works unchanged.
- `Plugin.interfaceType` is an enum (`IPluginInterfaceType`) — adding `safe` is additive.

## The five structural gaps

1. **No ACCOUNT abstraction.** `ILinkedAccountSummary` is a DAO summary, and the Mongo `Dao` document has
   no `type` field. Nothing in either repo can express "this account is a Safe".
2. **Membership is on-chain-permission-derived, so it can only ever contain OSx DAOs.**
   `handlers/permissionHandler.ts::handleDaoLinkingOnGrant` links two DAOs only when *both*
   `PARENT_TO_SUB_DAO_ACKNOWLEDGEMENT_PERMISSION_ID` and `SUB_DAO_TO_PARENT_ACKNOWLEDGEMENT_PERMISSION_ID`
   are granted. A Safe has no PermissionManager and can never emit those grants. This mechanism cannot be
   extended — it must be replaced or supplemented.
3. **The root is forced to be a DAO.** The id, the route, the metadata document and the aggregated metrics
   all belong to the parent DAO. The `onlyParent` flag exists precisely because the parent is simultaneously
   the workspace and an account.
4. **Aggregation is a single-network, single-Mongo-query design.** `network` is a scalar on every
   `*ExtraParams` type. Safe *pending* transactions come from a live external API and cannot join that `$in`.
5. **It is a local-only spike, not a foundation.** The `linkedAccount` flag is `defaultValue: false` with
   `environments: { local: true }`. Worse, the feature is v3-only in a v2-default world: the v2
   `getDaoDetails` projection omits `linkedAccounts`/`parentAccount`, and `DaoService.withPlugins`
   early-returns when the API version is v2. **On production this code has never run.** Every net-new
   linkedAccount hook and component ships without unit tests.

### Additional defects found in the existing aggregation

These are independent of which option is chosen and should be fixed either way.

- **Aggregation silently collapses to parent-only when any secondary filter is present.** It engages only
  when `hasOnlyDaoAndNetwork` holds — transactions require no `tokenAddress`/`fromAddress`/`toAddress`/`side`/`type`,
  proposals require no `pluginAddress`/`creatorAddress`/`isSubProposal`/`proposalIndex`/`incrementalId`.
  The transactions page's own filters therefore break aggregation, with no error and no signal to the client.
- **Three inconsistent gating conventions:** assets/transactions/policies use `onlyParent` (opt-out),
  proposals use `includeLinkedAccounts` (opt-in), plugins-by-dao aggregates always.
- **Asset aggregation destroys per-account attribution and pagination stability.** In aggregated mode the
  pipeline `$group`s by `(tokenAddress, network)` and skips the per-account `dao` `$lookup`; the `$group`
  drops `id`, so the `{amountUsd:-1, id:-1}` tiebreak degenerates and equal-value assets order
  non-deterministically across pages.
- **`parentAccount` is dropped at the client boundary.** The backend wire type carries it; the frontend
  `IDao` has no such field, so a child DAO's page cannot resolve upward to its parent.
- **Only `metrics.tvlUSD` is workspace-aggregated.** Members, proposalsCreated/Executed, votes and
  uniqueVoters stay parent-only, so any multi-account header stat is already wrong.
  `useDaoProposalsCount` additionally hard-codes `includeLinkedAccounts: false`.
- **`useFilterUrlParam` deletes its URL param on unmount**, so changing the account filter (which refetches
  the DAO under a different query key) transiently wipes the selection. `daoTransactionsPageClient` works
  around this; `daoAssetsPageClient` does not.
- **IPFS metadata `linkedAccounts`/`parentAccount` are dead code.** `Web3Utils.parseDaoMetadata` builds its
  result from an explicit whitelist that never reads them.

## Decision 1 — where do workspace membership and metadata live?

The backend has **no wallet-signature authentication of any kind** (zero `verifyTypedData`/`recoverAddress`/
`verifyMessage`); the only authenticated write path is admin-only TOTP/JWT (`middlewares/auth.ts::authAssertAdmin`).
This constrains every self-serve option.

| Option | How it works | Pros | Cons |
| --- | --- | --- | --- |
| **W1. On-chain Workspace registry** | New contract holds accounts + metadata CID; indexed like `daoRegistryHandler` | Same trust model as today; fully indexable by the existing pipeline; native permissions; verifiable; works for any account type | Contract dev + audit + deploy on every supported network; gas per create/edit; slowest to ship; must design workspace ownership |
| **W2. Root-DAO IPFS metadata** | Extend `IMetadata` (fields already exist, currently dead) | Zero new infra; metadata pipeline exists; edits are governance-gated | **Requires a DAO as root — cannot express a Safe-only workspace**; editing needs a governance proposal; single-network; keeps the `onlyParent` wart |
| **W3. Backend collection + authed write API** | New `Workspace` collection + REST writes | Instant edits; any account type; per-account metadata trivial; no gas; multi-network natural | **Requires net-new wallet-signature auth**; centralized and unverifiable; needs an authorization policy; new attack surface |
| **W4. Signed off-chain config (EIP-712)** | Config signed by an authorized signer; backend verifies against on-chain state (`getOwners` for a Safe, permissions for a DAO) | Verifiable without a contract; no gas; multi-network; authorization derives from state you can already read | Still needs signature-verification infra; replay/versioning/revocation design; multi-signer conflict resolution |
| **W5. CMS (`aragon/app-cms`)** | Workspaces as JSON in the existing GitHub-hosted CMS | **Literally zero new infra** — the app already reads `dao-overrides.json` keyed by DAO id; fastest possible validation | Not self-serve; Aragon is the editor; scales to tens, not thousands |

**Recommendation: W5 → W4 → (W1 if ever needed).** Validate the product shape on the CMS, then move to
signed off-chain config for self-serve, and only take on a contract if verifiability demands it.

> **Trust question this raises.** Today's linking requires *mutual on-chain consent*. Any off-chain
> membership source drops that, which means anyone could assert that your Safe or DAO belongs to their
> workspace. Whether an account must consent to joining — and how — is a product/security decision, not a
> detail. W5 sidesteps it (Aragon curates); W3/W4 must answer it explicitly.

## Decision 2 — how is an Account modelled?

| Option | Pros | Cons |
| --- | --- | --- |
| **A1. `accountType` discriminator on `Dao`; a Safe is a row in `Dao`** | Asset/transfer indexing **free** via `daoAddressCache`; every `daoAddresses` `$in` aggregation works unchanged; `PluginMember` works; `ILinkedAccountSummary` already shape-matches | Semantic violence; `Dao` has OSx-only required fields (`version`, `isSupported`); needs a migration; **every existing `Dao` query must be audited to filter `accountType: 'dao'`** or Safe rows leak into explore/metrics/sitemap. That audit is the real cost — but it is enumerable and testable |
| **A2. Separate `SafeAccount` collection, joined at the API layer** | Clean separation; no risk to existing DAO queries; Safe fields modelled honestly | Loses the free indexing; **converts already-solved problems (asset/transfer aggregation) back into two-source merges**; materially more backend work |
| **A3. Safe as a synthetic plugin (`interfaceType: 'safe'`, `isBody` + `isProcess`)** — composes with A1 or A2 | The entire slot/filter/tab machinery works unchanged; member and process filters appear automatically; matches "a Safe is a body and a process" exactly; precedent already exists (`brandId: SAFE`, SPP external bodies) | Must implement a subset of slots (multisig registers 22; a Safe needs roughly 12–14, skipping the create/install ones); no OSx release/build/version |
| **A4. `AccountProvider` capability-based adapter** | Honest abstraction; a third account type becomes cheap; capability flags handle "Safe has no delegation" gracefully | A second extension mechanism competing with the slot registry, which already *is* an adapter pattern; large upfront refactor for two account types |

**Recommendation: A1 + A3.** A Safe becomes a typed row in `Dao` plus a synthetic body/process plugin.
This is by far the highest reuse of existing machinery. The non-negotiable condition is a systematic audit
of every `Dao` query for the discriminator.

## Decision 3 — frontend migration shape

| Option | Verdict |
| --- | --- |
| **F1. Promote `linkedAccount` in place**, keep `/dao/…`, decouple the root | Smallest diff and full reuse of the filter machinery, but the root stays a DAO — so it does not deliver Safe-only workspaces, and the `onlyParent` wart persists |
| **F2. New `/workspace/…` route tree; a DAO page becomes a "workspace of one"** | **Recommended.** Clean URL semantics; existing `/dao/…` URLs keep working; page components are reused wholesale because they are already parameterised by a filter; a Safe-only workspace is expressible; no mass rename. Costs: two route trees during migration, a workspace-aware `getProposalUrl`, SEO/canonical work |
| **F3. Big-bang DAO→Account rename** | **Not viable.** 1031 of 2668 frontend files and 196 of 441 backend files reference `dao`; 555 of 2175 translation keys carry `dao` in their path; 199 files of per-DAO custom code live in `src/daos/`. Enormous, risky, and no user value on its own |

Note that `proposalUtils.getProposalUrl` currently links an aggregated linked-account proposal *out* to the
owning DAO's page (`/dao/<network>/<daoAddress>/proposals/<slug>`), and the slug is
`${plugin.slug}-${incrementalId}`. A Safe has no DAO page, no plugin slug and no `incrementalId` — only a
nonce and a `safeTxHash`. Proposal identity for Safe accounts needs an explicit design.

## Decision 4 — Safe proposals: the hardest problem

Established facts:

- Pending Safe transactions exist **only** in the Safe Transaction Service and cannot be derived from chain
  events; executed ones **can** (`ExecutionSuccess`, `SafeMultiSigTransaction`).
- The Safe Transaction Service uses **limit/offset pagination** — the same scheme as Aragon's backend
  (`ModelUtils.paginateAndSort`, `skip/limit`). Pending transactions are reachable via
  `GET /v1/safes/{address}/multisig-transactions/?executed=false`; `queued=true` (the default) includes
  `nonce >= current nonce`.
- **Unauthenticated use is 2 RPS and 5,000 requests/month**; production requires a paid API key. The key
  cannot ship to a browser, so **the backend must proxy** all Safe API traffic.
- Aragon's aggregated proposal list is one Mongo query with a **server-forced `blockNumber desc`** sort.
- The Safe service has known ordering defects in `all-transactions` (nonce not used as a secondary sort).

| Option | Pros | Cons |
| --- | --- | --- |
| **P1. Backend BFF merge per request** | Single client contract; centralized caching; key stays server-side | p99 latency tied to Safe's API; offset merge means over-fetching `offset+limit` from *both* sources at every page, growing with depth; quota burn per user request |
| **P2. Frontend merge** | No backend change | **Not viable at production scale** — cannot hold the API key, 2 RPS unauthenticated, breaks pagination and total counts. Acceptable only for a single-source per-Safe tab |
| **P3. Shadow-index the pending queue (poll + cache in Mongo)** | **Everything existing works unchanged** — the `$in` aggregation, offset pagination, sort keys, counts | Staleness window on new transactions and new signatures; polling cost scales with (#Safes × frequency) against the quota. Note this is a *cache with a TTL*, not a source of truth — a materially different claim from "we cannot index pending transactions", and worth re-testing as a product decision |
| **P4. Hybrid split: index history, live-fetch the bounded pending set** | **Recommended.** See below | Total counts approximate on page 1; a pathologically deep queue breaks the bounded assumption; still needs the backend proxy |

### Why P4 is the recommendation

The pending set and the historical set have opposite shapes. The pending queue is **bounded and small** —
it is exactly the transactions with `nonce >= currentNonce`, typically tens of items. History is large but
**on-chain and therefore indexable**.

So: index executed Safe transactions from chain events as `Proposal` rows, where they join the existing
`$in` aggregation natively. Fetch the pending set **live and whole** — one request per Safe, no pagination
needed — and merge it at the **head** of the list, on page 1 only.

This removes the merged-offset-pagination problem entirely: the live set never spans a page boundary, so
pages 2+ remain a single Mongo query with stable ordering. Safe API usage becomes one call per Safe per TTL,
which is bounded and cacheable — and P3 then becomes a natural optimisation of that same fetch rather than
a separate architecture. Mitigate the deep-queue case with a cap plus a "view in Safe" link.

## Recommended composite and phasing

| Phase | Content |
| --- | --- |
| **0 — validate** | CMS-defined workspaces (W5) + the `/workspace/…` route tree (F2), aggregating over DAO accounts only. Proves the product shape with near-zero infrastructure |
| **1 — Safe as an account** | A1 + A3: Safe rows in `Dao` with `accountType`, a synthetic `safe` plugin (`isBody` + `isProcess`), owners as `PluginMember`, assets/transfers free via `daoAddressCache`, executed Safe transactions indexed as proposals, pending via backend-proxied live fetch (P4) |
| **2 — self-serve** | W4 signed off-chain config + signature verification; create/edit workspace flows |
| **3 — optional** | W1 on-chain registry, if verifiability or decentralisation demands it |

### Prerequisites, independent of the chosen options

1. **Ship v3 as the default API version, or backport `linkedAccounts` to v2** — otherwise none of this runs
   in production.
2. Fix the silent aggregation collapse when secondary filters are present.
3. Fix asset-aggregation attribution and pagination stability.
4. Add `parentAccount` to the frontend `IDao` so an account page can resolve upward.
5. Decide whether scalar `network` becomes `networks[]` — a Safe on Base plus a DAO on Ethereum is the
   obvious use case, and it changes every list-query signature and the sort key.
6. **Write tests for the linkedAccount machinery before extending it.** It currently has none.

## Open product questions

1. Can a workspace hold accounts on **different networks**? This materially changes backend signatures and
   sort keys, and today's linking is structurally same-chain only.
2. Is a **Safe-only workspace** required in phase 1? If yes, W2 is eliminated.
3. **Who may edit a workspace, and must an account consent to joining?** Dropping the current bidirectional
   on-chain handshake introduces a squatting risk.
4. Is a **cached** pending Safe queue acceptable (with a staleness window), or must it be strictly live?
5. Does "All proposals" need **exact total counts**, or is an approximate count on page 1 acceptable?
6. Must existing `/dao/…` URLs keep working indefinitely, or is a redirect acceptable?

## Appendix — verified reference points

| Fact | Location |
| --- | --- |
| `IDao`, `ILinkedAccountSummary` | `apps/app/src/shared/api/daoService/domain/dao.ts` |
| `IDaoPlugin.isBody` / `isProcess` | `apps/app/src/shared/api/daoService/domain/daoPlugin.ts` |
| `PluginType.BODY \| PROCESS` | `apps/app/src/shared/types/enum/pluginType.ts` |
| Account filter tabs | `apps/app/src/shared/hooks/useDaoFilterUrlParam/` |
| Body/process filter tabs | `apps/app/src/shared/hooks/useDaoPlugins/`, `useDaoPluginFilterUrlParam/` |
| Plugin filtering by type / linked accounts | `apps/app/src/shared/utils/daoUtils/daoUtils.ts` |
| Proposal slug and URL | `apps/app/src/modules/governance/utils/proposalUtils/proposalUtils.ts` |
| Safe brand identity enum | `apps/app/src/shared/api/daoService/domain/enum/permissionEntity.ts` |
| Safe branding assets | `apps/app/src/plugins/sppPlugin/constants/sppPluginBrandedExternals.ts` |
| Safe contract detection (frontend) | `apps/app/src/shared/hooks/useIsSafeContract/` |
| Feature flag definition | `apps/app/src/shared/featureFlags/featureFlags.constants.ts` |
| CMS source | `apps/app/src/shared/api/cmsService/cmsService.ts` → `raw.githubusercontent.com/aragon/app-cms` |
| DAO linking via on-chain permissions | `app-backend/src/handlers/permissionHandler.ts` |
| Safe contract detection (backend) | `app-backend/src/helpers/pluginDetector.ts` |
| Cross-account aggregation | `app-backend/src/services/aragon-api/controllers/{asset,transaction,proposal,policy}.ts` |
| Offset pagination | `app-backend/src/models/schema/proposal.ts::findWithPagination` |
| Transfer crawler address source | `app-backend/src/modules/daoAddressCache.ts` |
| Member document shape | `app-backend/src/models/schema/pluginMember.ts` |
| DAO metadata schema (whitelist parse) | `app-backend/src/types/daos.ts`, `src/helpers/web3Utils.ts::parseDaoMetadata` |
| Admin-only auth | `app-backend/src/middlewares/auth.ts` |
