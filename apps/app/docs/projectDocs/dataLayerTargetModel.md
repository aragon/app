# Data-layer target model and capacity budget

Companion to the [data-layer migration ADR](./dataLayerMigration.md): where every read the app makes lands, what the indexer and the domain end up holding, the store for user data, and whether the hosting plan carries it. Ticket: [APP-1318](https://linear.app/aragon/issue/APP-1318).

- **Status:** draft for the review call (DevOps, Cecir, Milos), 2026-11-04. Decisions marked **(call)** are proposals until that call; everything else follows the ADR and the legacy audit.
- **Inputs:** legacy audit [aragon-indexer `docs/legacy-audit.md`](https://github.com/aragon/aragon-indexer/blob/main/docs/legacy-audit.md) (merged 2026-11-02, app-backend `f072b7f` plus the `development` routes); app `main` `553b9985b` service URL maps; indexer `main` `config.yaml` and `schema.graphql`; production counts read through the public proxy on 2026-11-04; [Envio hosting pricing](https://envio.dev/pricing/hosting) and [HyperSync networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks) on the same day.
- **Measured on 2026-11-05** on the current endpoint (`1c70633`, ready since 2026-10-07): `_meta` and the row count of every entity, see [budget per limit](#budget-per-limit). **Not measured yet:** rows per legacy collection, transfer counts, the resync time, request rate on the proxy. The [measurements](#measurements) section says who takes them; the budget states its assumptions where it uses an estimate.
- **Lean by default.** The indexer gets what the app reads and nothing for a feature that is off, has four installs, or can be answered by one RPC call. [What stays out](#what-stays-out-of-the-indexer) lists the cuts; each slice ticket adds an entity only with a consumer row in the target model.

## Layers

The ADR's two layers, with the names used below.

| Layer | Holds | Serves |
|---|---|---|
| **indexer** (aragon-indexer, Envio) | chain facts at the event's block, IPFS metadata by CID, counters kept in the event's handler | GraphQL to the domain only |
| **domain** (`@aragon/aragon-domain`) | use cases and DTOs over the indexer; business rules (reward splits, voting power at a time, membership) | the BFF, in-process |
| **BFF** (`apps/app` server: `/api/backend` fork and `AragonBackendService`) | live reads (RPC, ENS, prices, explorers, Safe service, Tenderly) behind a cache; the per-route fork and flags | the UI, legacy JSON shape |
| **store** (small, off-chain) | data users and admins write: Telegram, campaign uploads, saved simulations, spam scores, TVL snapshots | the BFF |
| **cms** (`aragon/app-cms`) | curated lists: hidden DAOs, spam tokens, featured DAOs, overrides, flags | the BFF, cached 600 s |

### Why no backend service

On 2026-10-07 Jota proposed three layers: Envio for raw data, a backend with its own models, database and GraphQL, and the app on top. The ADR settled on two.

- A third layer would be app-backend again: a second database, a second deploy, a second schema, its own alerts, and a lag between the indexer and that database. Envio Cloud has no change feed, so the backend would poll GraphQL to keep up.
- The models already have a home. State that follows from events (tallies, counters, membership, settings at a block) is computed once in the event handler and read for free. Business rules live in `@aragon/aragon-domain` as use cases over the indexer, one owner per module.
- What Jota was right about is in the plan: a model map before the slices (this document), the audit instead of a copy of the old code, volatile sources read at request time behind a cache, one owner per module.
- What a backend would still have to do fits in a few route handlers and a few tables, the store above. Telegram, campaign uploads, saved simulations, spam verdicts and TVL snapshots are written and read by the BFF.

A resync on every deploy is the price of this shape. The effect cache and the previous deployment serving during the sync keep it to hours; the budget below measures it.

## Target model

Every app-backend path the app calls, from the app's service URL maps (50 paths; the audit's 41 at the baseline plus the 4 Safe and 5 workspace routes). The app's own routes (`/api/backend`, `/api/domain`, `/api/governance`, `/api/rpc`, `/api/safe`) are the BFF and are not rows here. Verdicts are the audit's; this table adds the entity or use case and the milestone.

Legend for "Target": `indexer` entity in `schema.graphql`; `domain` use case; `BFF` read-time handler with cache; `store` table; `cms` file. Milestones are the ADR's; tickets are the thin slice tickets that own the row, with proposals in [re-triage](#re-triage-of-m2m5).

### DAOs and plugins

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/daos` | `daoExplorerService.getDaoList` | indexer + store + cms | `Dao` with counters, search on stored `name`; hidden ids from `cms`; default TVL sort from `store.dao_tvl` ([decision 1](#decisions-on-the-open-rows)); `GetDaoList` | M3 [APP-1319](https://linear.app/aragon/issue/APP-1319) |
| `GET /v2/daos/member/:address` | `daoExplorerService.getDaoListByMemberAddress` | indexer | membership rows (`ERC20VotesDelegate`, `PluginMember`, `VELock`, `LockToVoteMember`) joined to `Plugin` and `Dao`; Safe bodies skipped ([decision 5](#decisions-on-the-open-rows)); `GetDaosByMember` | M3 APP-1319 |
| `GET /v3/daos/:id` (v2 unused) | `daoService.getDao` | indexer + BFF + store | `Dao`, counters, linked accounts from `Permission`; TVL from `store.dao_tvl`; `GetDao` | M3 APP-1319 |
| `GET /v3/daos/:network/ens/:ens` | `daoService.getDaoByEns` | indexer | `Dao.subdomain`; same use case | M3 APP-1319 |
| `GET /v2/plugins/by-dao/:network/:address/details` | `pluginsService.getPluginsByDao` | indexer + BFF | `Plugin`, `PluginContract`, `PluginSettings` (current), `PluginMetadata` (slug derived), SPP children; token supply live; `GetDaoPlugins` | M2 settings ([APP-1192](https://linear.app/aragon/issue/APP-1192) for SPP), M3 route |
| `GET /v2/policies/:network/:daoAddress` | `daoService.getDaoPolicies` | deferred | `capitalFlowAutomation` is off in production; nothing is indexed until the feature is scheduled ([what stays out](#what-stays-out-of-the-indexer)) | with the feature, or dropped at M5 |
| `GET /v2/permissions/:network/:daoAddress` | `daoService.getDaoPermissions` | indexer + BFF | `Permission` (current grants), `Condition`, `SelectorPermission`; SPP rule `getRules()` live; `GetDaoPermissions` | M3 |
| `GET /v2/execute-selectors/:network/:pluginAddress` | `executeSelectorsService.getAllowedActions` | indexer + BFF | `SelectorPermission` by condition ([decision 4](#decisions-on-the-open-rows)); decode live; `GetAllowedActions` | M3 |
| `GET /v2/plugins/installation-data` | `settingsService.getPluginInstallationData` | indexer | `PluginSetup` (the applied prepare); `GetPluginSetup` | M3 |
| `GET /v2/plugins/logs/:pluginAddress/:network/:event` | `settingsService.getLastPluginEventLog` | indexer | latest `PluginSetup` of that action; same use case; no settings history is built for it | M3 ([APP-1193](https://linear.app/aragon/issue/APP-1193), see re-triage) |

### Members

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/members` | `governanceService.getMemberList` | indexer + domain | token voting: `ERC20VotesDelegate` + `ERC20VotesToken` counters, `GetTokenVotingMembership` (built, [app#1128](https://github.com/aragon/app/pull/1128)); multisig and admin: `PluginMember`, `GetPluginMembership`; VE: `VELock` + curve, `GetVeMembership`, sort by voting power at `now` ([decision 8](#decisions-on-the-open-rows)); lock to vote: `LockToVoteMember`; Safe bodies: owners live over RPC ([decision 5](#decisions-on-the-open-rows)) | M1 token voting ([APP-1172](https://linear.app/aragon/issue/APP-1172), [APP-1180](https://linear.app/aragon/issue/APP-1180)); M2 others ([APP-1181](https://linear.app/aragon/issue/APP-1181), [APP-1101](https://linear.app/aragon/issue/APP-1101)) |
| `GET /v2/members/:address` | `governanceService.getMember` | indexer + BFF | `MemberGovernanceMetrics`, `Delegation` counts; ENS, balance, voting power, delegate live; `GetMember` | M2 [APP-1184](https://linear.app/aragon/issue/APP-1184) |
| `GET /v2/members/:memberAddress/:pluginAddress/exists` | `governanceService.getMemberExists` | indexer | membership rows; `CheckMembership` | M2 APP-1184 |
| `GET /v2/members/:address/locks` | `locksService.getMemberLocks` | indexer | `VELock`; `GetMemberLocks` | M2 APP-1101 |
| `GET /ipfs/delegate-statement/:cid` | `delegateStatementService.getDelegateStatement` | BFF | IPFS by CID, cached for good | M3 [APP-1320](https://linear.app/aragon/issue/APP-1320) |

### Proposals and votes

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/proposals` | `governanceService.getProposalList` | indexer + BFF | `Proposal` with tallies, `ProposalMetadata`, SPP children; creator ENS live; `GetProposals` | M2 [APP-1183](https://linear.app/aragon/issue/APP-1183) |
| `GET /v2/proposals/slug/:slug` | `governanceService.getProposalBySlug` | indexer | `Proposal` by DAO, plugin slug and `incrementalId` (chain order); `GetProposalBySlug` | M2 APP-1183 |
| `GET /v2/proposals/:id/actions` | `governanceService.getProposalActions` | indexer + BFF | raw actions on `Proposal`; decoding live, `decoding` replaced by a decode result with its own failure state | M2 raw, M3 decode (APP-1320) |
| `GET /v2/proposals/can-create-proposal` | `governanceService.getCanCreateProposal` | BFF | RPC per family with settings from the domain; errors are errors | M3 APP-1320 |
| `GET /v2/votes` | `governanceService.getVoteList` | indexer + BFF | `Vote` (every event kept, current vote derived); voter ENS live; `GetVotes` | M2 [APP-1182](https://linear.app/aragon/issue/APP-1182) |
| `GET`/`POST /v2/simulations/proposal/:proposalId` | `actionSimulationService` | BFF + store | Tenderly live; result and 10-minute throttle in `store.proposal_simulation` (`none`, `success`, `failed`) | M3 APP-1320 |
| `POST /v2/simulations/:network/dao/:daoAddress/simulate`, `.../plugin/:pluginAddress/simulate` | `actionSimulationService` | BFF | Tenderly live; plugin check from the domain | M3 APP-1320 |
| `POST /v2/simulations/:network/cross-chain/:controllerAddress/gas-limit` | `crossChainControllerService.estimateGasLimit` | BFF | lane reads and Tenderly; shared cache and hourly budget in Redis | M3 APP-1320 |
| `POST /simulations/:network/dispatch/:policyAddress` | `daoService.simulateDispatch` | BFF | Tenderly; policy and linked accounts from the domain; unknown address stays unknown | M4 (capital flow) |

### Decoding

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/contract/:network/:address` | `smartContractService.getAbi` | BFF | explorer source and proxy read, cached; unverified and failed are told apart | M3 APP-1320 |
| `POST /v2/contract/:network/:address/decode` | `smartContractService.decodeTransaction` | BFF | one action, live | M3 APP-1320 |
| `POST /v3/contract/:network/decode-batch` | `smartContractService.decodeTransactionsLight` | BFF | batch, nested execute to depth 3 | M3 APP-1320 |

### Treasury

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/assets` | `financeService.getAssetList` | indexer + BFF + store | token set per DAO from `DaoToken` (written by transfers); balances by multicall and prices live; spam from `store.token_spam`; sort and page in memory over the set ([decision 1](#decisions-on-the-open-rows)); `GetDaoAssets` | M3 APP-1320 |
| `GET /v2/tokens/:network/:address` | `financeService.getTokenInfo` | BFF | name, symbol, decimals, supply over RPC; price live; nothing written | M3 APP-1320 |
| `GET /v2/transactions` | `financeService.getTransactionList` | indexer + BFF + store | `Transfer` (native, ERC20, ERC721, both sides, `failureMap` honoured) and `Execution`; spam exclusion from `store.token_spam` bounded by the DAO's token set ([decision 2](#decisions-on-the-open-rows)); USD live; `GetDaoTransactions` | M3 APP-1320 (indexer entities: see re-triage) |
| `GET /v2/transactions/:network/:id/actions` | `financeService.getTransactionActions` | indexer + BFF | `Execution` raw actions and proposal link (slug derived); decode live | M3 APP-1320 |
| `GET /v2/transactions/:network/:transactionHash/status` | `transactionService.getTransactionStatus` | domain | row by transaction hash across `Dao`, `Proposal`, `Vote`, `VELock`, `Plugin`, plus `_meta` progress; `GetTransactionStatus` | M2, with the first domain-served write path (see re-triage) |

### Gauges and rewards (gauge voter plugin)

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/gauge/:pluginAddress/:network` | `gaugeVoterService.getGaugeList` | indexer + BFF | `Gauge`, `GaugeEpochMetrics` (totals from `Voted`/`Reset`, vote count derived); epoch id by clock math or RPC; `GetGauges` | M4 |
| `GET /v2/gauge/epochMetrics/:pluginAddress/:network` | `gaugeVoterService.getEpochMetrics` | BFF | RPC reads at `latest` | M4 |
| `GET /v2/gauge/gaugeRewards/:pluginAddress/:network/:epochId` | `gaugeVoterService.getGaugeRewardDistribution` | domain | split over `GaugeVote` stored voting power; `ComputeGaugeRewards` | M4 |
| `GET /v2/gauge/rewards/:pluginAddress/:network/:epochId` | `gaugeVoterService.getRewardDistribution` | domain | split over `GaugeVote`, `VEDelegation` rows and `VELock` with the curve from `VESettings` ([decision 9](#decisions-on-the-open-rows)); `ComputeVeOwnerRewards` | M4 |
| `GET /v2/tokens/rewards/:pluginAddress/:network` | `tokenRewardService.getRewardDistribution` (Cryptex) | domain | over `Proposal`, `Vote`, `VEDelegation`, `VELock`; the DAO start block moves from backend env to domain config; `ComputeGovernanceRewards` | M4 |

### Capital distributor

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /capital-distributor/campaigns` | `capitalDistributorService.getCampaignList` | indexer + store | `Campaign` (state, root, metadata, claimed totals derived), `CampaignClaim`; the user's allocation, proof and leaf from `store.campaign_allocation`; `GetCampaigns` | M4 |
| `POST /capital-distributor/campaign/upload` | `campaignService.uploadCampaignMembers` | BFF + store | the route validates the list, builds the merkle tree and writes `store.campaign_upload` and `store.campaign_allocation` | M4 |
| `GET /capital-distributor/campaign/prepare/status` | `campaignService.getCampaignPrepareStatus` | store | `store.campaign_upload` (root, member count) | M4 |

### Safe (`safeAccountPage` flag, off above preview)

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/safe/:network/:address/info` | `safeService.getSafeInfo` | BFF | RPC through the existing `/api/safe` proxy, cached | M3 APP-1320 |
| `GET /v2/safe/:network/:address/queue` | `safeService.getSafePendingTransactions` | BFF | Safe Transaction Service, cached with a call budget; SPP reports from the domain | M3 APP-1320 |
| `GET /v2/safe/:network/:address/next-nonce` | `safeService.getSafeNextNonce` | BFF | live nonce plus live queue, never cached | M3 APP-1320 |
| `GET /v2/safe/:network/:address/history` | `safeService.getSafeTransactionHistory` | BFF | Safe Transaction Service, cached | M3 APP-1320 |

Safe owners as members (`GET /members`, `/exists`) are read live for the Safe bodies a DAO names ([decision 5](#decisions-on-the-open-rows)). The stored Safe transaction copy, manual tracking and the two routes without a caller are dropped.

### Workspaces (`workspaces` flag, off above local)

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `POST /v2/workspaces/query/accounts` | `workspaceQueryService.getAccounts` | indexer + BFF | `Dao` by `(network, address)`; Safe info live | M3 |
| `POST /v2/workspaces/query/assets` | `workspaceQueryService.getAssetList` | indexer + BFF | `GetDaoAssets` per selected account, merged and paged in memory; bounded by the selection | M3 |
| `POST /v2/workspaces/query/members` | `workspaceQueryService.getMemberList` | indexer + domain + BFF | membership rows with `dao _in` selection, cap of 1 000 per plugin kept; owners of selected Safes live | M3 |
| `POST /v2/workspaces/query/proposals` | `workspaceQueryService.getProposalList` | indexer + BFF | one `Proposal` query with `dao _in` selection; Safe queues live, outside the page | M3 |
| `POST /v2/workspaces/query/transactions` | `workspaceQueryService.getTransactions` | indexer + store | one `Transfer`/`Execution` query with `dao _in` selection; spam as in `GET /transactions`; `internal` flag computed | M3 |

Cross-account reads ([decision 10](#decisions-on-the-open-rows)) are one indexer query where the data is indexed and a fan-out only for live data; the coverage flags (`partial`, `unavailable`) stay.

## What stays out of the indexer

Cuts against a one-for-one port, so the new indexer carries no legacy weight. Each line names where the need is served instead.

| Not indexed | Why | Served by |
|---|---|---|
| Policies, router and claimer settings, dispatch simulation (capital flow) | `capitalFlowAutomation` is off in production; no consumer until the feature ships | nothing until then; the legacy route goes with the flag at M5, or a slice ticket adds `PolicySettings` when the feature is scheduled |
| Safe owners and thresholds | 4 Safe bodies exist on all networks together; `safeAccountPage` is off above preview | `getOwners()` and `getThreshold()` live in the BFF for the Safe bodies a DAO names; DAOs by member skips Safe bodies |
| VE lock checkpoints | voting power of an increasing escrow at any time is arithmetic over the lock's amount and start and the curve parameters captured once at install ([APP-1101](https://linear.app/aragon/issue/APP-1101)) | the domain, from `VELock` and `VESettings`; `VEDelegation` stays as plain event rows |
| Settings history per plugin | the app reads current settings and the latest PSP setup only | `PluginSettings` (current) and `PluginSetup` |
| Metadata history rows beyond what is built | the app reads the `ACTIVE` row only; `DaoMetadata` and `PluginMetadata` history is kept because it exists and is cheap, nothing else gets a history table | the `ACTIVE` row |
| Workspace entities | compositions over DAO, proposal, transfer and membership rows; the flag is off above local | the domain and the BFF |
| Events of unknown plugin families (652 plugins) | nothing decodes them; registration keeps the install status only | `Plugin` row with `UNKNOWN` |
| ERC721 transfers (candidate) | legacy indexes them, the finance module has no NFT code; confirm with product before the treasury slice | nothing, if confirmed |
| The four small testnets (BNB testnet, Hoodi, Base Sepolia, Polygon Amoy: 13 DAOs) | QA networks for OSx 1.4, no product traffic | app-backend until M5; then one config change if someone needs them in the domain, otherwise dropped from the app |
| Hemi | not on HyperSync, 4 DAOs | RPC source inside the production indexer ([APP-1191](https://linear.app/aragon/issue/APP-1191)) or app-backend until M5 |
| Prices, balances, ENS, ABIs, decoded actions, simulations, Safe queues, token supply | volatile | the BFF, cached |
| Telegram, campaign uploads, saved simulations, spam verdicts, TVL, hidden DAOs | not chain facts | the [store](#the-store-for-user-data) and app-cms |
| Rebuilding counters legacy had but the UI does not show | only the counters on explore cards, the DAO header, the proposal tally and the member detail are kept | the slice ticket lists each counter with its UI consumer |

## Indexer entities

What `schema.graphql` holds when the model is complete, by owner module. Existing entities keep their names (ADR, "Entity contract and cutover"). Counters are fields on the entity, written in the handler of the event that changes them (audit verdict `derived`).

| Module | Entities | Source events | Registration | Milestone |
|---|---|---|---|---|
| dao | `Dao` (+ counters: proposals, executed, members, votes, unique voters), `DaoMetadata` | `DAORegistered`, `MetadataSet` | `DAORegistry` static; `DAO` dynamic on `DAORegistered` | built; counters M2–M3 |
| plugin | `PluginRepo`, `Plugin` (+ `isProcess`, `isBody`, `isSupported`, slug, `memberCount`), `PluginContract`, `PluginSetup`, `PluginMetadata`, `PluginSettings` (current, per family) | PSP events, `MetadataSet`, family settings events | `PluginSetupProcessor` static; plugin events on the union `OSxPlugin` contract, dynamic on `InstallationPrepared` **or wildcard (call)** | built; settings M2 |
| tokenVoting | `ERC20VotesToken` (+ delegate counters), `ERC20VotesDelegate`, `Delegation`, `MemberGovernanceMetrics` | `DelegateVotesChanged`, `DelegateChanged`, `VoteCast`, `ProposalCreated` | token dynamic on `InstallationPrepared` of a token-voting plugin; `ERC20Votes` wildcard filtered by registered tokens ([APP-1172](https://linear.app/aragon/issue/APP-1172)) | M1 |
| membership | `PluginMember` (multisig, admin), `LockToVoteMember` | `MembersAdded`/`Removed`, `Granted`/`Revoked` of `EXECUTE_PROPOSAL_PERMISSION`, lock-manager events | plugin events; lock manager dynamic from settings | M2 |
| ve | `VELock` (amount, start, exit and withdraw times), `VEDelegation` (one row per delegate or undelegate event, per token id), `VESettings` (curve parameters at install) | escrow, exit queue, adapter events | escrow, queue, adapter, clock dynamic from settings | M2 ([APP-1101](https://linear.app/aragon/issue/APP-1101)) |
| proposal | `Proposal` (+ tallies, `incrementalId`, settings snapshot, total supply at snapshot block), `ProposalMetadata`, `Vote`, `SppStage`, `SppSubProposal` | `ProposalCreated`, `VoteCast`, `Approved`, executed, canceled, edited, SPP events | plugin events | M2 |
| permission | `Permission` (current grants per DAO), `Condition`, `SelectorPermission` (per condition, selector, target, chain) | `Granted`, `Revoked`, `SelectorAllowed`/`Disallowed` | DAO events; selector events **wildcard** ([decision 4](#decisions-on-the-open-rows)) | M3 |
| treasury | `Transfer`, `Execution`, `DaoToken` (tokens a DAO has ever held, for the asset read) | `Transfer` with `to`/`from` in registered DAOs (`where` filter), `NativeTokenDeposited`, `Executed` | wildcard `Transfer` filtered by `chain.DAO.addresses`; DAO events | M3 |
| gauge | `Gauge`, `GaugeVote` (every `Voted`/`Reset`, persistent flag from settings at the event's block), `GaugeEpochMetrics` | gauge voter events | plugin events | M4 |
| campaign | `Campaign` (+ `totalClaimed`, `claimCount`), `CampaignClaim` | `CampaignCreated`, `MerkleCampaignSet`, `PayoutClaimed` | plugin events | M4 |
| cross-chain | controller settings on `PluginSettings` | controller settings events | plugin events | M2 with settings |
| ens | `Domain`, `ENSResolver`, `TextRecord` | `Registered`, `ProfileMoved`, `TextChanged`, `VersionChanged` | static, mainnet | built |

**Not indexed, by rule:** USD values, prices, balances at `latest`, ENS reverse names, explorer ABIs, decoded actions, Tenderly results, Safe owners, queues and history, policy settings until capital flow ships, anything a user uploads.

## Domain use cases

By milestone, the public surface of `@aragon/aragon-domain`. Today: `GetTokenVotingMembership`, `GetMemberProfileTextRecords`.

- **M1:** `GetIndexerStatus`, `SupportedChains` from `_meta` ([APP-1176](https://linear.app/aragon/issue/APP-1176)); counter-based totals.
- **M2:** `GetPluginMembership` (multisig, admin, lock to vote), `GetVeMembership`, `GetMember`, `CheckMembership`, `GetMemberLocks`, `GetVotes`, `GetProposals`, `GetProposalBySlug`, `GetTransactionStatus`, `GetDaoPlugins` (settings part).
- **M3:** `GetDaoList`, `GetDao`, `GetDaosByMember`, `GetDaoPermissions`, `GetAllowedActions`, `GetPluginSetup`, `GetDaoTransactions`, `GetDaoAssets` (token set), the workspace compositions.
- **M4:** `GetGauges`, `ComputeGaugeRewards`, `ComputeVeOwnerRewards`, `ComputeGovernanceRewards`, `GetCampaigns`, `GetDaoPolicies`, `GetProposalEvents` (proposals created, executed and ending in a window, for Telegram).

With two indexer endpoints ([capacity](#capacity-budget)), `AragonDomain.load` takes an endpoint per chain set instead of one `EnvioClient`; `SupportedChains` is the union of both `_meta`s. One line in the domain, no change in the use cases.

## BFF read-time handlers

| Handler | Upstream | Cache (Redis) | Replaces |
|---|---|---|---|
| ENS primary name and avatar | RPC (mainnet) | 1 h per address | `member.ens`, `ensValidator` |
| Token metadata and supply | RPC | 10 min per token | `tokenInfo`, `tokenTotalSupply` |
| Prices | CoinGecko | 5 min per token, served with its age | `fetchRates` |
| Balances | RPC multicall | 60 s per DAO | `daoAssets`, `asset` |
| Explorer ABI and source | Etherscan-family APIs | 24 h per address; unverified cached too | `contract`, `contractInfo` |
| Action decoding | ABI cache + RPC | per action hash | `contractDecoder`, `proposalActions`, `executionActions` |
| Simulations | Tenderly | result in `store.proposal_simulation`; gas-limit budget counters in Redis | `simulations`, `crossChainGasCache` |
| Can create proposal, member balance and delegate, gauge epoch info, SPP rules | RPC | 30 s | `canCreateProposal`, `memberBalance`, `gaugeInfo`, `sppRuleCondition` |
| Safe info, queue, history, next nonce | RPC and Safe Transaction Service through `/api/safe` | 60 s info and history, 15 s queue, nonce uncached | `safeRead`, `safeCache` |
| IPFS by CID (delegate statements) | gateway | forever | `GET /ipfs/delegate-statement` |

Every handler returns an error for a failed upstream read; nothing stores a failure as a value (audit, C2).

## The store for user data

**Decision (call):** one Postgres database, provisioned through the Vercel Marketplace (Neon) in the `aragon-app` scope, the same path the assistant used for Upstash and Blob; credentials in the `kv_app_<env>` vaults. The BFF is its only writer. Upstash Redis, already provisioned for the assistant, is the BFF cache; a second database for the app is one more Marketplace item. Curated lists stay in `aragon/app-cms`.

| Data | Today | Target | Milestone |
|---|---|---|---|
| Telegram subscriptions, consent, notified-event markers | `telegramSubscription`, `telegramNotifiedEvent` (Mongo), bot process with RabbitMQ | `telegram_subscription`, `telegram_notified_event`; bot as a webhook route in the app; a scheduled tick (Vercel Cron, 1 min; GitHub schedule as the fallback the assistant uses) reads `GetProposalEvents` since a stored cursor and the ending-soon window, renders and sends with per-recipient dedupe. No outbox, no queue ([decision 6](#decisions-on-the-open-rows)) | M4 |
| Campaign uploads: allocation list, merkle root, proofs, leaves | `campaignReward`, `campaignMerkleRoot`; tree built by a gateway worker | `campaign_upload`, `campaign_allocation`; the upload route builds the tree (lists are thousands of rows, well inside a route's limits) | M4 |
| Saved proposal simulation | `proposal.simulation` | `proposal_simulation` (`none`, `success`, `failed`, url, run at) | M3 |
| Token spam decision | `token.isSpam` (CMS sync and CoinGecko scoring jobs) | `token_spam` (network, address, verdict, source, scored at), written by a scheduled scorer over tokens the indexer has seen, with the CMS list as an override ([decision 2](#decisions-on-the-open-rows)) | M3 |
| DAO TVL snapshot | `dao.metrics.tvlUSD` by queue | `dao_tvl` (network, dao, usd, computed at), hourly for DAOs with a token set ([decision 1](#decisions-on-the-open-rows)) | M3 |
| Hidden DAOs | `dao.isHidden` by admin API | `hidden-daos.json` in app-cms, next to `spam-tokens.json` and `dao-overrides.json` ([decision 3](#decisions-on-the-open-rows)) | M3 |

Why not the alternatives: a slim Mongo Atlas keeps the vendor and the legacy models M5 wants gone; Redis alone has no ordered TVL query, no per-user allocation lookup across campaigns and no audit trail for consent; Vercel Blob has no per-row lookup. Volume is small: hundreds of subscriptions, tens of thousands of allocation rows, under 20 000 spam and TVL rows.

Before app-backend stops (M5), one export carries live rows over: subscriptions with consent versions, allocations of campaigns that are on chain, saved simulations, the `isHidden` list, CMS-sourced spam marks. Scored spam marks and TVL are recomputed.

## Decisions on the open rows

The audit's 46 `open` rows come down to ten decisions. Proposals, pending the call where marked.

1. **USD value and TVL (call).** Assets: the holding set per DAO comes from the indexer (`DaoToken`), balances and prices are live, the BFF sorts and pages in memory; the set is small (tens to a few hundred tokens). DAO TVL: an hourly snapshot in `store.dao_tvl` for DAOs with a token set, computed by a scheduled job in the app from the same balance and price handlers. The explore default sort reads a page of DAO ids ordered by `dao_tvl` and the rows from the indexer by `id _in`; a search or any other sort is indexer-driven and TVL is decorated. Alternative for product: make the explore default sort an index-time counter and show TVL unsorted.
2. **Spam filter.** Spam is a verdict per token in `store.token_spam`: the CMS list wins, a scheduled scorer (CoinGecko presence, name and balance heuristics as today) fills the rest for tokens the indexer has seen. The transfers query excludes spam with `token _nin` bounded by the DAO's `DaoToken` set, so counts and pages stay correct; assets are filtered in memory. `refreshSpamTokens` and `syncCmsSpamTokens` become that one scorer.
3. **DAO visibility.** `hidden-daos.json` in app-cms (`network-address` ids with a comment), read with the other CMS files. The BFF excludes the ids in list queries (`id _nin`) and returns 404 on detail and ENS lookups. The current `isHidden` set is exported once into the file; the admin API route goes.
4. **Condition history.** `SelectorAllowed` and `SelectorDisallowed` are indexed wildcard, keyed by condition address, from the chain start block. A condition's rows exist before any plugin grants it, so there is no backfill and no discovery problem; the plugin link is added when the grant appears. The native-transfer allow events of conditions go the same way.
5. **Safe.** Everything Safe is read time. The four reads the app calls stay live in the BFF through the existing `/api/safe` proxy; owners and threshold of the Safe bodies a DAO names (4 on all networks today) come from `getOwners()` and `getThreshold()` over RPC, cached, which serves the Safe branch of the member list and the membership check. DAOs by member skips Safe bodies. The stored Safe transaction copy, its refresh, manual tracking and the two routes without a caller are dropped; nothing indexes Safe events. If Safe bodies become common, a `SafeOwner` entity is one slice ticket.
6. **Telegram (call).** The bot moves into the app as a webhook route backed by the store; one scheduled tick replaces the outbox job, the queue, the dead letter and the ending-soon job: it asks the domain for proposals created, executed and ending in the window since its cursor, dedupes per recipient in `telegram_notified_event` and sends. Backfills and resyncs cannot trigger it because it reads by block cursor, not by handler. Privacy commands (`/mydata`, `/forget`) keep their semantics on the new tables.
7. **Metadata retry.** The indexer retries failed IPFS fetches with its interval handler ([APP-1260](https://linear.app/aragon/issue/APP-1260)); the BFF never refetches and the `metadataRefetch` queue and job go.
8. **VE voting power sort (call).** Voting power of an increasing escrow lock at any time is arithmetic over the lock's amount and start and the curve parameters captured at install (`VESettings`), so nothing beyond `VELock` is stored. The member list of a VE plugin is read in full (pages of 1 000), voting power computed at the request time, sorted and paged in memory; the largest plugin's member set bounds the read and is measured first. If it is above a few thousand, the fallback is a sort by locked amount (index time) with voting power shown.
9. **Historical lock voting power.** The same arithmetic gives `votingPowerAt(t)` for a lock that existed at `t` (exit and withdraw times are on the row), so rewards are domain computations over `VELock`, `VEDelegation` and `GaugeVote` and no archive RPC is needed. `GaugeVote` carries the voting power cast, as the event does. Legacy's receipt re-reads existed only to check its own stored totals.
10. **Workspace reads.** Proposals, transfers and members are one indexer query each with the selection as `dao _in`; the per-plugin member cap of 1 000 stays; assets, Safe owners and Safe queues fan out live, bounded by the selection size. Coverage flags are kept so the UI can say `partial`.

## Capacity budget

### Plan limits

Envio Cloud hosting, read on 2026-11-04. Effect API cache from Medium up. The indexer runs on Production Medium today.

| | Development | Production Small | Production Medium | Production Large | Dedicated |
|---|---|---|---|---|---|
| Price per month | $0 | $70 | $300 | $800 | custom |
| Indexing hours included | 750 | 800 | 800 | 800 | custom |
| Extra indexing hour | – | $0.1 | $0.2 | $0.5 | custom |
| Chains per indexer | unlimited | 5 | 10 | 15 | unlimited |
| Query rate | 100/min | 250/min | 1 000/min | 2 000/min | custom |
| Approx storage | 0.1 M | 1 M | 10 M | 100 M | unlimited |
| Number of contracts | 100 | 1 000 | 10 000 | 50 000 | unlimited |

Development deployments are deleted after 30 days and have no backups. "Approx storage" is stated in millions without a unit and "number of contracts" without saying whether dynamically registered addresses count; the dashboard meters say how each is measured ([plan usage](#plan-usage)).

### Inventory

Production app-backend through the public proxy, 2026-11-04 (`GET /v2/daos` paged per network; members, proposals and votes are the legacy `dao.metrics` counters, tokens are the distinct token and helper addresses embedded in plugin settings). HyperSync coverage from Envio's list on the same day.

| Network | HyperSync | DAOs | Plugins | Tokens and helpers | Proposals | Votes | Members (legacy count) |
|---|---|---|---|---|---|---|---|
| Ethereum | yes | 1 184 | 1 403 | 599 | 3 206 | 4 587 | 2 408 |
| Sepolia | yes | 6 407 | 10 778 | 3 152 | 16 465 | 7 266 | 9 415 |
| Polygon | yes | 3 527 | 3 950 | 2 709 | 5 251 | 8 208 | 26 121 |
| Base | yes | 3 601 | 4 085 | 763 | 1 876 | 2 045 | 10 132 |
| Arbitrum | yes | 572 | 727 | 282 | 1 531 | 1 891 | 447 464 |
| Optimism | yes | 43 | 89 | 19 | 77 | 39 | 86 385 |
| Avalanche | yes | 46 | 79 | 27 | 55 | 36 | 86 |
| Katana | yes | 46 | 87 | 27 | 417 | 780 | 136 |
| Citrea | yes | 6 | 21 | 6 | 53 | 63 | 48 |
| zkSync | yes | 65 | 112 | 33 | 231 | 335 | 131 |
| Chiliz | yes | 37 | 88 | 18 | 328 | 260 | 83 |
| Hemi | **no** | 4 | 11 | 2 | 9 | 6 | 555 |
| Monad | yes | 9 | 35 | 8 | 52 | 34 | 22 |
| Robinhood | yes | 7 | 18 | 6 | 14 | 7 | 9 |
| BNB | yes | 3 | 13 | 3 | 5 | 1 | 7 |
| BNB testnet | yes | 5 | 9 | 1 | 8 | 3 | 17 |
| Hoodi | yes | 2 | 5 | 1 | 2 | 2 | 6 |
| Base Sepolia | yes | 2 | 5 | 1 | 1 | 0 | 6 |
| Polygon Amoy | yes | 4 | 5 | 1 | 7 | 6 | 16 |
| **Total** | 18 of 19 | **15 570** | **21 520** | **7 658** | **29 588** | **25 569** | **583 047** |

Plugin families over all networks: token voting 8 157, multisig 6 555, admin 4 377, SPP 1 307, lock to vote 328, gauge 85, cross-chain 37, capital distributor 18, Safe 4, unknown 652. The ADR's "14 networks, 13 on HyperSync" predates the five networks of app-backend 0.41.0; it is 19 and 18 now.

### Budget per limit

"Today" is the current deployment measured on 2026-11-05 (Ethereum and Sepolia, DAO and plugin entities, dynamic registration of every DAO and prepared plugin): `Dao` 1 181 and 5 767, `PluginContract` 1 559 and 9 679, `PluginSetup` 1 635 and 9 875, metadata rows 1 307 + 576 and 6 248 + 4 198, ENS 295; `eventsProcessed` 278 121 on mainnet and 35 969 on Sepolia; both chains at the source block. "Full" is the complete model on the 15 chains after the cuts.

| Limit | Today | Full | Medium (10 chains) | Large (15 chains) |
|---|---|---|---|---|
| Chains | 2 | 15 after the cuts: 14 mainnets and Sepolia (Hemi over RPC `for: sync` counts as a chain); 19 with the small testnets | no on one indexer; yes on two Mediums (20 slots) | yes, 15 exactly |
| Registered contracts, everything dynamic | **18 200 measured** (6 948 DAOs, 11 238 plugin addresses) on Medium since 2026-10-07; M1 adds about 3 750 tokens | about 45 000 DAOs, plugins and tokens, plus conditions, escrows and lock managers: **about 50 000**; 25 000 per indexer when split | over on paper, runs | at the limit on one |
| Registered contracts, plugin events wildcard | 6 950 today, 10 700 after M1 | about 25 000 (DAOs, tokens and helpers, lock managers); 12 500 per indexer when split | per indexer, yes | yes |
| Storage, rows | **54 000 measured**; 314 000 events processed, 97 % of the mainnet ones foreign `TextChanged` on the shared ENS resolver | about 2 M without transfers (delegates 0.6 M, permissions 0.2 M, proposals, votes, metadata); transfers unmeasured, **3 to 10 M** likely, half per indexer when split | at the edge on one | yes |
| Query rate | contract suite and the members route only | BFF caches 15 s to 24 h per handler and prefetches in-process, so distinct page views per cache window bound the rate; **unmeasured** | likely | yes |
| Indexing hours | one deployment, inside 800 | one always-on deployment plus, per release, a candidate sync and the previous production kept a day: 4 releases × (sync + 24 h) is about 150 extra hours a month | $30 | $75 |

Readings behind the rows:

- **Contracts.** Today's deployment registers 18 200 addresses against Medium's "10 000 contracts" and has run for a month, so dynamically registered addresses are either not what the number counts or not throttled; Envio's docs put "no practical ceiling" on factory-registered addresses. The plan's usage meters in the dashboard are the only check worth making. Wildcard plugin events stay a lever, not a need: it halves registrations at the cost of a filter on `event.srcAddress` in the handler (every plugin event signature is Aragon's, so the noise is small; `Transfer` is the one event that must keep its address filter).
- **Storage.** 532 000 of the 583 000 legacy members sit in three member-import DAOs of 2025 (`2025-04-24 import arb` and `Test Arb` on Arbitrum, `2025-06-27 import OP` on Optimism): membership rows written once, not an event stream. Outside them the largest member sets are in the low thousands (Polygon, Base). Transfers are the unmeasured row.
- **Rate.** Public traffic reaches Envio only through the BFF cache; a scraping run hits Cloudflare and the cache, not the endpoint. The parity harness and the nightly contract suite are bounded bursts.
- **Hours.** A full resync of 19 chains is not measured; the only reference is Envio's own Aragon indexer at about 6 hours for 12 chains (unverified). Three deployment slots per indexer: production, the previous one, one candidate. A hotfix during an open release has no slot until a candidate is deleted.

### Existing subscriptions

Solutions has two Envio indexers on an annual plan, one Production Medium and one Production Small, that it is going to deprecate and has offered to the migration (Jota, Slack, 2026-10-27). With the app's own Medium that is two Mediums and a Small already paid for. To settle with Jota: the renewal date, the Envio organisation they live in (the app's is `aragon`) and whether an indexer can be moved or has to be recreated there.

### Recommendation (call)

- **M1–M3 (2 chains):** stay on the app's Production Medium; 18 200 registrations run on it today. Use the Solutions Medium for release candidates and the measurements below, so candidates stop competing with production for the hours and the three slots.
- **M4 (all chains):** two production indexers from the same repository, one config each, on the two Mediums: 20 chain slots for 14 mainnets and Sepolia (Hemi as the RPC chain, [APP-1191](https://linear.app/aragon/issue/APP-1191)), split so that no indexer carries more than its share of registered addresses, Sepolia and Polygon apart. The domain takes one endpoint per chain set. No Large, no new spend until the annual plan renews; then two Mediums ($600) against Large plus Small ($870). The four small testnets stay out ([what stays out](#what-stays-out-of-the-indexer)); the Solutions Small is spare for them if ever needed.
- **Large** only if the dashboard shows the split still over a Medium's storage once transfers are measured.
- **Never** Development for anything the app reads: deleted after 30 days.

### Plan usage

Nothing to ask Envio. The dashboard of the `aragon` organisation shows each plan meter (contracts, storage, hours, requests) against its limit; read it once for the app's indexer and note the four numbers here, then again when the treasury slice lands. The one open question is to Jota: renewal date and organisation of the Solutions subscriptions.

### Measurements

Taken before the plan is changed; owners proposed for the call.

| What | How | Owner | Feeds |
|---|---|---|---|
| Rows per legacy collection per network: `transaction`, `tokenMember`, `logDelegateChanged`, `lock`, `tokenDelegation`, `vote`, `proposal`, `daoPermission`, `selectorPermission`, `setting`, `voteGauge` | one `countDocuments` script on production Mongo | Cecir | storage row |
| Event volume of the governance tokens with most delegates (top 10 by `logDelegateChanged`) | the counts above, grouped by token | Cecir | storage and hours |
| Plan meters of the app's indexer (contracts, storage, hours, requests) | Envio dashboard, organisation `aragon` | Andrii | every row |
| Sepolia DAO count: the indexer has 5 767 `Dao` rows, the legacy list 6 407 (mainnet 1 181 against 1 184) | explain the 640 before the parity harness: another registry, legacy rows for tracked accounts, or a missed event | Cecir | parity, not capacity |
| Resync time of the current deployment | README after [APP-1172](https://linear.app/aragon/issue/APP-1172) | Cecir | hours |
| Peak requests per minute on `/api/backend` | Cloudflare analytics or the backend nginx log | DevOps | rate row |
| Largest VE plugin member set | `lock` grouped by escrow | Cecir | decision 8 |

## Re-triage of M2–M5

Proposed changes to the open tickets, for the call; nothing is edited in Linear before it.

| Ticket | Proposal |
|---|---|
| [APP-1181](https://linear.app/aragon/issue/APP-1181), [APP-1196](https://linear.app/aragon/issue/APP-1196), [APP-1197](https://linear.app/aragon/issue/APP-1197) (M2) | keep; Safe bodies out of scope here, their owners are read live in M3 (decision 5) |
| [APP-1182](https://linear.app/aragon/issue/APP-1182), [APP-1198](https://linear.app/aragon/issue/APP-1198), [APP-1199](https://linear.app/aragon/issue/APP-1199) (M2) | keep; `Vote` keeps every event, current vote derived |
| [APP-1183](https://linear.app/aragon/issue/APP-1183), [APP-1200](https://linear.app/aragon/issue/APP-1200), [APP-1201](https://linear.app/aragon/issue/APP-1201) (M2) | keep; fix 1183's context, which still says proposal metadata is fetched at read time (the ADR and 1201 index it) |
| [APP-1184](https://linear.app/aragon/issue/APP-1184) (M2) | keep; add `GetTransactionStatus`, the app polls it after every write and it needs a domain answer as soon as a slice is served |
| [APP-1101](https://linear.app/aragon/issue/APP-1101) (M2) | keep; exit and withdraw times on the `VELock` row and `VEDelegation` as plain event rows (decisions 8 and 9), which the reward routes of M4 read; no checkpoints |
| [APP-1192](https://linear.app/aragon/issue/APP-1192) (M2) | keep |
| [APP-1193](https://linear.app/aragon/issue/APP-1193) (M3) | shrink: the route it replaces returns the latest PSP setup (`PluginSetup`); no settings history entity |
| [APP-1319](https://linear.app/aragon/issue/APP-1319) (M3) | keep; add the hidden list in app-cms and the TVL snapshot; DAOs by member without Safe bodies |
| [APP-1320](https://linear.app/aragon/issue/APP-1320) (M3) | split the indexer part out: one ticket "Indexer: transfers, executions, permissions and conditions" (M3), 1320 keeps the BFF handlers (Safe owners live included), the cache and the spam and simulation tables |
| [APP-1185](https://linear.app/aragon/issue/APP-1185), [APP-1186](https://linear.app/aragon/issue/APP-1186), [APP-1187](https://linear.app/aragon/issue/APP-1187), [APP-1188](https://linear.app/aragon/issue/APP-1188) (M3) | keep |
| [APP-1189](https://linear.app/aragon/issue/APP-1189) (M4) | keep |
| [APP-1190](https://linear.app/aragon/issue/APP-1190) (M4) | retitle to the budget: 14 mainnets and Sepolia over two Medium indexers (the app's and the Solutions one), one config each; the four small testnets out |
| [APP-1191](https://linear.app/aragon/issue/APP-1191) (M4) | keep; input: Hemi over RPC `for: sync` inside the production indexer is the 15th chain |
| new, M3 | "Store and cache for the app: Neon and Upstash provisioned, credentials in the vaults" (DevOps) |
| new, M4 | "Telegram in the app: webhook, tick and tables" and "Campaign uploads on the store" |
| new, M4 | "Gauges and VE rewards from the domain" (the gauge voter routes; policies wait for the capital flow feature) |
| [APP-1321](https://linear.app/aragon/issue/APP-1321) (M5) | keep; add the one-off export of user data before Mongo is cancelled |

## Review call

30 minutes, DevOps (Javier), Cecir, Milos, Andrii.

1. Plan: the app's Medium until M4, the Solutions Medium for candidates now and as the second production indexer at M4; renewal date and organisation with Jota; the dashboard meters read once.
2. The cuts in [what stays out](#what-stays-out-of-the-indexer): Safe owners live, no lock checkpoints, no settings history, policies deferred, small testnets out, ERC721 with product.
3. Registration: dynamic as built, or plugin events wildcard; only if the dashboard meter says contracts are counted and near.
4. The store: Neon through the Marketplace with Upstash as cache, or a DevOps-run Postgres; vault names.
5. Telegram's home in the app and the scheduled tick.
6. Explore default sort: TVL snapshot or an index-time counter (product).
7. Owners and dates for the measurements; re-triage sign-off.
