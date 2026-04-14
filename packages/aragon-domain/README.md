# Aragon Subdomain

Business logic package for the Aragon governance platform. Encapsulates all domain logic, application use cases, and infrastructure adapters for governance membership, voting power, delegation, and permissions.

Part of the broader [Envio migration plan](https://www.notion.so/aragonorg/Plan-POC-to-use-Envio-as-backend-32e6b18349dc8084a1d9f8886539c8ad) to replace the existing `app-backend` with Envio-based indexing and a shared business logic layer.

## Purpose

Currently, business logic is fragmented between `app-backend` (Node.js backend) and `app` (Next.js frontend). This package consolidates all governance business logic into a single importable package that can be consumed by:

- **Next.js BFF** (`app/src/app/api/`) — thin API routes that delegate to this package
- **Utility services** — cron jobs, storage services that execute application logic from here
- **Frontend** — domain rules (e.g., delegation validation) imported directly

## Architecture

Built with Domain-Driven Design using [`ddd-core-ts`](https://github.com/asciiman/ddd-core-ts). Three layers with inward-pointing dependencies:

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **Domain** | Pure business logic, value objects, aggregates, store interfaces | None |
| **Use Cases** | Application logic, orchestrates domain objects and I/O | Domain only |
| **Infrastructure** | Adapters for Envio, ENS, RPC, token pricing | Domain + Use Cases |

## Domain Model

Based on the [Aragon Governance Membership Domain Model](https://www.figma.com/board/WTlB4By8MoKhh5BJ58dpVE/Aragon-Governance---Membership-Domain-Model).

### Domain Objects (planned)

| Domain Area | Objects | Description |
|-------------|---------|-------------|
| **Member** | `Member`, `MemberMetrics`, `MemberFilter` | Core member identity and activity |
| **Membership** | `Membership`, `GovernanceType`, `GovernanceTypeResolver` | Plugin membership aggregation |
| **Voting Power** | `VotingPower`, `ERC20VotingPower`, `VEVotingPower` | VP calculation per governance type |
| **Delegation** | `Delegation`, `DelegationRules` | Delegation relationships and validation |
| **Lock** | `VELock`, `LockLifecycle`, `LockFilter` | VE lock positions and state machine |
| **Permission** | `ProposalCreationPermission`, `MembershipPermission` | Governance permission rules |

### Use Cases (planned)

| Use Case | Description |
|----------|-------------|
| `GetMembership` | List members for a plugin (routes by governance type) |
| `GetERC20Membership` | ERC20-specific: query delegates, enrich with metrics |
| `GetVEMembership` | VE-specific: calculate VP from locks, group by delegate |
| `GetMemberDetail` | Single member: governance data + metrics + balance |
| `GetMemberLocks` | VE lock history for a member |
| `CheckMemberExists` | Boolean membership check |
| `CheckProposalCreationPermission` | Can this member create a proposal? |
| `GetDaosByMember` | Cross-DAO membership lookup |

### Infrastructure Adapters (planned)

| Adapter | Purpose |
|---------|---------|
| Envio GraphQL/SQL client | Query indexed on-chain state |
| ENS resolver | Name resolution |
| On-chain balance/VP reader | Real-time token balance and voting power via RPC |
| Token price provider | USD pricing for token balances |

## Data Flow

```
On-chain events → Envio (envio-testing/) → aragon-subdomain → Next.js BFF → Frontend
```

- **Envio** indexes raw on-chain state (delegations, locks, plugin installations)
- **aragon-subdomain** queries Envio data, applies business logic (VP calculation, membership aggregation, permission checks), enriches with external data (ENS, token prices)
- **Next.js BFF** provides thin API routes that call aragon-subdomain use cases
- **Frontend** renders the results

## Quick Start

```bash
pnpm install
pnpm run build
pnpm run test
```

## Related Projects

| Package | Path | Role |
|---------|------|------|
| `envio-testing` | `/envio-testing` | Envio indexer for on-chain event data |
| `app-backend` | `/app-backend` | Legacy backend (being replaced) |
| `app` | `/app` | Next.js frontend |
| `ve-governance-indexer` | `/ve-governance-indexer` | Production VE governance indexer (reference) |
