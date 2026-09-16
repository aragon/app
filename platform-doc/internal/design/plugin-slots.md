---
type: pattern
title: Plugin slots
tags: [design, components, plugins]
status: draft
source: aragon-knowledge-base/design/component-patterns/plugin-slots.md (first-slice brain dump, 2026-07-06) + product-owner briefing (2026-07-28, third answers) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Plugin slots

Plugin slots let a shared product flow adapt to the governance rules of a supported [plugin](../../governance/plugin.md). The [governance designer](../../governance/governance-designer.md), for example, keeps one setup journey while offering the configuration appropriate to the selected governance type.

The boundary keeps plugin-specific rules together. Supporting a new plugin can extend the shared experience without adding special cases throughout every flow. [DAO slots](./dao-slots.md) apply the same modular approach to a particular account.

## The slot contract

The shared flow owns navigation, composition, and submission. A plugin supplies the parts whose meaning depends on its governance model: configuration, eligibility, proposal behavior, and the information needed to prepare and review its actions. Common presentation can be reused where the plugin needs no special treatment.

Recognition and installation availability remain separate. A plugin may have a supported experience without being offered as a setup choice, as with [Admin](../../governance/admin-flow.md). Available choices also depend on the network ([plugin compatibility](../../application/plugin-compatibility.md)).

### Validation

A plugin's configuration must satisfy its own rules before setup can continue. A multisig approval threshold, for example, cannot exceed the number of members. The shared journey enforces this at the relevant step so the user can correct the configuration in context ([invariant validation](./invariant-validation.md)).

### Transaction composition

Each integration translates its own configuration into the actions required to install, update, or remove that plugin. The shared flow combines those actions and handles their [preparation and submission](../../governance/governance-designer.md#preparing-and-applying-an-installation).

### Action integrations

An action integration must support both preparing an action and reviewing its meaning wherever the action batch appears. The [action builder](../../application/action-builder.md) provides the shared experience. Validation remains local to each action; interactions across an ordered batch remain the author's responsibility ([action order and failures](../../governance/action.md#action-order-and-failures)).

## Worked example: adding a body

Adding a multisig [body](../../governance/body.md) asks for members and an approval threshold. Adding Token Voting asks for token-based membership and voting rules. Both fit the same body-creation journey, but each exposes the choices that determine how its own governance works.
