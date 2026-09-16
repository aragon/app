---
type: capability
title: Getting help
tags: [support, cross-cutting]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md); user-facing routes split from design/reach-out-to-the-team.md in the product/internal content separation (2026-09-10, see log.md) + product-owner briefings (2026-09-11, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Getting help

Aragon provides product support and services for custom development, deployment, and governance advisory. [Get in touch with the Aragon team](https://www.aragon.org/get-assistance-form) to discuss what your project needs, including work beyond the standard platform capabilities.

## Product support

A **Support** link in the footer of every page and a **Report issue** action on error states both lead to [Aragon's support portal](https://aragonassociation.atlassian.net/servicedesk/customer/portal/3). Use it for product questions and problems with the app; support is available regardless of whether you need a services engagement.

## When the app needs the Aragon team

Contact Aragon for any of these needs:

| What you need | How Aragon can help |
| --- | --- |
| A capability or integration beyond the standard product | **Custom development.** Aragon can build custom applications, contracts, plugins, and integrations. Describe the outcome so the team can assess the work and agree its scope. The [BENQI lending-market gauge integration](../governance/benqi-lending-market-gauges.md) illustrates this service and is specific to BENQI. |
| A supported capability with no self-service setup | **Deployment by Aragon.** Arrange [advanced governance using the Staged Proposal Processor, cross-chain execution, Gauge voting, Capital Distributor, or veLocker](./aragon-deployed-plugins.md#plugin-catalogue). The app supports compatible deployed configurations; the team handles setup. |
| Help choosing or evaluating a governance design | **Paid governance advisory.** Aragon can help with deployment planning, governance processes, permissions, and safeguards, including a workshop to work through the project's requirements. See [Governance advisory](#governance-advisory). |

Each route uses the [Aragon contact form](https://www.aragon.org/get-assistance-form). The team agrees the scope and commercial terms for the engagement; requesting custom work does not establish that it is already supported or committed for delivery.

The team also helps where an existing configuration exceeds what the app can faithfully explain or configure, including unusual [staged-proposal interactions](../governance/process.md#configuration-options) and [bodies that span multiple processes](../governance/body.md#bodies-that-span-multiple-processes). Carry the specific configuration decision forward when contacting Aragon.

## Governance advisory

You can ask for governance advice before choosing a feature or deploying an account. For example, explain that you want help planning an account's deployment, choosing who can propose and approve changes, or evaluating the powers of a security council. Aragon offers this work as a paid service and can arrange a workshop around those questions. Fees and scope are agreed with the team.

Working with Aragon is the preferred [account-creation route](../accounts/account-creation.md#entry-points). General explanations remain available in [Aragon OSx and the platform](../osx-and-the-platform.md); deeper questions about contract behavior can follow its [protocol reference](../osx-and-the-platform.md#protocol-reference).

## Working with the Aragon team

Use the [Aragon assistance form](https://www.aragon.org/get-assistance-form). Include your project, the outcome you want, and whether you need custom development, deployment of an existing capability, or governance advisory. Where relevant, include the account address and chain, current configuration, proposed stages or voting bodies, and the question you want to resolve. The [advanced-governance multisig guide](../guides/multisigs-in-advanced-governance.md) helps prepare one such configuration.

Three app surfaces offer **Get in touch** and open this same form:

- the first getting-started card on the [Explore page](./explore-page.md), shown to every visitor;
- the primary card on the onboarding [dashboard](../governance/admin-flow.md#onboarding-dashboard) of an account still in its admin bootstrap;
- the [governance designer](../governance/governance-designer.md#the-advanced-flow), where the Governance step offers **Advanced — On request** for setup by the team.

### When no contact control is offered

An advanced process's stages and bodies cannot be edited in the app, and its process page offers no contact entry point ([editing across the lifecycle](../governance/governance-designer.md#editing-across-the-lifecycle)). The **Add voting body** picker likewise offers only self-service governance types, with no entry point for arranging another deployment. Use the [Aragon contact form](https://www.aragon.org/get-assistance-form) directly for either need.
