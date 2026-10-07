# Data-layer migration

Decision record for moving the app's data from `app-backend` to [aragon-indexer](https://github.com/aragon/aragon-indexer) (Envio) and [aragon-domain](/packages/aragon-domain/README.md), one read model at a time.

- **Status:** accepted, 2026-10-06. Owner: Platform team.
- **Project:** [Migration to Envio and aragon-domain](https://linear.app/aragon/project/migration-to-envio-and-aragon-domain-e1c1b0cdc8b8) (milestones M0 to M4).
- **Out of scope:** treasury, prices and gauge rewards. DAO explore and detail pages are decided in [APP-1194](https://linear.app/aragon/issue/APP-1194).

Some mechanisms below do not exist yet. They are marked **(pending APP-xxxx)**. An accepted decision does not mean its tooling is already built.

## Principles

- Legacy stays the source of truth until a slice is proven on Sepolia.
- The BFF falls back to legacy on the first page and never mixes two sources in one list.
- Every slice ships behind its own feature flag and its own network list. Flags flip through the CMS without a deploy; network lists change in app code.
- The app never calls Envio directly. It goes through `@aragon/aragon-domain` and the BFF service: a route for the browser, in-process for RSC prefetch.
- One multichain indexer. Every deploy re-indexes from the start blocks while the previous deployment keeps serving.
- Every count the app shows is computed at index time, because the hosted endpoint has no aggregates.
- The DDD foundation of `aragon-domain` stays. The domain DTO is the shape the app reads; legacy responses are mapped into it.

## Indexer decisions

Settled in [aragon-indexer#33](https://github.com/aragon/aragon-indexer/pull/33). The rules live in the indexer's [AGENTS.md](https://github.com/aragon/aragon-indexer/blob/main/AGENTS.md).

- **Deterministic reads only.** Chain reads run at the event's block hash. IPFS metadata is fetched by CID. Both go through Envio effects, cached by the Effect API (hosted plan Production Medium).
- **Failed fetches.** A failed optional metadata fetch is stored with `fetchSucceeded: false`, keeps the previous display fields and is never cached. A failed required chain read throws and stops the indexer. Retrying failed fetches between deploys is planned **(pending APP-1260)**.
- **Metadata is indexed.** DAO and plugin metadata get one row per `MetadataSet`, the latest `ACTIVE` and older ones `HISTORY`. `Dao` also carries the current name, description, avatar and links, so lists and search by name read one row.
- **Read time.** Primary ENS names and prices are resolved at read time in the domain. The ENS text records of `aragon.eth` member names are indexed.
- **Plugin family** is read from the code behind the plugin (proxies and clones followed). The repo `subdomain` is stored as a fact only.
- **Chains and ids.** Every entity has `network` (`ethereum-mainnet`) and `chainId: Int! @index`. Ids start with the network, with two exceptions kept for compatibility: `Domain` is the bare subnode namehash, and `ENSResolver` and `TextRecord` keep their `chainId-` ids.
- **Start blocks.** One `start_block` per chain, the DAORegistry deployment (mainnet 16721858, Sepolia 4421512).

## Entity contract and cutover

`schema.graphql` is the contract with `@aragon/aragon-domain`. A rebuilt entity keeps its name and its fields.

Breaking: removing or renaming an entity or a field, changing a type or nullability, changing an id format, or changing what a value means. Adding an entity or an optional field is not breaking. A breaking change ships only together with the matching domain change.

**Cutover rule.** A deployment takes the static endpoint only when its schema serves everything the released domain reads. Before a candidate deployment is promoted, the domain contract suite runs against the candidate's own endpoint with the domain production serves: the domain ships inside the app and has no tags of its own, so that is the domain at the latest `@aragon/app` release. The indexer's `Release candidate` workflow does this for every release PR and writes the result to the PR ([indexer README, "Release"](https://github.com/aragon/aragon-indexer/blob/main/README.md#release)). By hand, from the app monorepo checked out at that release:

```bash
ENVIO_GRAPHQL_ENDPOINT=<candidate endpoint> ENVIO_API_TOKEN=… pnpm --filter @aragon/aragon-domain test:contract
```

The [`Aragon Domain Contract Test`](/.github/workflows/aragon-domain-contract-test.yml) workflow runs the same suite every night against the development endpoint. It is not a required check, and a green run against the serving deployment says nothing about a candidate. Today the suite covers token-voting membership on mainnet only; each slice extends it with its own queries, ENS records included.

## Slice definition of done

Copy this into every list slice ticket (members, votes, proposals). The ENS profile records are the exception, see below.

- [ ] Indexer: entities and handlers merged, unit tests at 100 % coverage, an integration test replaying a real block.
- [ ] Domain: use case and DTO merged; the contract suite covers the new queries and passes against the target deployment.
- [ ] App: BFF route behind the slice flag and its network list, with the readiness gate and the page-1 fallback **(pending APP-1177)**.
- [ ] Shadow mode on for the slice, mismatch below 0.5 % for 7 days **(pending APP-1177)**.
- [ ] Parity report clean for the slice **(pending APP-1178)**.
- [ ] Product sign-off on a preview URL.
- [ ] Runbook updated for the slice: its flag, its network list and how to check its source.
- [ ] Rollback checked: with the flag off, a list restarted from page 1 returns `source: 'backend'`.

**ENS profile records** (`domainMemberProfile`, **pending APP-1177**) have no legacy source and already serve mainnet in production. Off or not ready returns 503 and the rename dialog shows an unavailable state; it never falls back.

## Rollout

Slice order on Sepolia: token-voting members, multisig and admin members, VE members and locks, votes, proposals, member detail. SPP proposals, the settings log, the other chains and Hemi come in M4.

For the list slices, in the order above:

| Stage | local | development | preview | staging | production |
|---|---|---|---|---|---|
| M2: slice behind its flag | Sepolia | Sepolia | Sepolia | Sepolia | legacy |
| M3: Sepolia default | Sepolia | Sepolia | Sepolia | Sepolia | Sepolia |
| M4: mainnet gate passed | + mainnet | + mainnet | + mainnet | + mainnet | + mainnet |
| Other chains | config change and a parity sample after mainnet |||||

The ENS profile records stay on mainnet in every environment, as today.

- **Sepolia gate** (correctness, 6 335 DAOs and every plugin family): the M2 exit for each slice is the flag on in every environment below production, shadow mismatch under 0.5 % for 7 days, a clean parity report and product sign-off.
- **Production on Sepolia (M3):** one slice per day, 24 h of observation each, `*_domain_error` at zero before the next. Each flip is announced in Slack with the Sentry dashboard link and verified by product on production Sepolia DAOs, recorded in the rollout ticket ([APP-1186](https://linear.app/aragon/issue/APP-1186)). M3 ends after two weeks without a P1.
- **Mainnet gate** (scale and real data): parity on a mainnet sample and page latency on the largest plugins, per slice ([APP-1189](https://linear.app/aragon/issue/APP-1189)).

## Readiness gate and shadow mode

**(pending APP-1177)**

- The domain reports each chain's indexer status (cached about 30 s). `!isReady`, a lag above the chain's limit, or an unreachable status is a domain failure.
- A domain failure on a list falls back to legacy on page 1 and logs `envio_lag_fallback` to Sentry. A later page of a domain-served list fails instead of switching source; a list that started on legacy stays on legacy.
- The ENS text-records route (`/api/domain/member-profile/[subdomain]/records`) has no legacy source. It gets its own `domainMemberProfile` slice entry and gate; when off or not ready it returns 503 and the rename dialog shows an unavailable state.
- Shadow mode (`domainShadow<Slice>` flags) calls both sources, serves legacy and reports field differences as `<slice>_shadow_mismatch`, with the sampling rate set per environment.

## Rollback ladder

From fastest and smallest to slowest. Check each step by restarting the list from page 1: a later page of a domain-served list fails instead of switching to legacy, and already rendered pages do not change.

| Step | Undoes | Who | Time |
|---|---|---|---|
| 1. Cookie override off | the slice in one browser | anyone | next request |
| 2. CMS flag off in `aragon/app-cms` `feature-flags.json` | the slice for everyone in that environment | app team | CMS cache revalidates every 600 s; measured time recorded in [APP-1185](https://linear.app/aragon/issue/APP-1185) |
| 3. Remove the network from the slice's network list **(pending APP-1177)** | the slice on one chain | app team | an app deploy; measured in APP-1185 |
| 4. Promote the previous Envio deployment | a bad indexer deployment | indexer owners | Envio describes the switch as instant; measured end to end in APP-1185 |

A cookie override wins over the CMS, so step 2 does not turn the slice off for a browser that has it forced on; clear the `aragon.featureFlags.overrides` cookie before checking (see [local overrides](/apps/app/src/shared/featureFlags/README.md#local-overrides-debugging)). Today there is one shared list, `domainNetworks` in `aragonDomainService.constants.ts`, which also configures the domain's RPC urls, so removing a chain there is not a single-slice rollback; per-slice lists come with `domainNetworksBySlice`. Step 4 only works while the previous deployment still exists and serves the schema the released domain reads: it stays for a day after a promote, and the indexer's release workflow reminds in Slack before it is deleted by hand.

## Legacy freeze

Once a slice is on in production, its legacy handlers in `app-backend` take bug fixes only.

**(pending APP-1187)** CODEOWNERS covers those paths and the PR template asks whether a change touches a migrated slice. A nightly parity run per slice catches drift and opens a ticket for an unexplained mismatch.

## Runbook

### Read the indexer status

```graphql
query {
    _meta {
        chainId
        isReady
        progressBlock
        sourceBlock
        progressBlockTime
    }
}
```

Read the row of each chain the slice serves (1 and 11155111 today). `isReady` means the chain caught up once, not that it is healthy now. Lag is `sourceBlock - progressBlock`; a `sourceBlock` that stops moving can hide a stalled source, so also compare `progressBlockTime` with the current time. A missing row or an unreachable endpoint counts as not ready.

### Deploy and switch an indexer version

An indexer version is a release PR in aragon-indexer. Its `Release candidate` workflow deploys the PR head to Envio, waits for `_meta.isReady` on chains 1 and 11155111, runs the domain contract suite (the cutover rule) and reports in the PR and in the release's Slack thread; the flow is in the [indexer README, "Release"](https://github.com/aragon/aragon-indexer/blob/main/README.md#release). Promote, the cache and deleting the previous production stay manual, with the commands in the PR comment:

1. Run the status checks above on the candidate's own endpoint: lag small and `progressBlockTime` recent on both chains. Lag limits per chain come with APP-1177.
2. Promote it: `envio-cloud deployment promote aragon-indexer <sha> aragon --yes`. The static endpoint stays the same. Run the status checks again through it.
3. Save Cache on the new production once it is synced (Envio dashboard, Quick Actions) and keep it selected under Settings → Cache. A deployment restores the selected cache when it is created, so a cache saved after a candidate exists helps only the next one. The cache is off today; the first promoted deployment of the new entities creates it. The workflow reminds at every promote.
4. Delete the previous production the next day; the workflow reminds. Until then it is the rollback.
5. To roll back, promote the previous deployment the same way, after the status checks and the contract suite against it.

A `main` commit outside a release goes to hosting by hand ([indexer README, "Deployments"](https://github.com/aragon/aragon-indexer/blob/main/README.md#deployments)).

### Turn a slice off

1. Set the slice flag to `false` for the environment in [`aragon/app-cms` `feature-flags.json`](https://github.com/aragon/app-cms/blob/main/feature-flags.json). The only migration flag today is `domainMemberList`. For one browser only, set it in the `aragon.featureFlags.overrides` cookie instead.
2. Clear any forced-on cookie, restart the list from page 1 and check the response has `source: 'backend'`. The debug panel will show the source **(pending APP-1177)**.
3. If one chain is the problem, remove it from the slice's network list and deploy the app **(pending APP-1177)**; today's shared `domainNetworks` list affects every slice.

## Links

- Indexer: [README](https://github.com/aragon/aragon-indexer/blob/main/README.md), [AGENTS.md](https://github.com/aragon/aragon-indexer/blob/main/AGENTS.md)
- Domain: [README](/packages/aragon-domain/README.md), [AGENTS.md](/packages/aragon-domain/AGENTS.md)
- Feature flags: [README](/apps/app/src/shared/featureFlags/README.md)
- Envio: [zero-downtime deployments](https://docs.envio.dev/docs/HyperIndex/hosted-service-features#zero-downtime-deployments), [Effect API cache](https://docs.envio.dev/docs/HyperIndex/hosted-service-features#effect-api-cache)
