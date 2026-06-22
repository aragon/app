# Aragon Subdomain

Shared business-logic package for the Aragon governance platform. It is the single home for everything a frontend consumer needs that *isn't* raw on-chain data — membership rules, voting-power math, delegation logic, permission checks, ENS profile enrichment. Paired with [`aragon-indexer`](../aragon-indexer) (which provides only deterministic, indexed on-chain state), it lets any frontend consumer stay thin.

Today the package ships one capability — looking up the ENS text records attached to a member's `.aragon.eth` subdomain — with the rest of the surface area arriving as the Envio migration progresses.

> **About the name.** "Subdomain" here is the DDD sense — a bounded subdomain of the Aragon business domain — and it happens to overlap with the ENS `.aragon.eth` subdomains that the first use case reads. The package is not limited to ENS work; that's just what ships first.

## How it fits in

```
On-chain events → Envio (aragon-indexer) → aragon-subdomain → Frontend consumers
```

`aragon-indexer` indexes raw on-chain state. `aragon-subdomain` queries that indexed data, pulls non-deterministic data from other sources, applies domain rules, and returns clean DTOs. Consumers (the App Next.js BFF, an MCP server, future mobile app, etc) call into a single `AragonSubdomain` controller.

## Architecture

Built with Domain-Driven Design on top of [`ddd-core-ts`](https://github.com/asciiman/ddd-core-ts). Three layers, dependencies point inward:

| Layer | Purpose | Depends on |
|-------|---------|------------|
| **Domain** | Pure business logic — value objects, aggregates, store interfaces | Nothing |
| **Use Cases** | Application logic that orchestrates domain objects and I/O | Domain |
| **Infrastructure** | Adapters for Envio and other external systems; the public controller | Domain + Use Cases |

Validation is done with [`zod`](https://zod.dev) inside domain value objects, and the Envio adapter talks to the indexer through [`graphql-request`](https://github.com/jasonkuhrt/graphql-request).

## Quick start

Requires Node >= 24.13 (pinned in [`.nvmrc`](./.nvmrc)) and pnpm >= 11 (pinned via `packageManager` in `package.json`). Use [nvm](https://github.com/nvm-sh/nvm) for Node and Corepack for pnpm:

```bash
nvm install        # installs the Node version from .nvmrc
nvm use
corepack enable    # activates the pinned pnpm 11 version

pnpm install
pnpm run build
pnpm run test
```

## Usage

```ts
import { AragonSubdomain, EnvioClient } from '@aragon/aragon-subdomain';

const envioClient = new EnvioClient({ /* ... */ });
const aragon = AragonSubdomain.load(envioClient);

const records = await aragon.getMemberProfileTextRecords({
  subdomain: 'alice.aragon.eth',
});
// → [{ key: 'avatar', value: 'ipfs://…' }, …]
// Returns [] if the subdomain is unknown, has no resolver, or has no records.
```

## Roadmap

This package is the target for the [Envio migration](https://www.notion.so/aragonorg/Plan-POC-to-use-Envio-as-backend-32e6b18349dc8084a1d9f8886539c8ad), which moves governance business logic out of `app-backend` and `app` and into a shared library. Upcoming areas, in rough order:

- **Membership** — list members for a plugin, routed by governance type (ERC20 vs. VE)
- **Voting power** — VP calculation per governance type, including VE locks
- **Delegation** — delegation relationships and validation rules
- **Permissions** — proposal-creation and membership permission checks
- **Member detail** — single-member views enriched with balances and ENS metadata

Scope is tracked against the [Aragon Governance Membership Domain Model](https://www.figma.com/board/WTlB4By8MoKhh5BJ58dpVE/Aragon-Governance---Membership-Domain-Model).

## Development

### Publishing a snapshot release to npm

Snapshot releases let you test unreleased changes from a branch on npm without cutting a real version. The flow uses [Changesets](https://github.com/changesets/changesets) and a manually-dispatched GitHub Actions workflow.

1. **Add a changeset locally** describing the change:

   ```bash
   pnpm changeset
   ```

   Pick the bump type and write a short summary. Commit the generated file under `.changeset/` and push your branch.

2. **Run the snapshot workflow.** On GitHub, go to *Actions → Publish → Run workflow* and select your branch. The workflow builds the package, runs `pnpm changeset version --snapshot`, and publishes to npm under a per-run dist-tag (`snapshot-<run-id>`). Publishing uses [npm Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/) — no npm token is involved.

3. **Install the snapshot** in a consumer — the exact command also appears in the workflow run's summary:

   ```bash
   pnpm add @aragon/aragon-subdomain@snapshot-<run-id>
   ```

Each run gets its own dist-tag, so multiple in-flight branches can publish snapshots in parallel without colliding. The workflow won't publish anything if no changesets are pending.

## Related projects

| Package | Path | Relationship |
|---------|------|--------------|
| `aragon-indexer` | `/aragon-indexer` | Upstream — Envio indexer this package queries |
| `app` | `/app` | Consumer — Next.js frontend and BFF |
| `app-backend` | `/app-backend` | Consumer being replaced as logic moves here |
