# AGENTS.md — Aragon Subdomain

## What This Repo Is

This package encapsulates all governance business logic for the Aragon platform. It replaces business logic currently fragmented across `app-backend` (Node.js) and `app` (Next.js frontend), consolidating it into a single importable TypeScript package.

The package sits between the Envio on-chain indexer (`envio-testing/`) and the Next.js BFF layer. It queries indexed data from Envio, applies domain logic (membership aggregation, voting power calculation, permission checks), enriches with external data (ENS, token prices), and exposes use cases via a controller.

## How to Approach This Repo

### Read `ddd-core-ts` first

This repo is built on [`ddd-core-ts`](https://github.com/asciiman/ddd-core-ts). **Before writing any code, read the `ddd-core-ts` package README thoroughly.** It defines the specific patterns, base classes, naming conventions, and architectural rules that this repo must follow. Key things it covers:

- `ValueObject`, `Entity`, `UseCase`, `DomainError`, `DomainEvent`, `ProcessManager` base classes
- Store (repository) pattern: interface in domain, implementation in infrastructure
- Mapper and DTO conventions
- `handleRequest` controller wiring
- Zod validation at domain object creation
- Error handling with `ResultOrError` and `defineError`

Every domain object, use case, store, and controller in this repo must conform to the `ddd-core-ts` patterns. Do not invent alternative patterns.

### Follow the domain model diagram

The [Aragon Governance Membership Domain Model](https://www.figma.com/board/WTlB4By8MoKhh5BJ58dpVE/Aragon-Governance---Membership-Domain-Model) is the source of truth for naming and relationships. Use the terms from the diagram, not from legacy codebases (`app-backend`, `ve-governance-indexer`). Those are being deprecated.

Key domain concepts from the diagram:

- **Governance Plugin** — decides via votes, has Membership
- **Membership** — contains multiple Members
- **Member** — has Identity (ENS, avatar), Metrics, and Voting Power
- **Voting Power** — provided by different mechanisms depending on governance type
- **TokenVoting Delegation** — ERC20Votes: DelegateChanged, DelegateVotesChanged (all-or-nothing balance delegation)
- **VotingEscrow Delegation** — per-lock NFT delegation via EscrowIVotesAdapter
- Both TokenVoting Delegation and VotingEscrow Delegation provide VP to the TokenVoting Plugin

### Architecture layers

```
src/
├── domain/          # Pure business logic — no I/O, no infrastructure imports
├── use-cases/       # Application logic — orchestrates domain objects
└── infrastructure/  # Adapters — Envio client, ENS resolver, RPC readers, controllers
```

Dependencies flow inward: Infrastructure → Use Cases → Domain. The domain layer has zero external dependencies beyond `ddd-core-ts` and `zod`.

### Project structure within each layer

Follow the `ddd-core-ts` project structure conventions:

```
src/
├── domain/
│   ├── member/
│   │   ├── Member.ts                    # Value object
│   │   ├── MemberMetrics.ts            # Value object
│   │   └── MemberFilter.ts            # Value object
│   ├── membership/
│   │   ├── Membership.ts               # Aggregate
│   │   ├── GovernanceType.ts           # as const enum
│   │   └── GovernanceTypeResolver.ts   # Pure function
│   ├── voting-power/
│   │   ├── VotingPower.ts
│   │   ├── ERC20VotingPower.ts
│   │   └── VEVotingPower.ts
│   └── ...
│
├── use-cases/
│   ├── GetMembership.ts
│   ├── GetERC20Membership.ts
│   ├── GetVEMembership.ts
│   └── ...
│
└── infrastructure/
    ├── controllers/
    │   └── MemberController/
    │       ├── MemberController.ts
    │       └── maps/
    ├── stores/
    │   ├── EnvioTokenVotingDelegationStore/
    │   ├── EnvioVELockStore/
    │   └── ...
    └── services/
        ├── EnsResolver.ts
        └── TokenPriceProvider.ts
```

## Key Rules

1. **Domain objects use Zod validation** in their `create()` factory methods. No invalid objects can exist.
2. **Value objects are immutable.** Use copy-and-modify patterns for state changes.
3. **Use cases have a single `execute()` method** and a `code` string matching the class name.
4. **Store interfaces live in the domain layer.** Implementations live in infrastructure.
5. **All dependencies are constructor-injected.** No singletons, no service locator.
6. **Mappers are co-located** with the infrastructure code that uses them, not in the domain.
7. **One public class per file.** Filename matches the class name.
8. **No `I` prefix on interfaces.** Use `MemberStore`, not `IMemberStore`.
9. **`as const` over TypeScript enums.**
10. **Named exports only.** No default exports.

## Data Sources

The primary data source is the Envio indexer (`envio-testing/`), which provides:

- `TokenVotingDelegation` — ERC20Votes delegation state (delegator, delegate, voting power)
- `VELock` — Voting escrow lock positions (amount, status, delegation)
- `Plugin` — Installed governance plugins (type, associated contracts)
- `VESettings` — Escrow configuration (curve parameters)
- `MemberMetrics` — Vote/proposal activity counts

Infrastructure adapters query this data via Envio's GraphQL/SQL API. Additional data comes from:
- ENS resolution (name, avatar)
- On-chain RPC reads (real-time token balance, current voting power)
- Token price feeds (USD conversion)

## Testing

- Unit tests for domain logic (value objects, aggregates, pure functions)
- Unit tests for use cases with mocked store interfaces
- Integration tests for infrastructure adapters
- Test files colocated: `Member.ts` → `Member.test.ts`
- Use domain factory methods (`Member.create(...)`) to build test data
