# Data-layer target model and capacity budget

Companion to the [data-layer migration ADR](./dataLayerMigration.md). It maps every read the app makes onto the new layers, lists what the indexer and the domain end up holding, states how each list gets its rows and its total, shapes the model around workspaces, names the store for user data and the worker for background work, states the security rules for the new surfaces, checks the model against the hosting plans and orders the work to M4. Ticket: [APP-1318](https://linear.app/aragon/issue/APP-1318).

- **Status:** proposal, updated 2026-11-13. The items to confirm with DevOps, Cecir and Milos are listed in [open for the call](#open-for-the-call); everything else follows the ADR and the legacy audit.
- **Inputs:** legacy audit [aragon-indexer `docs/legacy-audit.md`](https://github.com/aragon/aragon-indexer/blob/main/docs/legacy-audit.md) (merged 2026-11-02); the app's service URL maps and call sites at `main` `a0e0cadd7`; indexer `main` `config.yaml` and `schema.graphql`; app-backend `development` `b02679c9c` for the legacy behaviour quoted below (it is ahead of `main` by the workspace to-do route); the feature flags in `aragon/app-cms` `feature-flags.json` on 2026-11-13; [Envio hosting pricing](https://envio.dev/pricing/hosting), [deployment limits](https://docs.envio.dev/docs/HyperIndex/hosted-service-deployment) and [HyperSync networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks).
- **Measured:** production counts through the public proxy on 2026-11-04 and 2026-11-10; the current indexer endpoint (`1c70633`, ready since 2026-10-07) on 2026-11-05 and 2026-11-10; the usage panel and the billing history of the Envio dashboard on 2026-11-10. What is still an estimate says so, and [measurements](#measurements) names who replaces it with a number.
- **Rule for slices:** an entity enters the indexer only with a consumer row in the target model. Nothing is indexed for a feature that is off, has four installs, or can be answered by one RPC call.
- **Rule for scope:** a list is read for a set of accounts. A DAO page passes the DAO and its linked accounts, a workspace passes its selection, and a single DAO is a set of one ([list rules](#list-rules), [workspaces](#workspaces)).

## Layers

The ADR's two layers do the reads, and every read goes through the domain. A small store and the CMS hold what is not a chain fact, and one worker does the work nobody requests.

| Layer | Holds | Serves |
|---|---|---|
| **indexer** (aragon-indexer, Envio) | chain facts at the event's block, IPFS metadata by CID, counters written in the event's handler | GraphQL to the domain only |
| **domain** (`@aragon/aragon-domain`) | every read as a use case with a DTO, whatever its source: the indexer, RPC, an external API or the store. Business rules (reward splits, voting power at a time, membership) and the cache policy | the BFF and the worker, in-process |
| **BFF** (`apps/app` server: the `/api/backend` fork and `AragonBackendService`) | the HTTP layer: the per-route fork and flags, the legacy JSON shape, limits and BotID; the writes of user data | the UI |
| **worker** (`apps/worker`, its own project) | the work nobody requests: the notification loop and the Telegram bot, the DAO directory, TVL, spam scoring, cleanup | Telegram users; the tables the domain reads |
| **store** (Postgres) | data users write (campaign uploads, saved simulations) and data the worker computes (the DAO directory behind explore with its TVL, spam verdicts) | the domain; written by the BFF and the worker |
| **cms** (`aragon/app-cms`) | lists the team curates: hidden DAOs, spam tokens, featured DAOs, overrides, flags | the worker copies hidden DAOs and spam tokens into the store; the BFF reads the rest, cached 600 s |

### Alternative considered: a backend service

A three-layer shape was proposed on 2026-10-07: Envio for raw data, a backend with its own models, database and GraphQL, and the app on top. The ADR chose two layers.

- A backend between the indexer and the app is a second database, a second deploy and a second schema, and it lags the indexer. Envio Cloud has no change feed, so that backend would poll GraphQL.
- State that follows from events (tallies, counters, membership, settings at a block) is written once in the event handler. Business rules live in `@aragon/aragon-domain` as use cases, one owner per module.
- The proposal's other points are in the plan: a model map before the slices (this document), the audit instead of a port, volatile sources read at request time behind a cache.

One small piece of backend remains, and it sits beside the read path. Notifications, the DAO directory, TVL, spam scoring and cleanup are work that no request starts, and on serverless each of them needs its own schedule, lock and cursor. They run in one [worker](#worker) with a small Postgres ([store](#the-store-for-user-data)). The app still reads through the domain and never calls the worker, so the worker adds no second schema and no lag to anything the indexer serves. The other cost of the shape is a resync on every indexer deploy; the previous deployment serves while the new one syncs.

## Target model

Every app-backend path the app calls, from the app's service URL maps: 52 paths, the audit's 41 at the baseline plus 5 Safe and 6 workspace routes. `GET` and `POST /v2/simulations/proposal/:proposalId` share a row. Nothing else in the monorepo reaches app-backend: the `/api/backend` proxy passes any path through, and the assistant, the docs site and the packages do not call it. The app's own routes (`/api/backend`, `/api/domain`, `/api/governance`, `/api/rpc`, `/api/safe`) are the BFF and are not rows. Verdicts are the audit's; the tables add the entity or use case and the milestone.

Paths are the strings the services send, because the BFF fork and the M5 checklist match on them. `apiVersionUtils` forces `/v2` on most, the DAO reads take the environment's version (`v3` in every environment), and `capitalDistributorService.getCampaignList` sends no version, which the backend's root router serves from v2.

The tables are a snapshot of `main`, and routes keep arriving: two of the 52 landed while this document was in review. So the fork's route table ([APP-1177](https://linear.app/aragon/issue/APP-1177)) carries one entry per path with its state (legacy, domain, dropped or deferred), and a unit test fails when a service URL map holds a path without an entry. A new route then gets its target in the pull request that adds it, and M5 is checked against the route table.

"Target" names where the data comes from: an `indexer` entity, a `live` source read at request time (RPC or an external API), a `store` table. Every row is a domain use case, and the BFF maps its DTO to the legacy shape. Rows, totals and paging follow the [list rules](#list-rules).

### DAOs and plugins

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/daos` | `daoExplorerService.getDaoList` | store | `store.dao_directory`, kept by the worker: rows, search, TVL order and total in one SQL query, hidden DAOs left out ([decision 1](#decisions-on-the-open-rows)); `GetDaoList` | M3 [APP-1319](https://linear.app/aragon/issue/APP-1319) |
| `GET /v2/daos/member/:address` | `daoExplorerService.getDaoListByMemberAddress` | indexer + store | the address's membership rows of every family, zero-power rows included, reduced to distinct DAOs; hidden DAOs and `excludeDaoId` removed, `search` and `sort` applied in memory, TVL and the hidden flag from the directory; Safe bodies skipped ([decision 5](#decisions-on-the-open-rows)); `GetDaosByMember` | M3 APP-1319 |
| `GET /v3/daos/:id` (v2 unused) | `daoService.getDao` | indexer + store | `Dao`, counters, linked accounts from `Permission`; TVL from the directory, summed over the linked accounts unless `onlyParent`; `GetDao` | M3 APP-1319 |
| `GET /v3/daos/:network/ens/:ens` | `daoService.getDaoByEns` | indexer | `Dao.subdomain`; `GetDao` | M3 APP-1319 |
| `GET /v2/plugins/by-dao/:network/:address/details` | `pluginsService.getPluginsByDao` | indexer + live | installed plugins of the DAO and its linked accounts: `Plugin`, `PluginContract`, `PluginSettings` (current), `PluginMetadata`, SPP children; token supply live; `GetDaoPlugins` | M2 settings ([APP-1192](https://linear.app/aragon/issue/APP-1192) for SPP), M3 route |
| `GET /v2/policies/:network/:daoAddress` | `daoService.getDaoPolicies` | deferred | `capitalFlowAutomation` is off in staging and production; nothing is indexed until the feature is scheduled. The automation details page (`settings/automations/[id]`) fetches it without checking the flag, so the page gets the check before M5 | with the feature, or removed at M5 |
| `GET /v2/permissions/:network/:daoAddress` | `daoService.getDaoPermissions` | indexer + live | `Permission` (current grants), `Condition`, `SelectorPermission`; SPP `getRules()` live; `GetDaoPermissions` | M3 |
| `GET /v2/execute-selectors/:network/:pluginAddress` | `executeSelectorsService.getAllowedActions` | indexer + live | `SelectorPermission` by condition ([decision 4](#decisions-on-the-open-rows)); decoding live; `GetAllowedActions` | M3 |
| `GET /v2/plugins/installation-data` | `settingsService.getPluginInstallationData` | indexer | `PluginSetup` (the applied prepare); `GetPluginSetup` | M3 |
| `GET /v2/plugins/logs/:pluginAddress/:network/:event` | `settingsService.getLastPluginEventLog` | indexer | latest `PluginSetup` of that action; `GetPluginSetup` | M3 ([APP-1193](https://linear.app/aragon/issue/APP-1193)) |

### Members

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/members` | `governanceService.getMemberList` | indexer | per plugin family, see the table below | M1 token voting, M2 others |
| `GET /v2/members/:address` | `governanceService.getMember` | indexer + live | `MemberGovernanceMetrics`, `Delegation` counts; ENS, balance, voting power and delegate live; `GetMember` | M2 [APP-1184](https://linear.app/aragon/issue/APP-1184) |
| `GET /v2/members/:memberAddress/:pluginAddress/exists` | `governanceService.getMemberExists` | indexer + live | `PluginMember` for multisig and admin, Safe owners live; the other families answer `false`, as legacy does; `CheckMembership` | M2 APP-1184 |
| `GET /v2/members/:address/locks` | `locksService.getMemberLocks` | indexer | `VELock` by owner and escrow; `onlyActive` means not withdrawn, so a lock in the exit queue stays listed; `GetMemberLocks` | M2 [APP-1101](https://linear.app/aragon/issue/APP-1101) |
| `GET /v2/ipfs/delegate-statement/:cid` | `delegateStatementService.getDelegateStatement` | live | IPFS by CID, cached without expiry | M3 [APP-1320](https://linear.app/aragon/issue/APP-1320) |

The member list by plugin family:

| Family | Rows | Total | Sort | Milestone |
|---|---|---|---|---|
| token voting | `ERC20VotesDelegate` with voting power above zero; `GetTokenVotingMembership` (built, [app#1128](https://github.com/aragon/app/pull/1128)) | `ERC20VotesToken.delegateCount`, which counts the same rows | voting power, stored | M1 ([APP-1172](https://linear.app/aragon/issue/APP-1172), [APP-1180](https://linear.app/aragon/issue/APP-1180)) |
| multisig, admin | `PluginMember`; `GetPluginMembership` | `Plugin.memberCount` | address | M2 ([APP-1181](https://linear.app/aragon/issue/APP-1181)) |
| VE | one row per delegate: the `VELock` rows delegated to an address, not withdrawn and not in the exit queue, with their voting power summed. A lock without a delegate gives no row; `GetVeMembership` | the number of delegates, after the full read | voting power at request time ([decision 8](#decisions-on-the-open-rows)) | M2 (APP-1101) |
| lock to vote | `LockToVoteMember` with a locked amount above zero | `Plugin.memberCount`, which counts the same rows | locked amount, stored | M2 |
| Safe bodies | owners from the Safe source ([decision 5](#decisions-on-the-open-rows)) | the number of owners | address | M3 (APP-1320) |
| token on the skip list | no rows; the response says the members are not indexed ([what stays out](#what-stays-out-of-the-indexer)) | 0 | none | M1 |

### Proposals and votes

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/proposals` | `governanceService.getProposalList` | indexer + live | `Proposal` with tallies, `ProposalMetadata`, SPP children; the DAO and, with `includeLinkedAccounts`, its linked accounts; `onlyActive` keeps the installed plugins; sub-proposals only when asked for; creator ENS live; `GetProposals` | M2 [APP-1183](https://linear.app/aragon/issue/APP-1183) |
| `GET /v2/proposals/slug/:slug` | `governanceService.getProposalBySlug` | indexer | `Proposal` by DAO, plugin slug and `incrementalId` (chain order); `GetProposalBySlug` | M2 APP-1183 |
| `GET /v2/proposals/:id/actions` | `governanceService.getProposalActions` | indexer + live | raw actions on `Proposal`; decoding live, and a failed decode is reported as failed | M2 raw, M3 decode (APP-1320) |
| `GET /v2/proposals/can-create-proposal` | `governanceService.getCanCreateProposal` | live | RPC per family with settings from the domain; a failed RPC read returns an error, never `false` | M3 APP-1320 |
| `GET /v2/votes` | `governanceService.getVoteList` | indexer + live | `Vote`, one row per voter and proposal: a re-vote replaces the row (the latest by block and log index wins) and a cleared vote leaves the lists; `highlightUser` leads page 1; voter ENS live; `GetVotes` | M2 [APP-1182](https://linear.app/aragon/issue/APP-1182) |
| `GET` and `POST /v2/simulations/proposal/:proposalId` | `actionSimulationService` | live + store | Tenderly live; result and the 10-minute throttle in `store.proposal_simulation`, written by the BFF | M3 APP-1320 |
| `POST /v2/simulations/:network/dao/:daoAddress/simulate`, `.../plugin/:pluginAddress/simulate` | `actionSimulationService` | live | Tenderly live; plugin check from the domain | M3 APP-1320 |
| `POST /v2/simulations/:network/cross-chain/:controllerAddress/gas-limit` | `crossChainControllerService.estimateGasLimit` | live | lane reads and Tenderly; shared cache and hourly budget in Redis | M3 APP-1320 |
| `POST /v2/simulations/:network/dispatch/:policyAddress` | `daoService.simulateDispatch` | deferred | Tenderly with policy data; waits for capital flow like the policies route | with the feature |

### Decoding

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/contract/:network/:address` | `smartContractService.getAbi` | live | explorer source and proxy read, cached; "unverified" and "lookup failed" are different answers | M3 APP-1320 |
| `POST /v2/contract/:network/:address/decode` | `smartContractService.decodeTransaction` | live | one action, live | M3 APP-1320 |
| `POST /v3/contract/:network/decode-batch` | `smartContractService.decodeTransactionsLight` | live | batch, nested execute to depth 3 | M3 APP-1320 |

### Treasury

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/assets` | `financeService.getAssetList` | indexer + live + store | token set from `DaoToken` over the DAO and its linked accounts unless `onlyParent`; balances by multicall, zero balances dropped, amounts summed per token; prices live; spam from `store.token_spam`, with `spamCount` beside the total; sorted and paged in memory ([decision 1](#decisions-on-the-open-rows)); `GetAssets` | M3 APP-1320 |
| `GET /v2/tokens/:network/:address` | `financeService.getTokenInfo` | live | name, symbol, decimals and supply over RPC; price live | M3 APP-1320 |
| `GET /v2/transactions` | `financeService.getTransactionList` | indexer + live + store | `Transaction`, one row per account and event: native and ERC20 transfers on both sides (`failureMap` honoured) and executions; the DAO and its linked accounts unless `onlyParent`; spam excluded by token ([decision 2](#decisions-on-the-open-rows)); totals from counters ([list rules](#list-rules)); USD live; `GetTransactions` | M3 APP-1320 |
| `GET /v2/transactions/:network/:id/actions` | `financeService.getTransactionActions` | indexer + live | the `Transaction` row of type `execution`: raw actions and the proposal link; decoding live | M3 APP-1320 |
| `GET /v2/transactions/:network/:transactionHash/status` | `transactionService.getTransactionStatus` | indexer | the row the request's `type` names, by transaction hash: `Dao` (with its admin plugin and a first member), `Plugin`, `Proposal` (created, executed, stage advanced, result reported), `Vote`, `VELock` (created, exit queued, withdrawn); plus `_meta` progress; `GetTransactionStatus` | M2, with the first write path a slice serves |

### Gauges and rewards (gauge voter plugin)

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/gauge/:pluginAddress/:network` | `gaugeVoterService.getGaugeList` | indexer + live | `Gauge`, `GaugeEpochMetrics` (totals from `Voted` and `Reset`); epoch id by clock math or RPC; `GetGauges` | M4 |
| `GET /v2/gauge/epochMetrics/:pluginAddress/:network` | `gaugeVoterService.getEpochMetrics` | live | RPC reads at `latest` | M4 |
| `GET /v2/gauge/gaugeRewards/:pluginAddress/:network/:epochId` | `gaugeVoterService.getGaugeRewardDistribution` | indexer | split over the voting power stored on `GaugeVote`; `ComputeGaugeRewards` | M4 |
| `GET /v2/gauge/rewards/:pluginAddress/:network/:epochId` | `gaugeVoterService.getRewardDistribution` | indexer | split over `GaugeVote`, `VEDelegation` and lock voting power at the epoch from `VELockEvent` ([decision 9](#decisions-on-the-open-rows)); `ComputeVeOwnerRewards` | M4 |
| `GET /v2/tokens/rewards/:pluginAddress/:network` | `tokenRewardService.getRewardDistribution` (Cryptex) | indexer | over `Proposal`, `Vote`, `VEDelegation`, `VELockEvent`; the DAO start block moves from backend env to domain config; `ComputeGovernanceRewards` | M4 |

### Capital distributor

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /capital-distributor/campaigns` | `capitalDistributorService.getCampaignList` | indexer + store | `Campaign` (state, root, metadata, claimed totals), `CampaignClaim`; the user's allocation, proof and leaf from `store.campaign_allocation`, only for a root that is on chain. The plugin's campaigns are read in full and filtered in memory: active by default, the user's (an allocation or a claim), `status` as claimed against allocated; `GetCampaigns` | M4 |
| `POST /v2/capital-distributor/campaign/upload` | `campaignService.uploadCampaignMembers` | store, written by the BFF | the route validates the list, builds the merkle tree and writes a draft to `store.campaign_upload` and `store.campaign_allocation` ([security](#security)) | M4 |
| `GET /v2/capital-distributor/campaign/prepare/status` | `campaignService.getCampaignPrepareStatus` | store | `store.campaign_upload` (root, member count) | M4 |

### Safe

`info`, `queue` and `history` are called in every environment: by SPP stages whose body is a Safe and by the governance designer. Only the `/safe/...` account page is behind `safeAccountPage` (on in local and preview). All five read the Safe source of [decision 5](#decisions-on-the-open-rows).

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `GET /v2/safe/:network/:address/info` | `safeService.getSafeInfo` | live | owners, threshold, nonce and version over RPC, cached | M3 APP-1320 |
| `GET /v2/safe/:network/:address/queue` | `safeService.getSafePendingTransactions` | live | Safe Transaction Service, cached with a call budget; SPP reports from the domain | M3 APP-1320 |
| `GET /v2/safe/:network/:address/next-nonce` | `safeService.getSafeNextNonce` | live | live nonce plus live queue, never cached | M3 APP-1320 |
| `GET /v2/safe/:network/:address/history` | `safeService.getSafeTransactionHistory` | live | Safe Transaction Service, cached | M3 APP-1320 |
| `GET /v2/safe/:network/:address/transactions/:safeTxHash/actions` | `safeService.getSafeTransactionActions` | live | the transaction from the Safe Transaction Service, decoded live like proposal actions; cached per `safeTxHash` | M3 APP-1320 |

### Workspaces (`workspaces` flag, on in local only)

The body of every request carries the account selection, up to 100 `(network, address)` pairs, and every response carries `coverage` per account. The design is in [workspaces](#workspaces).

| Path | App caller | Target | Entity or use case | Milestone |
|---|---|---|---|---|
| `POST /v2/workspaces/query/accounts` | `workspaceQueryService.getAccounts` | indexer + live | `Dao` by `(network, address)`; an address without a `Dao` row is probed as a Safe | M3 |
| `POST /v2/workspaces/query/assets` | `workspaceQueryService.getAssetList` | indexer + live + store | `GetAssets` over the selected DAOs as one account set, grouped by network and token, with `totalAmountUsd` and `spamCount` in the metadata; sorted and paged in memory | M3 |
| `POST /v2/workspaces/query/members` | `workspaceQueryService.getMemberList` | indexer + live | per selected plugin its family's rows, up to 1 000; owners of the selected Safes from the Safe source; merged into one entry per address and network, then filtered, sorted by address and paged in memory | M3 |
| `POST /v2/workspaces/query/proposals` | `workspaceQueryService.getProposalList` | indexer + live | `GetProposals` over the selected DAOs, newest first; the total from the plugin counters | M3 |
| `POST /v2/workspaces/query/transactions` | `workspaceQueryService.getTransactions` | indexer + live + store | pending transactions of the selected Safes first, in nonce order; then `GetTransactions` over the selected DAOs merged with the executed transactions of the selected Safes, newest first. A transfer between two selected accounts is two rows, one per account; `internal` is computed | M3 |
| `POST /v2/workspaces/query/todo` | `workspaceQueryService.getTodo` | indexer + live | what a wallet can still act on, 50 rows per kind and no paging: the open proposals of the bodies it is a member of that it has not voted on (`GetMemberTodo`), and the pending transactions of the selected Safes it owns that it has not confirmed | M3 |

## List rules

The hosted endpoint has no aggregates and returns at most 1 000 rows per query (both checked on 2026-11-10). The legacy shape carries `totalRecords` and `totalPages` on every list, and the app acts on both: the kit's list stops offering rows at `totalRecords`, paging stops at `page >= totalPages`, and several totals are used as numbers (the dashboard's proposal count, the transaction tabs, the multisig member count that bounds the approval threshold). A total that is too low hides rows, and one that is too high ends on an empty page. So every list states its rows, its total and its order here, and the slice ticket repeats them.

### Scope

A list is read for a set of accounts. On a DAO page the set is the DAO plus its linked accounts for assets, transactions and the "all proposals" tab (`linkedAccount` is on in production); `onlyParent` or a plugin tab narrows it. In a workspace the set is the selection. Linked accounts share the parent's network, and a selection spans networks.

So a query filters with `dao _in`, and a total is a sum of counters kept per account or finer. The same counters then serve one DAO, a DAO with linked accounts and a workspace.

### Counters

Written in the event's handler, at the grain the UI filters by.

| Counter | Counts | Read as |
|---|---|---|
| `Plugin.proposalCount`, `Plugin.executedProposalCount` | the plugin's proposals that are not sub-proposals of an SPP stage | a plugin tab reads one counter; a DAO sums its installed plugins and those of its linked accounts; a workspace sums the plugins of its selection |
| `Proposal.voteCount` | voters with a current vote | votes of a proposal |
| `ERC20VotesToken.delegateCount` | delegates with voting power above zero | token-voting members |
| `Plugin.memberCount` | `PluginMember` rows; for lock to vote, members with a locked amount above zero | multisig, admin and lock-to-vote members |
| `Dao.executionCount` | execution rows of the account | transactions, and the executions tab |
| `DaoToken.depositCount`, `DaoToken.withdrawCount` | transfer rows of one account and token per side; the native coin is the `DaoToken` of the zero address | transactions, and the received and sent tabs |

### Lists

| List | Rows | Total | Order |
|---|---|---|---|
| Proposals of a DAO, a plugin or a workspace | top-level proposals of the account set's plugins; `onlyActive` keeps the installed ones | the sum of `Plugin.proposalCount` over the same plugins | `blockTimestamp` |
| Votes of a proposal | current votes. With `highlightUser`, that voter's row leads page 1 and the paged set is everyone else | `Proposal.voteCount`; as in legacy, the paged set is one smaller when the highlighted voter has voted | `blockNumber` |
| Members of a plugin | by family ([members](#members)) | the family's counter | by family |
| Transactions of a DAO or a workspace | `Transaction` rows with `dao _in`. Spam is hidden with `_or: [{ token: { _is_null: true } }, { token: { _nin: spam } }]`, because `_nin` alone drops every row whose token is null and an execution has none | per account, `Dao.executionCount` plus the two `DaoToken` counters of its non-spam tokens, summed over the set. The received, sent and executions tabs each read their own counters | `blockNumber` on a DAO page, `blockTimestamp` in a workspace |
| Explore | `store.dao_directory` | `count(*)` of the same filter | `tvl_usd`, in SQL |
| Sets read to the end: DAOs by member, assets, VE members, member locks, permissions, allowed actions, gauges, campaigns, workspace members and assets | the whole set in pages of 1 000 until a short page, then filtered, sorted and paged in memory | the size after filtering | in memory |
| Any other filter (creator, voter, token, from, to, search) | the filtered query | ids counted in batches of 1 000 up to 5 000, cached 60 s per query | the stored order; the list ends at 5 000 rows |

Paging is `limit` and `offset` wherever one query answers the list. Every list orders by its key and then by `id`, in the request's direction, as legacy does. Ids differ between legacy and the indexer, so parity compares the order of the key and the set of rows inside a tie.

A set is read to the end only with a stated bound: 1 000 tokens per account set, 1 000 memberships per address, 1 000 members per plugin, 1 000 selector rows per emitter. The slice measures its largest set before it ships. Permissions and allowed actions are in this group for a second reason: the app walks them to the last page and builds the proposal form's allowed actions from the result, so a low total would silently shorten the permission set.

The members slice counts ids today without the cap or the cache (`EnvioMemberStore.countRemainingMembers`, one loop per page request); M1 replaces it with `delegateCount`.

With two indexer endpoints ([capacity](#capacity-budget)), a query for one network goes to the endpoint that holds it, and a DAO with its linked accounts is always one network. Explore does not query the indexer at request time. The reads that span endpoints are DAOs by member, a set read to the end from both, and the workspace lists, which merge their sources in order ([workspaces](#workspaces)).

Inputs are capped before they reach a query: page size at 50 and account sets at 100, as in legacy; search terms in length, with `%` and `_` escaped.

### Legacy behaviour the lists do not reproduce

The parity script ([APP-1178](https://linear.app/aragon/issue/APP-1178)) lists these as known differences.

- The lock-to-vote total counts members who unlocked everything, while the page hides them.
- Multisig, admin and Safe members come in descending order of the row id, a side effect of sorting by a field those rows lack. The lists sort by address.
- Voting power is sorted as a double, so values above 2^53 tie. The indexer orders them exactly.
- Campaigns sort `campaignId` as a string.
- A page past the end answers as page 1 with `totalPages: 1`.
- Explore search also matches the implementation address and the creation transaction hash, which the search field does not offer.
- ERC721 transfers, if product confirms the cut.

## Workspaces

The product is turning towards workspaces: one view over several accounts on any networks, with Safes next to DAOs. Today the routes are behind a flag that is on in local only, the workspace itself is a record in the browser's `localStorage`, and the lists compose rows the DAO pages already read. The model treats workspaces as its main reader, which settles five things.

**Accounts.** An account is a `(network, address)` pair that resolves to a DAO (it has a `Dao` row), to a Safe (the Safe source answers for it) or to neither. Every list use case takes an account set ([scope](#scope)), so a workspace needs no entity of its own in the indexer and one use case of its own, the to-do.

| | DAO account | Safe account |
|---|---|---|
| Assets | `DaoToken`, balances live | not in the workspace response, as in legacy; the Safe page reads balances in the browser through `/api/safe` |
| Transactions | `Transaction` rows | pending from the queue, executed from the history |
| Proposals | `Proposal` rows | none: a Safe's queue shows as transactions and in the to-do |
| Members | the family's rows, up to 1 000 per plugin | owners |
| To-do | open proposals of the wallet's bodies without its vote | pending transactions of the Safes it owns without its confirmation |

**Safes are a second source.** The indexer registers contracts from events, and a Safe enters a workspace by its address, so no deployment can hold the Safes users pick. Their state comes from the Safe source of the domain ([decision 5](#decisions-on-the-open-rows)): owners, threshold and nonce over RPC, queue and history from the Safe Transaction Service, all behind the cache.

**Coverage.** Every workspace response says, per account and resource, whether its rows are complete. The Safe source fills it from the cache: a stale entry is served and marked, an account that could not be read inside the request's budget is `partial` or `unavailable`. The indexer side fills it from the readiness gate. After M5 there is no legacy to fall back to; a chain that fails the gate then marks its accounts `unavailable` and the workspace is served from the rest, where a DAO page can only fail.

**Lists merge sources.** A workspace's transactions come from up to two indexer endpoints for the DAO accounts and from the Safe source for each selected Safe; its proposals from up to two endpoints. Pending Safe transactions have no block, so they lead the list in nonce order, read whole from the cached queues. The rest is ordered by `blockTimestamp`, then `id`.

- With page numbers, the use case asks every source for the first `page × pageSize` rows, merges and cuts. The cost grows with the page, so the list has to end: at 1 000 rows.
- With a cursor (the `blockTimestamp` and `id` of the last row), every source returns one page after it, and the cost is the same at any depth.

Proposal: the workspace lists page by cursor, and app-backend's workspace routes change now, while the flag is on in local only. The BFF then keeps path and shape when it takes the routes over, as the ADR requires. `totalRecords` stays: the counters of the DAO accounts plus the counts the Safe Transaction Service returns. Members and assets are sets read to the end and keep page numbers.

**To-do.** `POST /v2/workspaces/query/todo` needs nothing new from the indexer: `PluginMember` by member, `Proposal` by plugin and vote window (for SPP, the current stage and its bodies from `SppStage` and `SppSubProposal`), `Vote` by voter. Legacy takes membership from `pluginMember`, which holds multisig and admin members, so token-voting proposals are not in the to-do today. Adding them is a product decision; the rows exist (`ERC20VotesDelegate` by address).

What comes next is not designed here, but each need already has a layer:

| Need | Lands in |
|---|---|
| Saved and shared workspaces (today `workspaceService` over `localStorage`) | `store.workspace`, written by the BFF. A saved workspace has an owner, so it brings wallet sign-in to the BFF. An on-chain registry would be an indexer entity instead |
| Notifications for a workspace, Safe transactions included | a task of the [worker](#worker); it needs the saved workspaces first, to know which accounts to watch |
| Finding an account by name when adding one | `store.dao_directory` |
| More Safes than the cache and the Safe Transaction Service budget carry | `safe_account` and `safe_transaction` tables in the store, filled by a task of the worker: the copy legacy keeps today |
| Safe writes (propose, confirm, execute) | the browser, through `/api/safe` and the wallet, as today |

## What stays out of the indexer

The cuts against a one-for-one port, and where each need is served.

| Not indexed | Why | Served by |
|---|---|---|
| Delegates of governance tokens on the skip list: ARB on Arbitrum, OP on Optimism | three test DAOs (`2025-04-24 import arb`, `Test Arb`, `2025-06-27 import OP`) use these tokens and report 532 000 of the 583 000 legacy members. Registering ARB or OP would index the whole delegation history of that token on every resync. Legacy sets `ignoreTransfer` on both | a per-chain skip list in the indexer config; the plugin row stays, its member list is empty and says so. Any other large imported token is added to the list after the [measurement](#measurements) |
| Policies, router and claimer settings, dispatch simulation (capital flow) | `capitalFlowAutomation` is off in staging and production | nothing until the feature is scheduled; then a slice ticket adds `PolicySettings` |
| Safe owners, thresholds, queues and history | a Safe enters a workspace by its address, and the indexer registers contracts from events only; 4 Safe bodies exist on all networks | the Safe source of the domain ([decision 5](#decisions-on-the-open-rows)) |
| Superseded and cleared votes | lists and tallies read the current vote | the `Vote` row of the voter and proposal, replaced in place |
| Settings history per plugin | the app reads current settings and the latest PSP setup | `PluginSettings` (current) and `PluginSetup` |
| Metadata history beyond `DaoMetadata` and `PluginMetadata` | the app reads the `ACTIVE` row; the two existing history tables stay because they are built | the `ACTIVE` row |
| Workspace entities | a workspace is an account set passed to the use cases of the DAO pages ([workspaces](#workspaces)) | the domain |
| Events of unknown plugin families (652 plugins) | nothing decodes them | the `Plugin` row with `UNKNOWN` |
| ERC721 transfers (to confirm with product) | legacy indexes them and the finance module has no NFT code. ERC20 and ERC721 `Transfer` share a signature, so the handler drops the logs with four topics | nothing, if confirmed |
| The four small testnets (BNB testnet, Hoodi, Base Sepolia, Polygon Amoy: 13 DAOs) | QA networks for OSx 1.4 | app-backend until M5; then the spare Small plan if QA still needs them. "DAOs by member" asks for all 19 networks, so their DAOs leave that list when the route turns on |
| Counters the UI does not show | legacy keeps more counters than the app reads | the slice ticket lists each counter with its UI consumer |
| Prices, balances, ENS, ABIs, decoded actions, simulations, Safe queues, token supply | volatile | the domain's [read-time sources](#read-time-sources), cached |
| Telegram, campaign uploads, saved simulations, spam verdicts, TVL and the explore order, hidden DAOs | not chain facts | the [store](#the-store-for-user-data), the [worker](#worker) and app-cms |

Hemi is not on HyperSync and has 4 DAOs. It is indexed over RPC inside the production indexer ([APP-1191](https://linear.app/aragon/issue/APP-1191)) and counts as a chain.

## Indexer entities

`schema.graphql` when the model is complete, by owner module. Existing entities keep their names (ADR, "Entity contract and cutover"). `main` holds the dao, plugin and ens modules today.

| Module | Entities | Source events | Registration | Milestone |
|---|---|---|---|---|
| dao | `Dao` (+ counters: proposals, executed, members, votes, unique voters, `executionCount`), `DaoMetadata` | `DAORegistered`, `MetadataSet` | `DAORegistry` static; `DAO` dynamic on `DAORegistered` | built; counters M2–M3 |
| plugin | `PluginRepo`, `Plugin` (+ `isProcess`, `isBody`, `isSupported`, slug, `memberCount`, `proposalCount`, `executedProposalCount`), `PluginContract`, `PluginSetup`, `PluginMetadata`, `PluginSettings` (current, per family) | PSP events, `MetadataSet`, family settings events | `PluginSetupProcessor` static; plugins dynamic on `InstallationPrepared`, as built | built; settings and counters M2 |
| tokenVoting | `ERC20VotesToken` (+ `delegateCount`, `membersIndexed`), `ERC20VotesDelegate`, `Delegation`, `MemberGovernanceMetrics` | `DelegateVotesChanged`, `DelegateChanged`, `VoteCast`, `ProposalCreated` | token dynamic on `InstallationPrepared` of a token-voting plugin, unless it is on the skip list ([APP-1172](https://linear.app/aragon/issue/APP-1172)) | M1 |
| membership | `PluginMember` (multisig, admin), `LockToVoteMember` | `MembersAdded`, `MembersRemoved`, `Granted` and `Revoked` of `EXECUTE_PROPOSAL_PERMISSION`, lock-manager events | plugin events; lock manager dynamic from settings | M2 |
| ve | `VELock` (current amount, owner, delegate, start, exit and withdraw times; the owner stays the holder who queued an exit), `VELockEvent` (one row per `Deposit`, `Withdraw`, `Split`, `Merged`, exit queued or cancelled and lock NFT `Transfer`, with the amount and owner after it), `VEDelegation` (one row per delegate or undelegate event), `VESettings` (curve parameters, one row per change) | escrow, exit queue, adapter, lock NFT and curve events | escrow, queue, adapter, NFT and curve dynamic from settings | M2 ([APP-1101](https://linear.app/aragon/issue/APP-1101)) |
| proposal | `Proposal` (+ tallies, `voteCount`, `incrementalId`, settings snapshot, total supply at the snapshot block), `ProposalMetadata`, `Vote` (the current vote per voter and proposal), `SppStage`, `SppSubProposal` | `ProposalCreated`, `VoteCast`, `Approved`, executed, canceled, edited, SPP events | plugin events | M2 |
| permission | `Permission` (current grants per DAO), `Condition`, `SelectorPermission` (per condition, selector, target, chain) | `Granted`, `Revoked`, `SelectorAllowed`, `SelectorDisallowed` | DAO events; selector events wildcard with a row cap per emitter ([decision 4](#decisions-on-the-open-rows)) | M3 |
| treasury | `Transaction` (one row per account and event, with `type` `native`, `erc20` or `execution`, `side`, a token that is null on executions, and the raw actions of an execution; a transfer between two registered DAOs writes a row for each), `DaoToken` (tokens an account has held, the native coin under the zero address, with `depositCount` and `withdrawCount`) | `Transfer` with `to` or `from` in the registered DAOs, `NativeTokenDeposited`, `Executed` | wildcard `Transfer` with a `where` filter on `chain.DAO.addresses`; DAO events | M3 |
| gauge | `Gauge`, `GaugeVote` (every `Voted` and `Reset`, persistent flag from the settings at the event's block), `GaugeEpochMetrics` | gauge voter events | plugin events | M4 |
| campaign | `Campaign` (+ `totalClaimed`, `claimCount`), `CampaignClaim` | `CampaignCreated`, `MerkleCampaignSet`, `PayoutClaimed` | plugin events | M4 |
| cross-chain | controller settings on `PluginSettings` | controller settings events | plugin events | M2 with settings |
| ens | `Domain`, `ENSResolver`, `TextRecord` | `Registered`, `ProfileMoved`, `TextChanged`, `VersionChanged` | static, mainnet | built |

A wildcard event is used only in the two places above. Elsewhere contracts are registered dynamically, as built: with a wildcard, anyone who emits the same signature adds to the events the plan counts ([security](#security)).

## Domain: one read layer

Every read is a use case of `@aragon/aragon-domain`. The BFF and the worker call the same use cases in-process and assemble no data themselves, so a read is written once and both share its cache entries. Today the package has `GetTokenVotingMembership` and `GetMemberProfileTextRecords`. A list use case takes an account set and returns rows with the total its counters give ([list rules](#list-rules)); a single DAO is a set of one.

A use case depends on store interfaces that live in the domain, the way the package already separates `MemberStore` from `EnvioMemberStore`. Which source a use case reads is fixed in its code: `GetDao` reads the indexer, `GetDaoList` the directory, `GetAssets` the indexer, RPC and prices. The caller does not know and cannot choose.

| Source | Reads | Implementation | Ships |
|---|---|---|---|
| Indexer | the entities of each module | `Envio*Store` over `EnvioClient` | in the package |
| Chain at request time | balances, ENS, token metadata, Safe info, can-create, gauge epoch | viem over the `RpcUrls` the package already takes | in the package |
| Store (Postgres) | the DAO directory, spam verdicts, campaign uploads, saved simulations | SQL | injected |
| Keyed providers | prices (CoinGecko), ABIs (explorers), the Safe Transaction Service, simulations (Tenderly), the IPFS gateway | HTTP clients with their call budgets | injected |
| Cache | every cached read | Upstash Redis | injected |

The package is published to npm, so nothing private ships in it: no database driver, no schema of ours, no provider key. The injected implementations live in one workspace package (`packages/data-sources`, working name), which also holds the Postgres schema with its migrations and queries. The app and the worker pass them to `AragonDomain.load`. An outside consumer gets the indexer and chain use cases, and a use case whose store was not supplied returns a typed error.

The layers stay apart on three points:

- The domain reads. The worker writes what it computes and the BFF writes what users submit, both through the queries of the shared package.
- The BFF holds what is HTTP: the route fork and the flags, the legacy shape, limits, BotID, and later sign-in.
- A TTL belongs to its use case, so the BFF and the worker hit the same cache entry.

### Use cases by milestone

- **M1:** `GetIndexerStatus`, `SupportedChains` from `_meta` ([APP-1176](https://linear.app/aragon/issue/APP-1176)); counter-based totals.
- **M2:** `GetPluginMembership` (multisig, admin, lock to vote), `GetVeMembership`, `GetMember`, `CheckMembership`, `GetMemberLocks`, `GetVotes`, `GetProposals`, `GetProposalBySlug`, `GetTransactionStatus`, `GetDaoPlugins` (settings part).
- **M3:** `GetDaoList`, `ListDaoChanges` (for the worker's directory sync), `GetDao`, `GetDaosByMember`, `GetDaoPermissions`, `GetAllowedActions`, `GetPluginSetup`, `GetTransactions`, `GetAssets`, `GetMemberTodo`, and the read-time use cases below ([APP-1320](https://linear.app/aragon/issue/APP-1320)).
- **M4:** `GetGauges`, `ComputeGaugeRewards`, `ComputeVeOwnerRewards`, `ComputeGovernanceRewards`, `GetCampaigns`, `GetProposalEvents` (proposals created, executed and ending in a window, for the worker).

With two indexer endpoints, `AragonDomain.load` takes an endpoint per chain set and `SupportedChains` is the union of both `_meta`s. A use case groups its account set by endpoint. One network is one endpoint; a set that spans both gets one query per endpoint, merged in the list's order ([workspaces](#workspaces)).

### Read-time sources

| Source | Upstream | Cache (Redis) | Replaces |
|---|---|---|---|
| ENS primary name and avatar | RPC (mainnet) | 1 h per address | `member.ens`, `ensValidator` |
| Token metadata and supply | RPC | 10 min per token | `tokenInfo`, `tokenTotalSupply` |
| Prices | CoinGecko | 5 min per token, served with its age | `fetchRates` |
| Balances | RPC multicall | 60 s per DAO | `daoAssets`, `asset` |
| Explorer ABI and source | Etherscan-family APIs | 24 h per address; "unverified" cached too | `contract`, `contractInfo` |
| Action decoding | ABI cache and RPC | per action hash | `contractDecoder`, `proposalActions`, `executionActions` |
| Simulations | Tenderly | result in `store.proposal_simulation`; gas-limit budget counters in Redis | `simulations`, `crossChainGasCache` |
| Can create proposal, member balance and delegate, gauge epoch info, SPP rules | RPC | 30 s | `canCreateProposal`, `memberBalance`, `gaugeInfo`, `sppRuleCondition` |
| Safe source: info, queue, history, next nonce, transaction actions | RPC for info and nonce; Safe Transaction Service, server-side, for the rest | 60 s info and history, 15 s queue, nonce uncached, actions per `safeTxHash`; a stale entry is served and refreshed after the response | `safeRead`, `safeCache`, `safeAccount`, `safeTransaction`, `safeMember`, `safeRefresh` |
| IPFS by CID (delegate statements) | gateway | no expiry | `GET /v2/ipfs/delegate-statement/:cid` |

A failed upstream read returns an error; no use case stores a failure as a value (audit, C2). Each upstream has a call budget in Redis, so a burst of distinct inputs drains the budget and returns 429 before it drains the provider's quota.

## The store for user data

One Postgres database, provisioned through the Vercel Marketplace (Neon) in the `aragon-app` scope, the way the assistant got Upstash and Blob; credentials in the `kv_app_<env>` and `kv_worker_<env>` vaults. It has two writers, each with a role limited to its tables: the BFF for what users submit, the worker for what it computes. The schema, the migrations and the queries live in the shared package ([domain](#domain-one-read-layer)). Upstash Redis is the domain's cache and holds the budgets and locks; the app gets its own database, separate from the assistant's. Curated lists stay in `aragon/app-cms`.

| Data | Today | Target | Writer | Milestone |
|---|---|---|---|---|
| Telegram subscriptions, consent, notified-event markers | `telegramSubscription`, `telegramNotifiedEvent` (Mongo); a bot process that polls Telegram; RabbitMQ | `telegram_subscription`, `telegram_notified_event` in a database of their own, which the app cannot reach | worker | M4 |
| Campaign uploads: allocation list, merkle root, proofs, leaves | `campaignReward`, `campaignMerkleRoot`; the tree is built by a gateway worker | `campaign_upload`, `campaign_allocation`; the upload route builds the tree | BFF | M4 |
| Saved proposal simulation | `proposal.simulation` | `proposal_simulation` (`none`, `success`, `failed`, url, run at) | BFF | M3 |
| Token spam verdict | `token.isSpam` (CMS sync and CoinGecko scoring jobs) | `token_spam` (network, address, verdict, source, scored at) | worker | M3 |
| DAO directory and TVL | the `dao` collection; `dao.metrics.tvlUSD`, by queue | `dao_directory` (network, address, name, description, avatar, ENS name, creator, created at, `tvl_usd`, TVL computed at, `hidden`), a copy of the indexer's `Dao` rows ([decision 1](#decisions-on-the-open-rows)) | worker | M3 |
| Hidden DAOs | `dao.isHidden`, by admin API | `hidden-daos.json` in app-cms, copied into `dao_directory.hidden` ([decision 3](#decisions-on-the-open-rows)) | worker | M3 |

The alternatives fall short in one place each. A slim Mongo Atlas keeps the vendor and the models M5 removes. Redis alone has no ordered TVL query with a search and no per-user allocation lookup across campaigns. Vercel Blob has no per-row lookup. Volume is small: tens of thousands of allocation rows, about 15 600 directory rows, under 20 000 spam rows.

Before app-backend stops (M5), one export carries the live rows over: subscriptions with consent versions (into the Telegram database), allocations of campaigns that are on chain, saved simulations, the `isHidden` list, CMS-sourced spam marks. Scored spam marks and TVL are recomputed.

## Worker

One service for the work no request starts: `apps/worker` (working name), a project of its own in this monorepo with its own release scope, the shape `apps/assistant` already has. It reads through `@aragon/aragon-domain` with its own Envio key and writes the tables the domain reads. It replaces the legacy outbox, queues and scheduled jobs, and it is where the next background task goes.

| Task | Every | Work per run | Bound |
|---|---|---|---|
| Notifications | 3 s | the proposals created or executed since each chain's block cursor and the proposals ending inside the reminder window; deduped per recipient in `telegram_notified_event`, sent, cursors moved | 20 queries a minute per indexer endpoint |
| DAO directory | 30 s | the `Dao` and `DaoMetadata` rows written since each chain's cursor, upserted into `dao_directory` | a few queries per run |
| DAO directory reload | 1 h | every `Dao` row of every chain, upserted; rows the indexer no longer has are deleted | about 16 queries of 1 000 rows |
| Curated lists | 10 min | `hidden-daos.json` into `dao_directory.hidden`, the CMS spam list into `token_spam` | two files |
| TVL refresh | 1 h | balances and prices of the DAOs that hold a priced token or native coin, stalest first; writes `tvl_usd` on the directory row | 500 DAOs per run. Legacy shows 743 DAOs with TVL above zero, 391 above $1 and 81 above $100 (2026-11-10), so one or two runs cover them |
| Spam scorer | 1 day | tokens the indexer has seen since the last run: CoinGecko presence, name and balance heuristics as today; the CMS list overrides | 1 000 tokens per run |
| Draft cleanup | 1 day | campaign drafts older than 7 days whose root is not on chain | all |

Every task takes a lock, does a bounded amount of work and resumes from a cursor in the store, so a late, missed or repeated run changes nothing. The hourly reload has no cursor, so it repairs whatever the 30-second sync missed and needs nothing special after a resync.

A second backend grows out of a worker that starts answering reads. Three limits prevent that:

- It serves no reads. Its HTTP surface is the Telegram webhook, its tick and a health check, and the UI never calls it.
- It reads chain data through the domain and keeps no model of its own. The directory is a copy of `Dao` rows with a TVL and a hidden flag.
- It writes only the tables its tasks name. The Telegram tables sit in a database of their own that the app's role cannot reach, and the bot token exists only in the worker's environment.

**Notifications.** The target is a notification within seconds of the block, faster than the 30 seconds of the legacy outbox. Envio Cloud pushes nothing, so the worker polls. The delay is the indexer's lag at the head of the chain plus up to 3 seconds; the lag is read from `_meta` and measured in the slice. The cursors only move forward, so a resync or a newly promoted deployment sends nothing twice. Acting within seconds means acting on blocks that can still be reorganised, so a notification for a proposal that a reorg removes can go out; legacy has no reorg handling either.

**Hosting** is open for the call. The tasks, the cursors and the locks are the same either way.

| | Vercel function | Always-on container |
|---|---|---|
| How it runs | QStash calls `POST /tick` every minute with a signed request, and the function loops for 55 seconds | one process with a loop |
| Infrastructure | none new; the assistant's project is the template | a container DevOps keeps after M5, when the rest of app-backend's infrastructure goes |
| Limits | a missed tick costs up to a minute once; a task has to fit the function's time limit | none of these |
| Framework | Hono, as in the assistant | Hono or Fastify |

Vercel Cron cannot be the tick: production deploys go out with `--prod --skip-domain` and an alias, the flow in which the assistant's cron stayed bound to a deployment from August and failed with 401 every day. A GitHub schedule cannot run more often than every 5 minutes.

The cost is a fourth deployable workspace: a release scope, a project or a container, `kv_worker_<env>` vaults, and a process that runs all the time.

## Decisions on the open rows

The audit's 46 `open` rows come down to ten decisions.

1. **USD value, TVL and explore.**
   - Assets: the token set of the account set comes from `DaoToken`, spam tokens are dropped, balances come from one multicall per network and prices from the cache; zero balances are dropped, amounts are summed per token, and the use case sorts and pages in memory. The set is read up to 1 000 tokens; the size of the largest sets is a [measurement](#measurements).
   - Explore reads `store.dao_directory`: one row per DAO with the fields the card and the search read (name, description, avatar, ENS name, address, creator, creation time) and `tvl_usd`. The [worker](#worker) upserts new and changed rows every 30 seconds, reloads all of them every hour and writes `tvl_usd` per account. Rows, search, the legacy order (`tvl_usd`, then `id`), the hidden filter and the total are then one SQL statement at any page, over every network and both endpoints.
   - The cost is a copy that trails the indexer by about half a minute, and by more while the worker is down; explore then shows its last state. A DAO's own page and its creator's "DAOs by member" list read the indexer and do not wait for the copy.
   - The alternative, explore from the indexer, was a TVL head from the store joined to indexer rows and then a tail in the indexer's order. Its tail has to merge two endpoints at any depth, its total needs the hidden DAOs counted per network, and its search results cannot keep the TVL order. The explore page always asks for all 14 mainnets with the TVL sort, search included, and shows the total.
   - Explore, DAOs by member and the workspace lists span every network, so they are built with the M3 slices and turn on in M4, when the indexer holds every chain.
2. **Spam filter.** Spam is a verdict per token in `store.token_spam`: the CMS list wins and the scorer fills the rest. The transactions query keeps the rows without a token and excludes the spam tokens of the account set, and the total sums the counters of the non-spam tokens ([list rules](#list-rules)). Assets are filtered in memory. `refreshSpamTokens` and `syncCmsSpamTokens` become the one scorer.
3. **DAO visibility.** `hidden-daos.json` in app-cms holds `network-address` ids and nothing else: the repository is public, so reasons stay out of it. The worker copies the ids into `dao_directory.hidden` every 10 minutes. Explore and "DAOs by member" leave hidden DAOs out, and detail and ENS lookups answer 404 for them. The current `isHidden` set is exported once into the file and the admin route goes.
4. **Condition history.** `SelectorAllowed` and `SelectorDisallowed` are indexed wildcard, keyed by the emitting address, from the chain's start block. A condition's rows exist before any plugin grants it, which registration at grant time cannot give; the plugin link is added when the grant appears. Any contract can emit these events, so the handler keeps at most 1 000 rows per emitter and marks the emitter as overflowed after that. The native-transfer allow events go the same way.
5. **Safe.** A Safe is read from the Safe itself and from the Safe Transaction Service. The indexer cannot hold it: a workspace takes any Safe by its address, and the indexer registers contracts from events only. One Safe source in the domain serves the five Safe routes, the Safe branch of the member list and of the membership check, the workspace reads and, later, the worker.
   - Owners, threshold, nonce and version come over RPC, batched per network; queue, history and a transaction's actions come from the Safe Transaction Service, server-side with the API key.
   - Legacy keeps a copy (`safeAccount`, `safeTransaction`, `safeMember`) and refreshes it in the background. The cache takes that role: a stale entry is served and refreshed after the response, a cold one is fetched inside the request's budget with four calls at a time, and what was not read is reported per account in `coverage`.
   - `/api/safe` stays what it is: the browser's proxy to the Safe Transaction Service for balances and for proposing and confirming.
   - DAOs by member skips Safe bodies. Manual tracking and `GET /v2/safe/:network/:address/transactions`, which has no caller, are dropped.
   - Tables for Safes come to the store when the cache stops being enough ([workspaces](#workspaces)).
6. **Telegram.** The bot and the notifications move to the [worker](#worker), with the Telegram tables in a database of their own. Its loop replaces the outbox job, the queue, the dead letter and the ending-soon job, and notifies within seconds of the block. It reads by block cursor, so a backfill or a resync cannot trigger notifications. `/mydata` and `/forget` keep their semantics on the new tables.
7. **Metadata retry.** The indexer retries failed IPFS fetches with its interval handler ([APP-1260](https://linear.app/aragon/issue/APP-1260)). Nothing outside the indexer refetches, and the `metadataRefetch` queue and job go.
8. **VE voting power sort.** The voting power of a lock now is arithmetic over its current amount, its start and the curve parameters, capped at the curve's maximum time. Legacy sorts the same way in its Mongo pipeline (`models/schema/lock.ts`), and its rows are delegates: it groups the locks by the address they are delegated to and leaves out locks that are withdrawn, in the exit queue or not delegated. The locks of a VE plugin are read in full (pages of 1 000), grouped by delegate, computed at request time, sorted and paged in memory. The largest VE member set is measured first; above a few thousand, the fallback is a sort by locked amount with the voting power shown.
9. **Historical lock voting power.** The current `VELock` row is not enough for a past time: `Split` and `Merged` change a lock's amount, the lock NFT can change owner, and the curve is upgradeable and has `setWarmupPeriod`. So the indexer keeps `VELockEvent`, one row per event that changes a lock, and `VESettings`, one row per curve change. `votingPowerAt(t)` in the domain takes the lock's last event at or before `t` and the curve parameters valid at `t`. Rewards are then domain computations over `VELockEvent`, `VEDelegation` and `GaugeVote` with no archive RPC. The parity harness compares a sample against `votingPowerAt` on chain.
10. **Workspace reads.** A workspace is an account set passed to the use cases the DAO pages use, plus the Safe source for its Safes ([workspaces](#workspaces)). Proposals and transactions filter with the selection as `dao _in` and take their totals from the counters. Members and assets are read to the end and paged in memory; the cap of 1 000 members per plugin stays. The selection is capped at 100 accounts, and `coverage` stays in every response.

## Security

The migration moves writes, secrets and scheduled work into the app and lets anyone on chain add rows to the indexer. The controls below belong to the slice that builds the surface.

| Surface | Risk | Control |
|---|---|---|
| Envio endpoint | anyone with the URL spends the query rate | API key required: the endpoint answers 401 without one (checked 2026-11-10). One key per indexer and environment, server-side only (`NEXT_SECRET_*`), rotated through Envio's named keys. An IP allowlist cannot be used from Vercel |
| Envio organisation | every member can deploy, promote and delete; there are no finer roles | membership limited to the app team; the Solutions indexers move into the `aragon` organisation before the app reads them; `deploy` stays a protected branch |
| Chain input that costs capacity | anyone can create DAOs, send junk tokens to a DAO, install a plugin on a token with millions of events, or emit a wildcard signature | every deploy re-indexes, so a skip list in the indexer config removes the data with the next release. Row cap per wildcard emitter. Envio's built-in alerts go to Slack, and the event counts in `_meta` are read at every release. Residual risk accepted: junk `Transfer` events to a DAO are stored until the token is listed |
| Reads on contracts Aragon did not deploy (tokens, plugins, helpers, curves) | a contract that reverts or returns garbage stops the chain, since a failed required read throws | such a read is optional by rule: the handler marks the row and continues. Required reads are for Aragon's registries and for bytecode |
| IPFS metadata | oversized or malformed JSON; hostile strings and links shown in the UI or sent to Telegram | size cap and timeout in the effect; content fetched by CID from the configured gateway only, and no URL from metadata is fetched server-side; text is escaped where it is rendered; links are limited to `http` and `https` |
| Read-time sources | public routes fan out to RPC, explorers, CoinGecko, Tenderly and the Safe service; distinct inputs bypass the cache | in the use case: address and network validated, batch sizes and decode depth capped, a call budget per upstream in Redis, failures cached briefly. In the BFF: a rate limit per IP on POST and on the expensive GETs. BotID covers POST on `/api/backend` only and fails open, so it is not the control |
| Queries to Envio and to the directory | user input reaching GraphQL or SQL | typed documents and parameterised statements with variables only; the caps of the [list rules](#list-rules) |
| Workspace requests | one request names up to 100 accounts and fans out to the Safe Transaction Service and to RPC | the selection capped at 100 and validated; four upstream calls at a time per request; the per-upstream budget; stale cache entries served; accounts that were not read reported in `coverage` and never as an empty list |
| Postgres | credentials in two environments, the app's and the worker's | one runtime role each, with DML on the tables it writes and read access to the rest it needs; a migration role used in CI only; one database per environment, and preview and local never get the production one; the Marketplace variables scoped to the environments that need them; backups on |
| Telegram database (worker) | personal data: Telegram chat ids and consent | a separate database that only the worker's role can read; no chat ids in logs or Sentry; `/forget` deletes; notified-event markers expire after 90 days |
| Telegram webhook (worker) | a public route anyone can post to | the `X-Telegram-Bot-Api-Secret-Token` header checked on every update; the bot token only in the worker's vault; outgoing text escaped, links to the app's domain only |
| Worker | a second service that holds database, provider and Envio credentials; a public route that starts work | its own vaults and its own Envio key; no route besides the webhook, the tick and health. On Vercel the QStash signature is verified on every tick; in a container there is no tick route. Tasks take no parameters, hold a lock, do bounded work and alert on a failed run |
| Campaign upload | legacy accepts a list of any length from anyone, for any capital distributor plugin | row and body size caps; rate limit and BotID; the plugin checked against the indexer; a draft expires after 7 days unless its root appears in `MerkleCampaignSet`; allocations are served only for a root that is on chain |
| app-cms | a public repository now decides visibility, spam overrides and flags | review required on `main`; the reader of a file (the worker or the BFF) validates its schema and keeps the last good copy when it fails to parse |
| M5 export | personal data in transit | a one-off script run by DevOps; the export is not stored in CI artifacts; Mongo is deleted after the new tables are checked |

## Capacity budget

### Plan limits

Envio Cloud hosting, read on 2026-11-10. The Effect API cache needs Medium or above. The indexer runs on Production Medium.

| | Development | Production Small | Production Medium | Production Large | Dedicated |
|---|---|---|---|---|---|
| Price per month | $0 | $70 | $300 | $800 | custom |
| Indexing hours included | 750 | 800 | 800 | 800 | custom |
| Extra indexing hour | – | $0.1 | $0.2 | $0.5 | custom |
| Chains per indexer | unlimited | 5 | 10 | 15 | unlimited |
| Query rate | 100/min | 250/min | 1 000/min | 2 000/min | custom |
| Events stored, approximate | 0.1 M | 1 M | 10 M | 100 M | unlimited |
| Contracts, approximate | 100 | 1 000 | 10 000 | 50 000 | unlimited |

- The plan belongs to an indexer. An indexer holds at most 3 deployments, and promote moves the static endpoint between deployments of the same indexer.
- One deployment running all month uses about 730 hours; every other running deployment adds its own. A deployment left running for a month costs $146 on Medium and $365 on Large.
- The storage row counts events. The dashboard lists the plan's storage as "~10 million events", and the plan cards say "1 – 1M events" for Small.
- The dashboard's usage panel has four lines: indexing hours used, the price of an extra hour, included storage and the query rate limit. Only the hours show usage. It has no line for contracts, so the contracts figure of the pricing page is not a metered limit.
- One repository can back several indexers, each with its own config path and branch.
- Development deployments are deleted after 30 days and have no backups. Nothing the app reads runs on Development.

### Inventory

Production app-backend through the public proxy, 2026-11-04 (`GET /v2/daos` paged per network; members, proposals and votes are the legacy `dao.metrics` counters; tokens are the distinct token and helper addresses in plugin settings).

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

Plugin families over all networks: token voting 8 157, multisig 6 555, admin 4 377, SPP 1 307, lock to vote 328, gauge 85, cross-chain 37, capital distributor 18, Safe 4, unknown 652.

The Arbitrum and Optimism member counts are the delegate sets of ARB and OP: the two Arbitrum test DAOs report 223 713 members each on the ARB token, the Optimism one 86 272 on OP. Outside them the largest member sets are in the low thousands.

### The current deployment

Ethereum and Sepolia, the dao, plugin and ens modules, every DAO and every prepared plugin registered dynamically.

| | Ethereum | Sepolia | Total |
|---|---|---|---|
| `Dao` rows (2026-11-05) | 1 181 | 5 767 | 6 948 |
| `PluginContract` rows (2026-11-05) | 1 559 | 9 679 | 11 238 |
| Registered addresses | | | **18 200** |
| Events processed (2026-11-10) | 278 142 | 36 023 | **314 165** |

The deployment has run for a month with 18 200 registered addresses on a plan whose pricing page lists about 10 000 contracts. Events grew by 75 in the five days between the two readings. Sepolia shows 6.2 events per DAO for the modules built so far.

The Envio dashboard on 2026-11-10:

- One deployment out of three slots: `2e16755`, production for a month.
- Indexing hours: 231 of 800. That is one deployment since the 1st, so the count follows the calendar month.
- Billing: $300 a month, cycle on the 12th. Two invoices came on top: $208.60 on 2026-10-05 and $66.20 on 2026-11-03. At $0.2 an hour they are 1 043 and 331 extra hours, which fits the deployments that ran next to production in September and early October (five were deleted since). September cost $508.60 and October $366.20.

### The full model

15 chains after the cuts: 14 mainnets and Sepolia, with Hemi over RPC.

| Limit | Need | Basis |
|---|---|---|
| Chains | 15, and 19 with the small testnets | the app went from 14 to 19 networks in one backend release, so the number grows |
| Registered addresses | about 45 000 (DAOs, plugins, tokens and helpers), plus escrows, lock managers and curves | inventory. Sepolia alone is 20 300, Polygon 10 200, Base 8 400, Ethereum 3 200 |
| Events stored, without transfers | about 1 M, an estimate | 6.2 registration events per DAO measured; 20 to 30 permission events per DAO assumed; proposals, votes, settings and token events from the inventory; ARB and OP on the skip list |
| Events stored, transfers | not measured | the legacy `transaction` count per network is the first [measurement](#measurements) |
| Query rate | not measured | the domain caches 15 s to 24 h per use case, so distinct page views per cache window bound it; the worker adds a steady 20 a minute per endpoint for notifications and a few for the directory; peak requests on `/api/backend` is a measurement |
| Indexing hours | about 850 per indexer a month if deployments are deleted on time | 730 for production, plus 4 releases × (a sync and 24 h of the previous production): about $10 over the plan on Medium. September and October show what happens otherwise: 1 843 and 1 131 hours |

The hours are the one limit that has cost money so far. The rule is the one in the indexer README: the previous production is deleted the day after a promote, and a candidate is deleted when its release PR closes. The hours line of the dashboard is read at every release.

No split of the chains brings an indexer under 10 000 addresses, because Sepolia alone registers twice that. The dashboard does not meter contracts, and the current deployment runs with about twice the listed figure. M1 adds 3 750 tokens and takes the current indexer to about 21 900, which is the load of each half of a two-indexer split.

### Subscriptions

| Subscription | Plan | State | Use |
|---|---|---|---|
| App, organisation `aragon`, indexer `aragon-indexer` | Production Medium | production, 2 chains | production through M3; one of the two production indexers from M4 |
| Solutions | Production Medium, annual | being retired by Solutions, offered to the migration (2026-10-27) | the measurement stand now; the second production indexer from M4 |
| Solutions | Production Small, annual | same | spare; the four small testnets if QA needs them after M5 |

Three questions to Jota decide whether the Solutions plans can be used at all: the renewal date, the organisation they live in, and whether an indexer there can be pointed at `aragon-indexer` or the plan moved to a new indexer in `aragon`.

The Solutions Medium cannot hold release candidates. A candidate has to sync on the indexer whose endpoint it will take, because promote works inside one indexer. Candidates stay deployments of the production indexer, as the release flow builds them.

### Plan by milestone

1. **Before the call.** Ask Jota the three questions. The dashboard is read ([the current deployment](#the-current-deployment)).
2. **M1–M3, two chains.** Production stays on the app's Medium. M1 lands at 21 900 addresses; its sync is the check that an indexer on Medium carries that many.
3. **Measurement stand, during M1–M2.** Throwaway deployments on the Solutions Medium from a `stand/*` branch with its own config, deleted after each run:
   - the built modules on the ten largest chains (36 900 addresses): sync time and events per chain;
   - wildcard `Transfer` filtered by DAO addresses on Sepolia and Polygon: whether a filter of 6 400 addresses syncs, and the transfer volume the treasury slice brings;
   - `DelegateVotesChanged` and `DelegateChanged` of ARB and OP over a bounded block range: the size of what the skip list keeps out.
4. **M4, all chains.** Two production indexers from the same repository, one config each, on the two Mediums. Sepolia with seven of the ten small chains on one, Polygon, Base, Ethereum and Arbitrum with the other three on the other: 21 000 to 24 000 addresses each, 15 of 20 chain slots used. A release then has two candidates and two promotes, and the readiness gate and the parity run cover both endpoints. A breaking schema change is promoted on both before the matching domain ships.
5. **Fallback.** One Production Large for production if any of these holds at the start of M4: Envio starts to enforce the contracts figure; one indexer's share of events passes 10 M; the Solutions plans cannot be used or end before M4.

| | Two Mediums | One Large |
|---|---|---|
| Cost per month | $600; the second Medium is paid until the Solutions renewal | $800 |
| Chain slots | 20, 15 used | 15, 15 used; the next network needs a second indexer |
| Contracts listed (not metered) | 2 × ~10 000 against 45 000 | ~50 000 against 45 000 |
| A deployment left running for a month | $146 | $365 |
| Events stored | 2 × ~10 M | ~100 M |
| Endpoints | 2: a workspace that spans both reads one query per endpoint per page; two candidates and two promotes per release | 1: a workspace's DAO accounts are one query |

Workspaces make reads across networks the common case, which speaks for one endpoint. Two things keep two Mediums the plan. The merge exists on any plan, because a workspace with a Safe already reads a second source. And Large has no free chain slot, so the 16th network brings a second indexer there too. One Large buys single-query workspace lists for $200 a month until that network arrives.

### Measurements

| What | How | Owner | Feeds |
|---|---|---|---|
| Rows per legacy collection per network: `transaction`, `tokenMember`, `logDelegateChanged`, `lock`, `tokenDelegation`, `vote`, `proposal`, `daoPermission`, `selectorPermission`, `setting`, `voteGauge` | one `countDocuments` script on production Mongo | Cecir | events stored |
| The ten governance tokens with the most delegation events, and the tokens with `ignoreTransfer` | the counts above, grouped by token | Cecir | the skip list |
| Largest token set of a DAO and largest VE member set | `transaction` grouped by DAO and token; `lock` grouped by escrow | Cecir | decisions 1 and 8 |
| Sync time, transfer volume, ARB and OP volume | the stand runs | Cecir, Andrii | hours, events stored |
| Peak requests per minute on `/api/backend` | Cloudflare analytics or the backend nginx log | DevOps | query rate |
| Sepolia DAO count: 5 767 `Dao` rows against 6 407 in legacy (mainnet 1 181 against 1 184) | explain the 640 before the parity harness: another registry, legacy rows for tracked accounts, or a missed event | Cecir | parity |

## Order of work to M4

Dependencies, without dates. The indexer track is one person wide (Cecir), so its order sets the order of the slices. The other tracks run next to it.

| Track | Order | Unblocks |
|---|---|---|
| Gates (M1) | BFF fork and readiness gate ([APP-1177](https://linear.app/aragon/issue/APP-1177)), indexer status ([APP-1176](https://linear.app/aragon/issue/APP-1176)), parity script ([APP-1178](https://linear.app/aragon/issue/APP-1178)), Sepolia in the members slice ([APP-1180](https://linear.app/aragon/issue/APP-1180)) | every slice: none turns on without the fork, the gate and a parity report |
| Indexer | 1. token voting on the foundation, with the token skip list ([APP-1172](https://linear.app/aragon/issue/APP-1172)). 2. proposals and votes with their counters ([APP-1198](https://linear.app/aragon/issue/APP-1198)). 3. the settings snapshot and total supply on the proposal ([APP-1200](https://linear.app/aragon/issue/APP-1200)), current settings per family. 4. multisig, admin and lock-to-vote members ([APP-1196](https://linear.app/aragon/issue/APP-1196)). 5. SPP ([APP-1192](https://linear.app/aragon/issue/APP-1192)). 6. VE locks, lock events and curve settings ([APP-1101](https://linear.app/aragon/issue/APP-1101)). 7. permissions and conditions. 8. `Transaction` and `DaoToken` with their counters | step 2 carries the most: votes, proposals, member detail, the counters, `GetTransactionStatus`, the workspace to-do and later the worker's notifications. Steps 7 and 8 are M3, and step 8 waits for the transfer spike |
| Domain and app | per indexer module: the use case, the contract suite, the BFF mapper in the legacy shape, parity ([APP-1199](https://linear.app/aragon/issue/APP-1199), [APP-1201](https://linear.app/aragon/issue/APP-1201), [APP-1184](https://linear.app/aragon/issue/APP-1184), [APP-1197](https://linear.app/aragon/issue/APP-1197), then [APP-1319](https://linear.app/aragon/issue/APP-1319)) | the slice flag |
| Read-time sources (domain) | the shared package with the cache and the provider clients; then ENS, prices, balances, ABI and decoding, simulations, Safe ([APP-1320](https://linear.app/aragon/issue/APP-1320)) | they need the fork and Redis and nothing from the indexer, so they start in M2 next to the indexer track |
| Worker | the project and its hosting in M2; the directory, TVL, spam and cleanup tasks in M3; notifications in M4 | explore and assets in M3 wait for the directory and the spam verdicts |
| Workspaces | now, in app-backend and the app: the cursor contract of the workspace lists, while the flag is on in local only. M3: the Safe source, account sets in the use cases, `GetMemberTodo` | the workspace routes move with the M3 slices and need no slice of their own |
| Infra (DevOps) | Redis, before the first read-time source; Postgres and the worker's hosting, before simulations, spam and the DAO directory in M3; 1Password for the indexer's release-candidate workflow (SREDO-788); the Telegram database in M4 | M3 stops on provisioning if these start late |
| Spikes and measurements (now) | the Mongo counts; wildcard `Transfer` filtered by DAO addresses, run locally with `envio dev` on Sepolia; sync time on the stand | the treasury slice and the plan choice at M4 |

Before M3 starts: the transfer spike is done, Redis and Postgres are provisioned, the worker runs, the paging contract of the workspace lists is decided, and product has accepted the 5 000-row end of filtered lists and decided on ERC721.

Before M4 starts: every route is marked migrated, dropped or deferred in the fork's route table (the ADR's M3 exit), the stand runs are done, and the choice between two Mediums and one Large is made. The routes that span networks (explore, DAOs by member, the workspace queries) turn on in M4, with the last chains.

## Risks to settle before M5

- **No fallback after M5.** Until M5 a domain failure falls back to legacy on page 1. After it nothing stands behind the indexer, and Envio offers an uptime SLA and failover on Dedicated only. The decision belongs in [APP-1321](https://linear.app/aragon/issue/APP-1321). The options: keep app-backend read-only for a period after M4, serve the last good response from the cache while the indexer is down, or move production to Dedicated.
- **A fix to the indexer ships after a full resync.** Rollback is fast while the previous deployment exists. A forward fix takes the sync time, which is not measured for the full model. The stand gives the number; the split over two indexers and the effect cache shorten it.

## Open for the call

1. Two Mediums at M4 with Large as the fallback, and the answers on the Solutions plans.
2. The cuts: the ARB and OP skip list, Safes read from the Safe source, no settings history, policies deferred, small testnets out, ERC721 with product.
3. Lock history as `VELockEvent` rows in APP-1101.
4. The store on Neon through the Marketplace with Upstash as the cache, or a Postgres DevOps runs; vault names.
5. The worker: one service for all background work, and where it runs, a Vercel function on a QStash tick or an always-on container (DevOps); its name and vaults.
6. The domain as the one read layer, with the store and the provider clients injected from a shared package; explore from the DAO directory.
7. Workspaces: cursor paging for the workspace lists before the flag leaves local, and where saved workspaces will live.
8. The route table with its test in APP-1177, as the list M5 is checked against.
9. The order of work, and owners and dates for the measurements.
