---
type: concept
title: Governance process
tags: [governance, semantics]
status: draft
source: aragon-knowledge-base/product/concepts/process-vs-body.md (product-owner Q&A, 2026-07-06 — "a very important concept") + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app/backend verification + product-owner authorization-model review (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Governance process

A **process** is a decision-making flow that can act on the DAO **on its own**: it takes a proposal from creation through decision to execution without depending on any other governance component. In protocol terms it is a governance [plugin](./plugin.md) — a contract implementing the proposal interface — that holds the permission to [execute on the DAO](../protocol-doc/core/execution.md) directly.

A process is the unit the product organizes governance around: any account can have **zero or more** processes, the [proposals](./proposal.md) list is partitioned per process (each is a *proposal type*), and installing governance via the [governance designer](./governance-designer.md) means installing one or more processes.

A process is wider than a **governor**. The governor is the entity or component that resolves actors' preferences using a voting or decision method; the process is the end-to-end flow that can carry the approved actions to execution ([authorization and execution model](../access-control/authorization-and-execution.md)). A simple governance plugin can be both governor and process. A composed staged process can contain several governors, one for each participating body, while the pipeline coordinates their results.

This is product vocabulary built on the protocol primitive: [plugins are the substrate the app interprets as processes and bodies](./plugin.md#the-product-abstractions-sit-on-top).

## Process vs body

A process is not the same thing as a [body](./body.md), though one contract can be both:

- A multisig plugin targeting the DAO directly is **both** a body (a group that decides) and a process (its decision executes on the DAO by itself).
- The same multisig reporting into a staged pipeline (the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md)) is a **body only**: it reports its result into the pipeline and cannot act on the DAO alone. The pipeline as a whole is the process.

In both cases the multisig plugin is the governor that applies the body's approval method. The test here asks only whether it is also a **process**: *can this thing carry a decision all the way to execution on the DAO by itself?* If yes, it is a process. What a plugin's approved actions accomplish — executing on the account, or reporting into a pipeline ([target](./target.md)) — is what decides this.

## Why the distinction matters

Features that touch governance must agree on this vocabulary: proposal lists partition by process, execution scopes attach to processes (see [scoped authority](../access-control/scoped-authority.md)), and composite setups (multiple bodies feeding one staged process) must not be miscounted as multiple processes.

Who may *create* a proposal on a process is its own configuration, independent of which bodies decide it — see [proposal creation](./proposal-creation.md).

The app surfaces this on a process's own **process details page**: an **Authorized actions** section alongside its current proposal-creation eligibility when the process exposes eligibility settings ([proposal creation](./proposal-creation.md), [scoped authority](../access-control/scoped-authority.md)), together with the process's **uninstall** action ([governance designer](./governance-designer.md)). The section lists indexed allowed target-selector records and decodes the contract and function name where that information is available; an unrestricted process and a conditioned process with no allowed actions get distinct empty states. This gives members a readable view of what the app knows the process can make the account call without pretending every unknown selector can be translated into plain language.

## Which processes a user sees

The set of processes a user sees on an account is derived, not raw chain state.

The app first narrows an account's installed plugins to the ones it already classifies as processes — see [process vs body](#process-vs-body) — and further to the ones it can itself interpret: an [unknown plugin](./plugin.md#known-and-unknown-plugins) never enters this list ([process filter](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/daoUtils/daoUtils.ts#L267-L273)). A remote per-account hide list can then remove specific plugin addresses from what is left — [App CMS](../app-cms.md#five-established-uses) owns that mechanism and is not restated here. A process belonging to a [linked account](../accounts/linked-account.md) clears one further gate: it appears only behind a feature flag, a mechanism the product ships rather than a promise that linked-account processes are broadly visible today.

What remains is then deliberately ordered: the primary account's own processes sort first, and within each group a fixed type priority orders the types — Token Voting, then Multisig, then Lock to Vote, with every other recognized process type after those three, and equal-priority processes keeping their listing order ([type priority](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/pluginSortUtils/pluginSortUtils.ts#L4-L8)).
