# Data-layer migration

Decision record for moving the app's data from `app-backend` to [aragon-indexer](https://github.com/aragon/aragon-indexer) (Envio) and [aragon-domain](/packages/aragon-domain/README.md), one read model at a time.

- **Status:** accepted, 2026-10-06; roadmap added 2026-10-07. Owner: Platform team.
- **Project:** [Migration to Envio and aragon-domain](https://linear.app/aragon/project/migration-to-envio-and-aragon-domain-e1c1b0cdc8b8) (milestones M0 to M5).
- **Goal:** every read the app makes moves off `app-backend`, and `app-backend` is retired.
- **Out of scope:** data created by users (campaign uploads, Telegram subscriptions, hidden DAOs) gets one small store, decided in the target model ([APP-1318](https://linear.app/aragon/issue/APP-1318)). Gauge rewards stay a read-time computation.

Some mechanisms below do not exist yet. They are marked **(pending APP-xxxx)**. An accepted decision does not mean its tooling is already built.

## Principles

- Two layers, no new backend. The indexer holds deterministic read models and metadata by CID; the domain and the BFF compose volatile sources at read time behind a cache.
- Nothing is ported one for one. The legacy audit ([APP-1317](https://linear.app/aragon/issue/APP-1317)) gives every app-backend route, collection and job a verdict: read model, simplify, read time, Envio provides, bury. Slices follow the verdicts; the bury list is the deletion list of M5.
- The UI does not know what feeds it. The BFF forks per route between app-backend and the domain behind one flag per slice (CMS). A migrated route keeps its path and its JSON shape; the domain DTO is mapped to the app's view model inside the BFF. The fork sits in both server entry points: the `/api/backend` proxy for the browser and `AragonBackendService` for RSC. The token-voting members route (app#1128) stays as built.
- Legacy stays the source of truth for a slice until its parity report is clean on Sepolia and mainnet. The BFF falls back to legacy on page 1 and never mixes two sources in one list.
- The app never calls Envio directly. It goes through `@aragon/aragon-domain` and the BFF service: a route for the browser, in-process for RSC prefetch.
- One multichain indexer. Every deploy re-indexes from the start blocks while the previous deployment keeps serving. Capacity (chains, events, registered contracts, requests per minute) is budgeted before a chain is added.
- Every count the app shows is computed at index time, because the hosted endpoint has no aggregates.
- The DDD foundation of `aragon-domain` stays.

## Where data lives

| Data | Layer |
|---|---|
| Derived from events or calls at a fixed block (DAOs, plugins, members, votes, proposals, settings, SPP, transfers, permissions) | indexer |
| Immutable by key (IPFS metadata by CID, for DAOs, plugins and proposals) | indexer effect, cached |
| Volatile external (ENS names, prices, balances, Safe service, ABIs, simulations, current-state RPC reads) | domain and BFF at read time, cached |
| Not read by the app (admin queues, monitors, integrity tools) | dropped |
| Created by users (campaign uploads, Telegram subscriptions, hidden DAOs) | one small store ([APP-1318](https://linear.app/aragon/issue/APP-1318)) |

## Indexer decisions

Settled in [aragon-indexer#33](https://github.com/aragon/aragon-indexer/pull/33). The rules live in the indexer's [AGENTS.md](https://github.com/aragon/aragon-indexer/blob/main/AGENTS.md).

- **Deterministic reads only.** Chain reads run at the event's block hash. IPFS metadata is fetched by CID. Both go through Envio effects, cached by the Effect API (hosted plan Production Medium).
- **Failed fetches.** A failed optional metadata fetch is stored with `fetchSucceeded: false`, keeps the previous display fields and is never cached. A failed required chain read throws and stops the indexer. Retrying failed fetches between deploys is planned **(pending APP-1260)**.
- **Metadata is indexed.** DAO and plugin metadata get one row per `MetadataSet`, the latest `ACTIVE` and older ones `HISTORY`. `Dao` also carries the current name, description, avatar and links, so lists and search by name read one row.
- **Read time.** Primary ENS names and prices are resolved at read time in the domain. The ENS text records of `aragon.eth` member names are indexed.
- **Plugin family** is read from the code behind the plugin (proxies and clones followed). The repo `subdomain` is stored as a fact only.
- **Chains and ids.** Every entity has `network` (`ethereum-mainnet`) and `chainId: Int! @index`. Ids start with the network, with two exceptions kept for compatibility: `Domain` is the bare subnode namehash, and `ENSResolver` and `TextRecord` keep their `chainId-` ids.
- **Start blocks.** Each chain starts at its DAORegistry deployment (mainnet 16721858, Sepolia 4421512). The ENS contracts on mainnet start at the MemberRegistry deployment (25179000).
- **Proposal metadata is indexed** through the same IPFS effect as DAO and plugin metadata, so lists and search read stored titles.
- **An unknown preparation on `*Applied` stops the indexer** by design: the PSP is deployed after the start block. The legacy audit ([APP-1317](https://linear.app/aragon/issue/APP-1317)) revisits this if real cases appear.

## Entity contract and cutover

`schema.graphql` is the contract with `@aragon/aragon-domain`. A rebuilt entity keeps its name and its fields.

Breaking: removing or renaming an entity or a field, changing a type or nullability, changing an id format, or changing what a value means. Adding an entity or an optional field is not breaking. A breaking change ships only together with the matching domain change.

**Cutover rule.** A deployment takes the static endpoint only when its schema serves everything the released domain reads. Before a candidate deployment is promoted, the domain contract suite runs against the candidate's own endpoint with the domain production serves: the domain ships inside the app and has no tags of its own, so that is the domain at the latest `@aragon/app` release. The indexer's `Release candidate` workflow does this for every release PR and writes the result to the `envio/candidate` status on the PR head ([indexer README, "Release"](https://github.com/aragon/aragon-indexer/blob/main/README.md#release)). By hand, from the app monorepo checked out at that release:

```bash
ENVIO_GRAPHQL_ENDPOINT=<candidate endpoint> ENVIO_API_TOKEN=… pnpm --filter @aragon/aragon-domain test:contract
```

The [`Aragon Domain Contract Test`](/.github/workflows/aragon-domain-contract-test.yml) workflow runs the same suite every night against the development endpoint. It is not a required check, and a green run against the serving deployment says nothing about a candidate. Today the suite covers token-voting membership on mainnet only; each slice extends it with its own queries, ENS records included.

## Slice definition of done

Copy this into every slice ticket. The ENS profile records are the exception, see below.

- [ ] Indexer: entities and handlers merged, unit tests at 100 % coverage, a replay fixture per DAO archetype the slice touches.
- [ ] Domain: use case and DTO merged; the contract suite covers the new queries and passes against the target deployment.
- [ ] BFF: the route switches to the domain behind the slice flag, keeps the legacy shape, applies the readiness gate and the page-1 fallback, and reports `source` **(pending APP-1177)**.
- [ ] Parity script clean for the slice on Sepolia and mainnet; known legacy defects listed, not reproduced **(pending APP-1178)**.
- [ ] Product sign-off on a preview URL.
- [ ] Rollback checked: with the flag off, a list restarted from page 1 returns `source: 'backend'`.

**ENS profile records** (`domainMemberProfile`, **pending APP-1177**) have no legacy source and already serve mainnet in production. Off or not ready returns 503 and the rename dialog shows an unavailable state; it never falls back.

## Rollout

Slice order: token-voting members (M1); multisig and admin members, votes, proposals with SPP, settings history, member detail, VE (M2); DAO list, detail and explore, treasury, decoding, simulations, Safe and RPC reads (M3); gauges, campaigns and the remaining chains (M4).

| Milestone | Exit |
|---|---|
| M0 Foundations | domain in the monorepo; indexer foundation and release flow merged; ADR merged; vaults and CI secret in place |
| M1 Indexer base and members | legacy audit and target model reviewed; token-voting members rebuilt with the contract suite green and the development endpoint switched; BFF fork and readiness gate; parity clean for members |
| M2 Governance read models | the M2 slices behind flags below production, Sepolia first; parity clean per slice on Sepolia and mainnet |
| M3 DAO read model and read-time routes | DAO read model from the indexer; read-time routes through the BFF; every app-backend route marked migrated, dropped or deferred; user-data store decided |
| M4 All chains and production | remaining HyperSync chains within the plan limits; every slice on in production; legacy frozen |
| M5 Retire app-backend | proxy removed, services stopped, Mongo and RabbitMQ cancelled, repository archived |

Sepolia first. A slice turns on for Sepolia in local, development, preview and staging, where the Sepolia gate runs: correctness on 6 335 DAOs and every plugin family. Mainnet follows in the same environments once that gate is clean, with the mainnet gate: scale and real data ([APP-1189](https://linear.app/aragon/issue/APP-1189)). Both gates fit in one week. Production turns the slice on for both chains together, with 48 h of observation, `*_domain_error` at zero and a Slack note with the Sentry link ([APP-1186](https://linear.app/aragon/issue/APP-1186)). Other chains follow as a config change, a resync and a parity sample. The ENS profile records stay on mainnet in every environment, as today.

## Readiness gate

**(pending APP-1177)**

- The domain reads `_meta` per chain (cached about 30 s): `chainId`, `isReady`, `progressBlock`, `sourceBlock`, `readyAt`. Lag is `sourceBlock - progressBlock`. `!isReady`, a lag above the chain's limit, a missing row or an unreachable endpoint is a domain failure.
- A domain failure on a list falls back to legacy on page 1 and logs `envio_lag_fallback` to Sentry. A later page of a domain-served list fails instead of switching source; a list that started on legacy stays on legacy.
- The set of indexed chains comes from `_meta`, not from app code.
- The ENS text-records route (`/api/domain/member-profile/[subdomain]/records`) has no legacy source. It gets its own `domainMemberProfile` slice entry and gate; when off or not ready it returns 503 and the rename dialog shows an unavailable state.
- There is no shadow mode: parity runs offline against both sources ([APP-1178](https://linear.app/aragon/issue/APP-1178)).

## Rollback ladder

From fastest and smallest to slowest. Check each step by restarting the list from page 1: a later page of a domain-served list fails instead of switching to legacy, and already rendered pages do not change.

| Step | Undoes | Who | Time |
|---|---|---|---|
| 1. Cookie override off | the slice in one browser | anyone | next request |
| 2. CMS flag off in `aragon/app-cms` `feature-flags.json` | the slice for everyone in that environment | app team | CMS cache revalidates every 600 s; measured time recorded in [APP-1185](https://linear.app/aragon/issue/APP-1185) |
| 3. Promote the previous Envio deployment | a bad indexer deployment | indexer owners | Envio describes the switch as instant; measured end to end in APP-1185 |

A cookie override wins over the CMS, so step 2 does not turn the slice off for a browser that has it forced on; clear the `aragon.featureFlags.overrides` cookie before checking (see [local overrides](/apps/app/src/shared/featureFlags/README.md#local-overrides-debugging)). Slices have no per-chain switch: a chain that is not ready falls back through the readiness gate, and a chain leaves the domain only when it leaves the indexer. Step 3 only works while the previous deployment still exists and serves the schema the released domain reads: it stays for a day after a promote and is deleted by hand.

## Legacy freeze

Once a slice is on in production, its legacy handlers in `app-backend` take bug fixes only; CODEOWNERS covers those paths **(pending APP-1187)**. The nightly parity run catches drift **(pending APP-1178)**.

## Capacity

Envio Production Medium: 10 chains, 10M events, about 10 000 registered contracts, 1 000 requests a minute, $300 a month. Production Large: 15 chains, 100M events, about 50 000 contracts, 2 000 requests a minute, $800 a month. The app serves 14 networks, 13 of them on HyperSync (Hemi is not). Dynamic registration counts towards contracts: Sepolia alone registers about 17 000 DAO and plugin addresses. The budget and the tier decision are in the target model ([APP-1318](https://linear.app/aragon/issue/APP-1318)); a chain is added only inside the budget. The BFF caches domain reads and the app sits behind Cloudflare, so a scraping run never reaches the Envio rate limit.

## Runbook

### Read the indexer status

```graphql
query {
    _meta {
        chainId
        isReady
        readyAt
        progressBlock
        sourceBlock
        startBlock
    }
}
```

Read the row of each chain the slice serves: chain 1 today, since `domainNetworks` is mainnet only, while 11155111 is indexed and waits for the member slice to serve it ([APP-1180](https://linear.app/aragon/issue/APP-1180)). `isReady` means the chain caught up once (`readyAt` says when), not that it is healthy now. Lag is `sourceBlock - progressBlock`; a `sourceBlock` that stops moving can hide a stalled source, so read twice and check that `progressBlock` moves. A missing row or an unreachable endpoint counts as not ready.

### Deploy and switch an indexer version

An indexer version is a release PR in aragon-indexer. Its `Release candidate` workflow deploys the PR head to Envio, follows the sync, runs the domain contract suite (the cutover rule) and reports in the `envio/candidate` status on the PR head and in the release's Slack thread. Promote, the effect cache and deleting the previous production are manual. The steps live in the indexer README and are not repeated here: ["Release"](https://github.com/aragon/aragon-indexer/blob/main/README.md#release) for a release, ["Deployments"](https://github.com/aragon/aragon-indexer/blob/main/README.md#deployments) for a `main` commit outside a release.

On the app side, run the status checks above on the candidate's endpoint before the promote and through the static endpoint after it. The previous production stays for a day as step 3 of the rollback ladder; rolling back promotes it the same way, after the status checks and the contract suite against it.

### Turn a slice off

1. Set the slice flag to `false` for the environment in [`aragon/app-cms` `feature-flags.json`](https://github.com/aragon/app-cms/blob/main/feature-flags.json). The only migration flag today is `domainMemberList`. For one browser only, set it in the `aragon.featureFlags.overrides` cookie instead.
2. Clear any forced-on cookie, restart the list from page 1 and check the response has `source: 'backend'`.
3. If one chain is the problem, promote the previous indexer deployment (rollback ladder, step 3); slices have no per-chain switch.

## Links

- Indexer: [README](https://github.com/aragon/aragon-indexer/blob/main/README.md), [AGENTS.md](https://github.com/aragon/aragon-indexer/blob/main/AGENTS.md)
- Domain: [README](/packages/aragon-domain/README.md), [AGENTS.md](/packages/aragon-domain/AGENTS.md)
- Feature flags: [README](/apps/app/src/shared/featureFlags/README.md)
- Legacy audit and target model: [APP-1317](https://linear.app/aragon/issue/APP-1317), [APP-1318](https://linear.app/aragon/issue/APP-1318)
- Envio: [zero-downtime deployments](https://docs.envio.dev/docs/HyperIndex/hosted-service-features#zero-downtime-deployments), [Effect API cache](https://docs.envio.dev/docs/HyperIndex/hosted-service-features#effect-api-cache)
