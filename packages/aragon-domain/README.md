# Aragon Domain

Shared business-logic package for the Aragon governance platform. It is the single home for everything a frontend consumer needs that *isn't* raw on-chain data — membership rules, voting-power math, delegation logic, permission checks, ENS profile enrichment. Paired with [`aragon-indexer`](https://github.com/aragon/aragon-indexer) (which provides only deterministic, indexed on-chain state), it lets any frontend consumer stay thin.

Today the package ships two capabilities — listing the members of a TokenVoting plugin (ERC20Votes delegates with voting power, delegation count, activity window and primary ENS name) and looking up the ENS text records attached to a member's `.aragon.eth` subdomain — with the rest of the surface area arriving as the Envio migration progresses.

## How it fits in

```
On-chain events → Envio (aragon-indexer) → aragon-domain → Frontend consumers
```

`aragon-indexer` indexes raw on-chain state. `aragon-domain` queries that indexed data, pulls non-deterministic data from other sources, applies domain rules, and returns clean DTOs. Consumers (the App Next.js BFF, an MCP server, future mobile app, etc) call into a single `AragonDomain` controller.

## Architecture

Built with Domain-Driven Design on top of [`ddd-core-ts`](https://github.com/asciiman/ddd-core-ts). Three layers, dependencies point inward:

| Layer | Purpose | Depends on |
|-------|---------|------------|
| **Domain** | Pure business logic — value objects, aggregates, store interfaces | Nothing |
| **Use Cases** | Application logic that orchestrates domain objects and I/O | Domain |
| **Infrastructure** | Adapters for Envio and other external systems; the public controller | Domain + Use Cases |

Validation is done with [`zod`](https://zod.dev) inside domain value objects, and the Envio adapter talks to the indexer through [`graphql-request`](https://github.com/jasonkuhrt/graphql-request).

## Quick start

The package lives in the [`aragon/app`](https://github.com/aragon/app) monorepo; Node, pnpm, the dependency catalog, lint and changesets all come from the repo root. Install from the root and run the package scripts through a filter:

```bash
pnpm install
pnpm --filter @aragon/aragon-domain build
pnpm --filter @aragon/aragon-domain test         # vitest with a 100 % coverage gate
pnpm --filter @aragon/aragon-domain type-check
```

`apps/app` depends on it as `workspace:*`, and Turbo builds `dist/` before the app's type-check and tests run.

## Usage

```ts
import { AragonDomain, EnvioClient } from '@aragon/aragon-domain';

const envioClient = new EnvioClient(ENVIO_GRAPHQL_ENDPOINT, ENVIO_API_TOKEN);
// RPC endpoints keyed by chain id. The mainnet (1) entry backs ENS reverse
// resolution and is required — `load` throws without it.
const aragon = AragonDomain.load(envioClient, { 1: MAINNET_RPC_URL });

const membership = await aragon.getTokenVotingMembership({
  chainId: 1,
  pluginAddress: '0xCa6f…15F3', // a TokenVoting plugin…
  tokenContractAddress: '0xcb8b…6905', // …and its ERC20Votes token
  page: 1,
  pageSize: 20,
});
// → { success: true, result: { metadata: { page, pageSize, totalPages, totalRecords },
//                              data: [{ address, ens, votingPower, delegationCount, … }] } }

const records = await aragon.getMemberProfileTextRecords({
  subdomain: 'alice.aragon.eth',
});
// → { success: true, result: [{ key: 'avatar', value: 'ipfs://…' }, …] }
// The result is [] if the subdomain is unknown, has no resolver, or has no records.
```

Every controller method returns a `ResultOrError` envelope from `ddd-core-ts`: check `success` before reading `result`; failures carry an `error` instead of throwing.

## Roadmap

This package is the target for the [Envio migration](https://www.notion.so/aragonorg/Plan-POC-to-use-Envio-as-backend-32e6b18349dc8084a1d9f8886539c8ad), which moves governance business logic out of `app-backend` and `app` and into a shared library. The decisions, rollout and runbook are in the [data-layer migration ADR](/apps/app/docs/projectDocs/dataLayerMigration.md). Upcoming areas, in rough order:

- **Membership** — list members for a plugin, routed by governance type (ERC20 vs. VE)
- **Voting power** — VP calculation per governance type, including VE locks
- **Delegation** — delegation relationships and validation rules
- **Permissions** — proposal-creation and membership permission checks
- **Member detail** — single-member views enriched with balances and ENS metadata

Scope is tracked against the [Aragon Governance Membership Domain Model](https://www.figma.com/board/WTlB4By8MoKhh5BJ58dpVE/Aragon-Governance---Membership-Domain-Model).

## Development

### Changes and releases

Add a changeset from the repo root (`pnpm changeset`) that names only `@aragon/aragon-domain`: the package has its own `aragon-domain` release scope (`.github/release-scopes.yml`), so a PR that also changes the app needs a second changeset for `@aragon/app`. Lint, type-check and the 100 % coverage gate run in the `test` job of `App Development`, like for every workspace.

Releases go through **Aragon Domain Release Start** → release PR → tag `@aragon/aragon-domain@x.y.z` → npm publish behind an approval; snapshots through **Aragon Domain Publish**. The full flow is in [RELEASING.md](./RELEASING.md).

### Contract test against the deployed indexer

The test suite runs on canned indexer responses, so it cannot notice when the deployed `aragon-indexer` changes shape. [`test/contract/`](./test/contract) sends the real query documents to a live endpoint and lets the mappers' schemas validate what comes back. `pnpm test` leaves it out, and it is skipped unless the endpoint is set. The suite asserts mainnet data, so the indexer must serve chain 1.

The `Aragon Domain Contract Test` workflow (`.github/workflows/aragon-domain-contract-test.yml`) runs it every night against the development indexer, with the endpoint and token the development app reads (`NEXT_SECRET_ENVIO_*` in the `kv_app_development` 1Password vault); it can also be started by hand. It is not a required check. Locally:

```bash
ENVIO_GRAPHQL_ENDPOINT=https://… ENVIO_API_TOKEN=… pnpm --filter @aragon/aragon-domain test:contract
```

Run it whenever the indexer's `schema.graphql` changes.

## Related projects

| Package | Location | Relationship |
|---------|----------|--------------|
| `aragon-indexer` | [`aragon/aragon-indexer`](https://github.com/aragon/aragon-indexer) | Upstream — Envio indexer this package queries |
| `app` | [`apps/app`](../../apps/app) in this repo | Consumer — Next.js frontend and BFF |
| `app-backend` | [`aragon/app-backend`](https://github.com/aragon/app-backend) | Consumer being replaced as logic moves here |
