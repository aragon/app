---
type: reference
title: Basic action view audit
tags: [maintenance, governance, actions]
source: app@f8bf9e87260190aefd7d8a0eb59f72844e6e4502 + installed @aragon/gov-ui-kit@2.11.2; inspected 2026-09-10 + product-owner BENQI scope clarification (2026-09-13, see log.md)
---

# Basic action view audit

Evidence for the completed `mine-and-document-basic-action-views` task. The observed app and installed dependency expose **22 action identities: 20 selectable specialized create/edit forms and 19 specialized details dispatches**, including a mislabelled removal summary. These counts describe component selection with its required data, not 20 universally usable forms or 19 universally correct summaries. The product coverage is [Basic action views](../../application/basic-action-views.md).

- [Create/edit inventory](./basic-action-views/create-edit.md) — every identity, runtime spelling, call signature, component, rendering path, import behavior and prerequisite.
- [Details inventory](./basic-action-views/details.md) — the same identities, normalized spellings, component dispatch, nested-path differences and generic fallbacks.
- [Rendering paths and normalization](./basic-action-views/rendering-paths.md) — registrations, actual consumers, initialization, ordering, fallbacks and client contributions.
- [Content map](./basic-action-views/content-map.md) — structure comparison, canonical homes and publication dispositions.
- [UI-kit implementation excerpts](./basic-action-views/ui-kit-implementation.txt) — actual installed bundle spans, source-map identities and original line/column coordinates.

## Source snapshot

| Source | Observed state |
| --- | --- |
| App | [f8bf9e87260190aefd7d8a0eb59f72844e6e4502](https://github.com/aragon/app/commit/f8bf9e87260190aefd7d8a0eb59f72844e6e4502), branch `develop`; tracked working tree clean. Only untracked `operating-model/worktrees/` was present; it was not a source. No drift from the commissioned app commit. |
| Installed UI-kit | `apps/app/node_modules/@aragon/gov-ui-kit/package.json` reports **2.11.2**, matching the commissioning observation. Implementation inspected directly in `dist/index.es.js`. |
| Lockfile | [Catalog](https://github.com/aragon/app/blob/f8bf9e87260190aefd7d8a0eb59f72844e6e4502/pnpm-lock.yaml#L12) and [app importer](https://github.com/aragon/app/blob/f8bf9e87260190aefd7d8a0eb59f72844e6e4502/pnpm-lock.yaml#L240) resolve **2.11.3**, via `catalog:`. [Package integrity](https://github.com/aragon/app/blob/f8bf9e87260190aefd7d8a0eb59f72844e6e4502/pnpm-lock.yaml#L705): `sha512-ukyJYUCddgnbzZkwf3F6vEaplEhs6+1+OnoksFAYVIhRDg3GZiint/0d++shSuaPbl+6Jqm2eXMKnN5Voq/2wg==`. The installed tree is stale relative to the lockfile. |
| Source map | Present, with mappings and original source filenames; relevant `sourcesContent` entries are null. Actual generated spans were recovered through the VLQ mappings and inspected, rather than treating declarations as implementation. |
| Backend corroboration | [107103b4cc9d8f778c78e09c7265f9a4ead89d6e](https://github.com/aragon/app-backend/commit/107103b4cc9d8f778c78e09c7265f9a4ead89d6e), tracked working tree clean; only the single-transaction decoder entry point was consulted. This older checkout does not establish current server response coverage. |
| Protocol baseline | Read-only submodule `800da8d9b347200dda8362e7b68cfe74c08c79a5`; relevant execution, permissions, membership, Token Voting and Lock to Vote entries were reconciled. |

Installed-file SHA-256 fingerprints:

| File | SHA-256 |
| --- | --- |
| `package.json` | `dac9db5e4b6a247f9f1fa1f87b981b0f4d3e9062cd218170116e417a0a6ecde7` |
| `dist/index.es.js` | `909791d8c93041d9cc8e1d89ad82d2e28aebabc333ed79429b190ad95fd74293` |
| `dist/index.es.js.map` | `f238b756eec043a4f93aecc0b7d4c9415c44a8bdad5eb96149a52c01abb1ac8e` |

## Completeness and limits

The source census followed all 13 action-view descriptors, the four core map keys (three identities), all five `GOVERNANCE_PLUGIN_ACTIONS` providers, all three plugin normalization providers, all eight DAO initializers, and every production UI-kit item call and wrapper. The five packaged Basic branches cover eight built-in type spellings. True aliases share an identity; account/plugin metadata, add/remove membership, Token Voting/Lock to Vote settings and Gauge Voter/Registrar actions remain distinct.

The two inventories are complete for **statically traced selection in this app commit with installed UI-kit 2.11.2**. They are not an unqualified inventory of every deployed configuration. These boundaries remain explicit:

- **Unverified:** UI-kit 2.11.3 behavior after a clean lockfile install. No install was performed; no equivalence to the inspected 2.11.2 bundle is claimed.
- **Unverified:** live server response enrichment and whether a particular deployed target is currently indexed, authorized or funded. Each row names the data its selected component consumes. WalletConnect returns the server action without the JSON-import normalization pass, so support is conditional on that payload; the callback's metadata loss is established from frontend code.
- **Established absence:** no specialized editor for nested `Execute` or `CreateProposal`; no specialized details for Pause/Resume/End Campaign; no app-specific registry or plugin normalization for cross-chain destination details. Generic ABI/Raw routes are named in both inventories.
- **Established failing paths:** top-level upload discards metadata required by mint and settings forms; multisig removal details become `ADD_MEMBERS`; a destination allowlist transfer can select the core transfer form without its required DAO context. These are recorded as product opportunities and are not counted as successful specialized editing/review.
- **Supported but conditionally unavailable:** hidden/version-gated picker entries, missing permission-derived maps, plugin metadata that cannot be matched, unavailable gauge/campaign records, unresolved escrow addresses and unrecognized destination networks. Visibility, component selection, data readiness and execution authorization are separate checks.

The 22-action census includes general capabilities and client-specific integrations; its counts do not establish a common supported audience. Gauge Registrar actions A17–A18 are specific to BENQI under the 2026-09-13 owner ruling. The [client scope register](./client-specific-integrations.md) records their product homes and the resolved Alchemix coverage restriction. The audit adds no launch claim. Client-only allocation helpers remain configuration evidence; excluded automated capital-flow policies remain excluded. Alchemix's account-specific vote submission is not an action-array Basic renderer.
