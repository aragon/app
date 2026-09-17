---
type: reference
title: Source repositories
tags: [repositories, cross-cutting]
status: draft
source: aragon-knowledge-base/sources/repos/ (2026-07-06) + protocol-doc repository snapshot (2026-08-03, see log.md) + app and app-backend App CMS verification + aragon/ve-governance and aragon/osx-capital-distributor repository verification (2026-08-04, see log.md) + inspect-first entry-point verification (2026-08-04, see log.md)
---

# Source repositories

The codebases the platform is built from — the raw sources these docs interpret. Local paths assume the standard sibling checkout under `c:\dev\`, except for the pinned `protocol-doc/` submodule inside this repository.

**Inspect first** names the one file or directory to open before anything else in that checkout: the place that orients a reader on what the repository owns. It is a starting point — see [what each entry point owns](#what-each-entry-point-owns) below for why each was chosen and what a reader should expect around it.

| Repo | Local path | Inspect first | What it is |
|---|---|---|---|
| `app` | `../app` | `apps/app/src/plugins/index.ts` | The platform frontend (the Aragon app). |
| `app-backend` | `../app-backend` | `src/services/aragon-api/routers/v2/index.ts` | The platform backend services. |
| `app-cms` | — | — | The Git-backed content and configuration source documented in [App CMS](./app-cms.md). It can affect the product independently of main app releases; the frontend consumes featured-content, visibility, compliance-list, and feature-flag files, while `app-backend` synchronizes its reported-spam-token list. |
| `gov-ui-kit` | `../gov-ui-kit` | `src/index.ts` | The governance UI component library — the components behind the [dialog taxonomy](./design/dialog-taxonomy.md) and the app's other design patterns. |
| `osx` | `../osx` | `src/core/dao/DAO.sol` | The Aragon OSx contracts; documented in the [protocol docs](./protocol-doc/index.md). |
| `staged-proposal-processor-plugin` | — | — | The Staged Proposal Processor contract behind advanced staged governance; documented in the [protocol docs](./protocol-doc/plugins/spp-plugin.md). Canonical repo: [`aragon/staged-proposal-processor-plugin`](https://github.com/aragon/staged-proposal-processor-plugin); pinned protocol-doc snapshot: [`676617a9`](https://github.com/aragon/staged-proposal-processor-plugin/commit/676617a9ca). |
| `ve-governance` | — | — | The public contract suite behind [veLocker](./governance/velocker.md) and [Gauge voting](./governance/gauge-voting.md), including its `IVotes` adapter, escrow, curves, exit queue, epoch clock, Gauge Voter, and deployment factory. Canonical repo: [`aragon/ve-governance`](https://github.com/aragon/ve-governance); inspected `develop` commit: [`408ad144`](https://github.com/aragon/ve-governance/commit/408ad144cf33c016b9ef1a2a6118f394a7ff439c). Its mechanisms are not yet covered by the pinned protocol documentation. |
| `osx-capital-distributor` | — | — | The public contract suite behind [Capital Distributor](./governance/capital-distributor.md): campaign lifecycle, Merkle allocation, claims, payout encoders, factories, and plugin setup. Canonical repo: [`aragon/osx-capital-distributor`](https://github.com/aragon/osx-capital-distributor); inspected `development` commit: [`8577c133`](https://github.com/aragon/osx-capital-distributor/commit/8577c133be83b5a95176581752e0b391f65dc3c5). |
| `aragon-domain` | — | — | A first-party package the frontend depends on for Aragon-name and profile record reads — the code behind [Aragon Names](./accounts/aragon-names.md), [Aragon Profiles](./accounts/aragon-profiles.md), and [ENS as the profile layer](./accounts/ens-as-the-profile-layer.md). Consumed as a published dependency like `gov-ui-kit`, with no local checkout. |
| `protocol-doc` | `./protocol-doc` | `index.md` | The read-only upstream protocol knowledge base, pinned as a git submodule ([local entry point](./protocol-doc/index.md), [GitHub](https://github.com/aragon/protocol-doc)); platform pages link into this snapshot per [WORKFLOW.md](./WORKFLOW.md). |
| `conditions` | `../conditions` | `src/factory/ConditionFactory.sol` | The condition library — ready-made condition contracts (e.g. the [execute selector condition](./protocol-doc/helpers/condition-library/execute-selector-condition.md)) used for granular [permission management](./access-control/scoped-authority.md); documented in the [protocol docs](./protocol-doc/helpers/condition-library.md). Canonical repo: [`aragon/conditions`](https://github.com/aragon/conditions), publicly published as a versioned artifacts package. |

## What each entry point owns

- **`app` → `apps/app/src/plugins/index.ts`.** Names every plugin the app supports and initializes each one's registration, so it is the shortest route to where governance behavior actually lives ([plugin slots](./design/plugin-slots.md) owns the mechanism). The file it feeds, `apps/app/src/initPluginRegistry.ts`, also initializes other extension registries; registry presence alone is not evidence that a feature is live. Two layout facts save a reader time: the frontend is `apps/app`, and the workspace's own hand-written architecture documents have drifted from the code on their plugin and module inventories while the generated ones are current — so where the two disagree, trust the directory listing.
- **`app-backend` → `src/services/aragon-api/routers/v2/index.ts`.** The API surface the frontend actually reads, and its route groups map onto the product's own areas, which makes it the fastest orientation for a backend whose product role is serving derived chain state. The second stop is `src/services/aragon-indexer/configIndexer.ts`, the single best inventory of which on-chain events become that state. The repository runs nine deployable services from thin launchers at the repo root over one shared source tree, so it is not nine independent codebases.
- **`gov-ui-kit` → `src/index.ts`.** Two exports that are the whole architecture: brand-agnostic primitives under `src/core`, and governance-domain composites under `src/modules/components`. The [dialog taxonomy](./design/dialog-taxonomy.md)'s two components live in `core`, not modules.
- **`osx` → `src/core/dao/DAO.sol`.** The DAO account itself — the contract that holds assets, executes actions, and stores the permission table every plugin authorizes against; its own documentation names it the framework's entry point. `src/` divides into `common/`, `core/`, and `framework/`. Ignore `packages/`: it holds only a stranded pre-Foundry test suite that no current build references.
- **`protocol-doc` → `index.md`.** The upstream bundle's own front door, carrying a start-here reading path and a browse-by-area map over the protocol's concepts, framework, plugins, and helpers. Read-only here.
- **`conditions` → `src/factory/ConditionFactory.sol`.** A short factory that names and deploys the library's complete set of conditions, so it doubles as the inventory: selector allow-listing for `execute()` batches, selector allow-listing for direct calls, and Safe-owner gating.

One caveat when answering component questions from these checkouts: the local `gov-ui-kit` is an earlier release than the version `app` builds against, so a component read here may lag the one the app ships.
