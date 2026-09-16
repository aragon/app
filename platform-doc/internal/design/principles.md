---
type: concept
title: Platform design principles
tags: [principles, cross-cutting]
source: initial briefing (2026-07-13 scaffold, see log.md) + aragon-knowledge-base/ontology/operating-principles.md (2026-07-06) + product-owner briefings (2026-07-14 and 2026-07-29, see log.md) + modularity strategy document (mined 2026-07-14) + product-owner release-notes briefing, app source verification, and scope answer (2026-08-04, see log.md) + product-owner Permission Viewer launch briefing and app/backend verification (2026-08-28, see log.md) + product-owner semantic-anchor review (2026-09-10, see log.md) + removal-alert verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Platform design principles

The platform design principles guide how Aragon enforces governance, represents it to people, and supports different use cases through reusable software. Every feature follows these rules; an exception needs an explicit rationale.

## Onchain foundations

1. **Enforce governance onchain.** Aragon implements governance and permission rules in the [account](../../accounts/account.md), its [plugins](../../governance/plugin.md), and their [conditions](../../protocol-doc/common/permission-conditions.md). These contracts determine whether configured requirements for an action are satisfied and whether execution is authorized. The app helps people configure and use those rules; enforcement remains in the onchain framework when someone acts through another interface. [Authorization and execution](../../access-control/authorization-and-execution.md) explains how those checks compose.

2. **Use chain state as the source of truth.** The app derives its view of accounts, governance, and permissions from onchain state. The backend indexes events, and the frontend uses those records to build a readable product model, including derived states such as [proposal status](../../governance/proposal-status.md). Off-chain metadata and [App CMS](../../application/app-cms.md) enrich or curate that presentation without changing the underlying chain state. Expose indexing delays and service dependencies where they affect what a person can conclude from the display.

3. **Preserve account autonomy.** An account and the plugins holding its permissions can act through any authorized route. The app supports and explains those routes without becoming the account's gatekeeper. The design rule calls for warnings rather than risk-based blocks on dangerous supported actions. [Removing the last recognized process](../../governance/process-removal.md#removing-the-last-recognized-process) applies this principle to the loss of a governance route. The app can have a limited supported scope and [refuse configurations that cannot hold](./invariant-validation.md), such as an unreachable approval threshold, while preserving valid onchain choices.

## Product model and interface

4. **Define the product in its own terms.** The protocol describes state and state transitions; the product describes the objects and interactions people use to understand and operate it. Concepts such as [process](../../governance/process.md), [body](../../governance/body.md), and account need not map one-to-one to contract storage or mechanisms. Use the product vocabulary consistently while preserving the relationship to the underlying [Aragon OSx mechanisms](../../protocol-doc/index.md).

5. **[Honest abstraction](./principles/honest-abstraction.md).** Expose the model, state, and consequences people need for an informed decision, then offer a route to authoritative detail. Over-abstraction hides relevant reality; under-abstraction exposes detail without giving people a workable model. Calibrate the experience to preserve both understanding and technical accuracy.

6. **[Every element makes a claim](./principles/every-element-makes-a-claim.md).** A visible interface element says that a concept exists, matters now, or can be acted on. It must earn that claim by serving a reasonable user expectation or current decision. Technical possibility and internal architecture alone do not earn representation; [control availability](./control-availability.md) applies this rule when choosing whether and how to present an action.

## Reusable implementation

7. **Generalize around shared product meaning.** Reuse components when they represent the same semantic object or interaction across use cases. The shared definitions of account, process, body, and action establish where that reuse is meaningful. When a use case needs different behavior, keep that difference in a bounded extension; preserve the meaning of the shared component.

8. **Modular over monolithic.** Governance requirements differ by use case, so the platform favors modular composition over one fixed governance model. Those variations share a semantic structure: bodies contribute decisions to processes, and processes direct accounts to execute [actions](../../governance/action.md) against targets, including protocol and asset contracts with their own [authorization rules](../../access-control/authorization-and-execution.md). Build reusable components around those roles so a new composition can use the same proposal, action-building, and review flows. Plugins supply governance behavior; stages compose decisions; UI slots integrate the parts whose behavior varies.

9. **Isolate specialized implementations.** Keep client-specific behavior in [DAO slots](./dao-slots.md) and plugin-specific behavior in [plugin slots](./plugin-slots.md), with their code contained in the corresponding account or plugin folder. A local requirement should lead to a local change. Keep special cases out of shared flows to limit the affected code, prevent dependencies from spreading, and avoid accumulating technical debt across unrelated use cases.

10. **Build on ecosystem standards.** Use standards people already expect, such as [WalletConnect in the action builder](../../application/action-builder.md) and ENS for [Aragon Names](../../application/aragon-names.md). They let accounts work with other applications and reuse existing capabilities. Preserve the relevant interaction limits when integrating those standards, including dApps that expect immediate execution before offering a dependent action.

11. **Curate the supported experience.** Aragon merges what enters the codebase, hosts the app, reviews code shipped through DAO slots, and builds supported flows around [supported plugin integrations](../../governance/plugin.md#plugins-in-the-app). That curation defines the experience Aragon provides. An account's installed plugins retain their onchain permissions independently of whether the app recognizes them.
