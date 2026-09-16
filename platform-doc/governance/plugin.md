---
type: concept
title: Plugin
tags: [governance, accounts, semantics]
status: draft
source: product-owner briefing (2026-07-14) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + app and app-backend source verification + product-owner briefings (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.37.1 unresolved-interface verification (2026-09-08, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + product-owner semantic-anchor review + aragon/crosschain@47b8034 controller/setup/executor verification (2026-09-10, see log.md) + product-owner plugin follow-up and deployment-terminology ruling (2026-09-10, see log.md); recognition-boundary explanation relocated from application/getting-help.md (post-merge section pass, 2026-09-13; original provenance retained in log.md) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md) + product-owner compatibility review and taxonomy reassessment (2026-09-15, see log.md) + product-owner Target review and consequential wording alignment (2026-09-15, see log.md)
---

# Plugin

A **plugin** is a smart contract installed to add a capability to an [account](../accounts/account.md), such as voting, capital distribution, or cross-chain execution. The account's permission system can authorize callers to use the plugin's functions and authorize the plugin to act on the account or other components. Its code and configured permissions determine what it does.

## Governance semantics of plugins

A **governance plugin** is a type of plugin that implements governance rules for an account. It can resolve participants' preferences as a [governor](../access-control/authorization-and-execution.md), or manage the decision state of the bodies participating in a governance process.

Proposal-based governance plugins implement [`IProposal`](../protocol-doc/common/proposal.md), which supplies a shared interface for creating proposals, reporting outcomes, and executing approved actions. Each plugin applies its own governance rules. Execution follows its configured [target](./target.md) and permissions; a plugin authorized to execute on the account can pass approved actions to `DAO.execute`.

A standalone Multisig, Token Voting, or Lock to Vote plugin acts as both a [governance process](./process.md) and a [body](./body.md). It defines participation and approval within that body and carries proposals from creation through decision to account execution.

In [staged governance](./proposal.md#staged-proposals), the governance process manages the decision state of its participating bodies. The Staged Proposal Processor acts as the process, while governance plugins such as Multisig and Token Voting act as its bodies. The process applies its stage rules to those bodies' decisions and carries the resulting proposal to account execution.

The [governance designer](./governance-designer.md) configures plugins and composes their roles into processes, including staged arrangements built with the Aragon team. Governance also includes other forms of participation: [Gauge voting](./gauge-voting.md) collects voting-power allocations across destinations during an epoch.

## Execution configuration

A governance plugin's [target configuration](./target.md#plugin-targets) determines which executor it uses to execute its actions. Setup establishes this configuration for the plugin's role as a process or body.

## Deployment and support

Installation configures a plugin and its permissions through the OSx [plugin framework](../protocol-doc/framework/plugins.md) and [permission system](../protocol-doc/core/permissions.md). The [plugin catalogue](../protocol-doc/plugins/index.md) lists concrete implementations.

[Plugin compatibility](../application/plugin-compatibility.md#levels-of-support) distinguishes plugins users can set up and use themselves, plugins deployed by Aragon, and unsupported plugins. For capabilities whose deployment requires the team, see [Aragon-deployed plugins](../application/aragon-deployed-plugins.md).

## Identifying a plugin

An installed plugin is identified by its contract address on the account's network. The app's [metadata input](../application/metadata-input.md#plugin-metadata-follows-the-plugin) gives supported plugins a readable name, description, and resources.

One installed plugin owns one metadata record. When it acts as both a process and a body, the same identity appears in both contexts: its proposals belong to the process, while its [members](./member.md) belong to the body.

## Plugins in the app

Plugin visibility is configured for an installed plugin. [App CMS](../application/app-cms.md#five-established-uses) can hide that plugin from the relevant lists, including its presentation as a process or body.

[Plugin compatibility](../application/plugin-compatibility.md#visibility) also determines which installed plugins appear in the app's lists.
