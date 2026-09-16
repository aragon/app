---
type: concept
title: Governance process
tags: [governance, semantics]
status: draft
source: aragon-knowledge-base/product/concepts/process-vs-body.md (product-owner Q&A, 2026-07-06 — "a very important concept") + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app/backend verification + product-owner authorization-model review (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + product-owner semantic-anchor review (2026-09-10, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md) + product-owner briefings (2026-09-15, see log.md)
---

# Governance process

A **governance process** can take a proposal from [creation](./proposal-creation.md) through decision to [execution](../protocol-doc/core/execution.md) on an [account](../accounts/account.md), without necessarily depending on any other governance component. Its configuration determines who may propose, how decisions are reached, and the [scope of actions](../access-control/scoped-authority.md) it may direct.

A process connects participating [bodies](./body.md) with account execution. Each body supplies its [members'](./member.md) preferences, and its [governor](../access-control/authorization-and-execution.md) applies the voting or approval method. A standalone multisig plugin can act as process, body, and governor.

## Staged governance processes

A **staged governance process** uses the [Staged Proposal Processor (SPP)](../protocol-doc/plugins/spp-plugin.md) to coordinate **one or more [stages](./stage.md)**. Its configuration sets the order of the stages and, for each stage, the participating bodies, approval and veto thresholds, and timing requirements.

A staged process can combine different governance plugins. For example, a multisig of trusted members can approve proposals before a token vote or review them afterward; [multisig gates](./multisig-gates.md) explains these arrangements.

SPP is an [Aragon-deployed plugin](../application/aragon-deployed-plugins.md#plugin-catalogue). The [Aragon team](../application/getting-help.md#working-with-the-aragon-team) arranges installation and configures the process through the governance designer's [Advanced — On request](./governance-designer.md#the-advanced-flow) setup.

Each [staged proposal](./proposal.md#staged-proposals) follows this configured sequence. The rules of each stage determine whether and when that proposal can advance to the next stage or reach execution.

### Configuration options

Stages created through the app leave proposal cancellation and action editing disabled. SPP supports [enabling these options for authorized addresses during specified stages](../protocol-doc/plugins/spp-plugin/lifecycle.md#cancelling-and-editing).

Administrators considering these options or other stage configurations beyond those provided by the app can contact the [Aragon team](../application/getting-help.md#working-with-the-aragon-team) for setup and guidance.

## Processes in the app

For [supported plugins](../application/plugin-compatibility.md#how-the-app-supports-a-plugin), the app partitions the **proposals list by process**. Each process appears as a proposal type, grouping the proposals that follow its decision-making flow.

The app also shows processes from [linked accounts](../accounts/linked-account.md) in the same set, with an indicator identifying the account they belong to.

An account can have zero or more processes. The [governance designer](./governance-designer.md) configures the plugins and their relationships when adding governance.

## Process details page

The **Process details page** lets members inspect a process's execution scope and proposal-creation requirements, and access its removal action.

The page identifies the process by its name, description, and key, with its proposal count and latest proposal activity. Its contract and launch links lead to the plugin and installation record in the block explorer. For a linked-account process, the target address identifies the account it directs. Its governance section shows the single body of a Basic process or the stages and bodies of an advanced process read-only, with contract details for existing bodies. [Governance changes](./governance-designer.md#editing-across-the-lifecycle) follow the supported action or Aragon-assisted route.

- **Authorized actions** shows the contract functions the process is configured to call, with readable contract and function names where available. Rows include the function selector when supplied and a link to the target contract in the block explorer. It distinguishes an unrestricted process from a restricted process with no allowed actions. [Scoped authority](../access-control/scoped-authority.md) explains how those limits apply.
- **Proposal-creation requirements** shows the current eligibility rules when the process exposes them. The **View requirements** link in [execution routing](../application/execution-routing.md#creation-requirements) leads here when an author needs to understand a creation restriction.
- **Uninstall process** starts [removing the process](./process-removal.md).
