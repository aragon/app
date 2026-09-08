---
type: pattern
title: Reach out when the abstraction cannot stay honest
tags: [design, interaction, support]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Reach out when the abstraction cannot stay honest

When an edge case cannot be represented faithfully by the app's supported abstraction, the app should hand the person to the Aragon team rather than present a misleading self-serve flow. This is a boundary of what the product can explain and configure honestly, not a substitute for ordinary product support.

The [governance designer](../governance/governance-designer.md) uses this boundary when a complicated configuration cannot be represented faithfully in the flow, and for advanced-process editing: existing conditions and interactions between sub-plugins and the staged proposal processor can exceed the safe abstraction. [Account creation](../accounts/account-creation.md) makes the team-assisted path the preferred route for governance setup, and the [advanced-governance multisig guide](../guides/multisigs-in-advanced-governance.md) gives the team the configuration to carry forward.

Unknown-plugin support has a related but different boundary. The app can recognize that [unknown plugin](../governance/plugin.md) code exists without claiming to understand its behavior; that is a recognition limit, not necessarily an abstraction-depth limit.

## The entry points

Three surfaces render this handoff, and all three send the person to the same external Aragon assistance form.

- **A team-built advanced process in the [governance designer](../governance/governance-designer.md).** When the Governance step presents **Advanced** as **On request**, the stage builder is replaced by a panel headed "Governance custom-built for" the account's own name. It lists what the team can compose: different proposal flows per decision type, granular permissions, optimistic governance, security councils, and governance that adapts over time. The wizard's Next control is disabled, so **Get in touch** is the step's only action. This is the boundary the [advanced-governance multisig guide](../guides/multisigs-in-advanced-governance.md) prepares a configuration for.
- **Governance onboarding on the account dashboard.** The account is still in the [admin flow](../accounts/admin-flow.md) — admin plugin installed, no other process — and the connected wallet is an admin. The primary card, "Work with the Aragon team" tagged **Best for custom setups**, offers **Get in touch** above the self-serve "Set up governance yourself" alternative and the developer documentation.
- **Getting started on the [Explore page](../accounts/explore-page.md).** The card is unconditional: "Work with our team", tagged **Recommended**, is the first of three getting-started cards, ahead of the no-code wizard and the developer portal. It is the preferred route [account creation](../accounts/account-creation.md) names, offered before the user meets a limit rather than after hitting one.

## Boundaries stated without a handoff

The app also names limits where it renders no way through. The pattern is only complete where the person also gets a route out.

- **An advanced process cannot be edited in the app.** Its [process](../governance/process.md) page shows the staged composition read-only, with no edit control and no contact entry point ([editing across the lifecycle](../governance/governance-designer.md#editing-across-the-lifecycle)).
- **Deployment arranged with Aragon.** **Add voting body** shows a governance type the connected address is not cleared for as disabled with a **By request** tag — the availability state named without the remedy a disabled control owes ([control availability](./control-availability.md)) — so the client call to action on [partially supported plugins](../partially-supported-plugins.md) has no in-app entry point.

## Not this pattern

Ordinary product support runs alongside: a **Support** link in the footer of every page, and a **Report issue** action on error states, both leading to Aragon's support portal. They are unconditional and answer "something is wrong" or "I have a question." A boundary handoff is different in kind — a specific state or limit triggers it, and it carries a configuration decision forward to the team.
