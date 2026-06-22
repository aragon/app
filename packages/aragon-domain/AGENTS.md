# AGENTS.md — Aragon Domain

Business logic package between the Envio indexer (`aragon-indexer/`) and the Next.js BFF. Built on [`ddd-core-ts`](https://github.com/asciiman/ddd-core-ts).

## Read `ddd-core-ts` first

**Before writing any code, read the `ddd-core-ts` package README.** It defines the base classes (`ValueObject`, `Entity`, `UseCase`, `DomainError`, `DomainEvent`, `ProcessManager`), the store/repository pattern, the mapper and DTO conventions, the `handleRequest` controller wiring, Zod-at-creation validation, and `ResultOrError` / `defineError` error handling. Every domain object, use case, store, and controller in this repo must conform. Do not invent alternative patterns.

Domain terminology comes from the [Aragon Governance Membership Domain Model](https://www.figma.com/board/WTlB4By8MoKhh5BJ58dpVE/Aragon-Governance---Membership-Domain-Model) — use those names, not legacy names from `app-backend` or `ve-governance-indexer`.

## Repo map

```
src/
├── domain/          # Pure business logic — no I/O. Only depends on ddd-core-ts and zod.
├── use-cases/       # Application logic — orchestrates domain objects.
└── infrastructure/  # Adapters — Envio client, controllers, stores, mappers.
```

Dependencies flow inward: Infrastructure → Use Cases → Domain.

- **Path alias:** `@/*` resolves to `src/*` (see `tsconfig.json`). Always import as `@/domain/...`, never relative.
- **Public surface:** `src/index.ts` exports `AragonDomain` (the controller) and `EnvioClient`. That's the entire consumer-facing API.
- **Scripts:** `pnpm run build | test | lint | type-check`. Lint auto-formats via biome.

Today the domain implements only `MemberProfile` (ENS text records on `.aragon.eth` subdomains). Other concepts (`Member`, `Membership`, `VotingPower`, `Delegation`, `Lock`, etc.) are planned — see `ENVIO_MIGRATION_PLAN.md`. Do not assume they exist.

## Canonical examples

When in doubt, copy the shape of these files:

| Concern | File |
|---------|------|
| Controller + `handleRequest` wiring | `src/infrastructure/controllers/AragonController/AragonController.ts` |
| Store-side mapper (Zod trust boundary) | `src/infrastructure/stores/EnvioMemberProfileStore/maps/MemberProfileTextRecordMap.ts` |
| Use case (single `execute()`, `code` field) | `src/use-cases/GetMemberProfileTextRecordsUseCase.ts` |
| Value object with Zod-at-`create()` | `src/domain/member-profile/MemberProfileTextRecord.ts` |
| Store interface in domain | `src/domain/member-profile/MemberProfileStore.ts` |

## Primitives

Reusable domain primitives live in `src/domain/primitives/` and are re-exported from the barrel `@/domain/primitives`. Use these instead of raw types.

| Primitive | Use instead of | Notes |
|-----------|---------------|-------|
| `Address` | `string` for Ethereum addresses | Build via `Address.fromHexString(hex)` |
| `HexString` | `string` for 0x-prefixed hex | Use as parameter type to catch invalid input at compile time |
| `HexNumber` | `string` / `bigint` for hex-encoded numbers | |
| `Wei` / `Gwei` / `Ether` | `BigNumber` for EVM unit values | |
| `UUID` | `string` for UUIDs | |
| `Page<T>` / `PageRequest` | ad-hoc pagination shapes | |

At infrastructure boundaries where external data enters as `string` (DTOs from Envio), cast with `as HexString` inside mappers — the runtime check happens in the primitive's factory. Serialize back out with `.toHexString()`.

## Conventions

| Rule | Why it matters |
|------|----------------|
| One public class per file; filename matches class name | Grep-ability; ddd-core-ts module-discovery assumptions |
| Named exports only | No default exports anywhere |
| `as const` over TypeScript `enum` | |
| No `I` prefix on interfaces (`MemberStore`, not `IMemberStore`) | |
| All dependencies constructor-injected; no singletons | |
| Domain objects validate via Zod inside `create()` | Invalid objects cannot exist |
| Value objects are immutable; copy-and-modify for state changes | |
| Use cases expose a single `execute()` and a `code` string matching the class name | `handleRequest` dispatch |
| Store interfaces live in domain; implementations in infrastructure | |
| Mappers co-located with the infrastructure code that uses them | Not in `domain/` |
| Tests colocated next to source (`Member.ts` → `Member.test.ts`) | Not in a separate `test/` folder |
| 2-space indent; multi-line JSDoc only (`/**\n * ...\n */`) | Enforced by biome |

## Mappers (the trust boundary)

`EnvioClient.query` returns `unknown`. Stores never declare DTO interfaces inline and never pass a type argument to `query`. The store's job is orchestration (form variables, call client, combine results, wrap errors). Shape assertions and DTO → domain conversion happen exclusively in mappers.

Each mapper module owns:

1. Zod schemas describing the response, with TypeScript types derived via `z.infer<...>` — the schema is the single source of truth.
2. A conversion function named exactly **`mapDTOToDomain(raw: unknown)`** (DTO → domain) or **`mapDomainToDTO(...)`** (domain → DTO). These names are load-bearing — `handleRequest` looks them up on controller-side mapper modules by name, so the convention is non-negotiable everywhere.
3. A `.parse()` call as the first line. Parse failures become descriptive runtime errors when the indexer's response shape drifts.

Auxiliary helpers within a mapper (private parsers, ID extractors) keep descriptive names — the rule applies to the conversion function the rest of the codebase calls.

Reference: `src/infrastructure/stores/EnvioMemberProfileStore/maps/MemberProfileTextRecordMap.ts`.

## Testing

- Unit-test domain logic and use cases (with mocked store interfaces); integration-test infrastructure adapters.
- Build test data with the domain factory methods (`MemberProfileTextRecord.create(...)`), not by hand-constructing objects — invalid shapes won't even compile.

## Data sources

Primary: the Envio indexer (`aragon-indexer/`). See `aragon-indexer/AGNETS.md` for entity schemas — do not duplicate them here.
Secondary: ENS resolution (name, avatar), on-chain RPC reads, token price feeds.
