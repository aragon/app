---
type: concept
title: Aragon OSx and the platform
tags: [cross-cutting, permissions, security, indexing]
status: draft
source: product-owner commission and briefings (2026-09-10, see log.md) + OSx orientation design and coverage map + protocol-doc@800da8d9b347200dda8362e7b68cfe74c08c79a5 + @aragon/app@1.39.0 (adad67873c8f9dd75e3ed340b70df3e985ae3557) + app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e + contract-repository audit references (retrieved 2026-09-10; OSx README rechecked 2026-09-11) + aragon.org assets-governed metric (retrieved 2026-09-11) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Aragon OSx and the platform

**Aragon OSx** is the protocol underlying the Aragon platform: a framework for building organizations around a smart contract that holds assets, executes actions, and manages permissions. Plugins extend that core with governance and other capabilities, while the platform provides the application through which people create accounts, make decisions, and manage those capabilities. The account can retain its address, assets, and external contract relationships as its authorized governance changes.

Start with [Why OSx](./protocol-doc/guides/why-osx.md) for the rationale behind this modular structure. For a deeper question about a contract, rule, or procedure, use the [protocol reference](#protocol-reference) to go directly to the relevant topic.

## What is OSx, and what does the platform add?

An Aragon [account](./accounts/account.md) is an OSx `DAO` contract with its own assets, execution capability, and permission table. Installed [plugins](./governance/plugin.md) add capabilities; the platform interprets their governance roles as [governance processes](./governance/process.md), which take proposals through decision and execution, and [bodies](./governance/body.md), whose members contribute to those decisions. One permission system determines how those contracts may act on the account and on each other. The app adds guided account creation, governance design, readable action forms, and views of the account's activity and configuration. Its supported flows simplify common work while the account remains capable of other interactions its contracts and permissions allow.

Read [the DAO contract](./protocol-doc/core/dao.md) to understand the core's responsibilities and [the plugin model](./protocol-doc/framework/plugins.md) to understand how installed capabilities extend it.

## Where does the app's information come from?

The platform backend builds an index from onchain events, primarily those emitted by OSx accounts, framework contracts, and installed plugins. Features also use token events, balance reads, ENS records, and price data to present governance activity, treasury assets, and identities. The app combines these sources into a derived view, so a confirmed transaction can take time to appear while the index catches up. The chain remains authoritative during that delay; an indexed [Permission Viewer](./access-control/permission-viewer.md#interpretation-boundary) row, for example, describes recorded configuration without deciding whether a particular call is authorized now.

Read [DAO metadata](./protocol-doc/core/dao-metadata.md) for how contract events expose descriptive changes, and [registries and ENS names](./protocol-doc/framework/registries.md) for how accounts and plugins become discoverable onchain.

## What does signing a transaction do?

Account and governance transactions interact with OSx contracts: creating a proposal calls its process's plugin, creating an account calls a factory, and installing governance involves the plugin setup processor. Signing authorizes the transaction request; what happens onchain depends on the function called. Creating a proposal records its actions for execution once the process's requirements are met, whereas a [direct transaction](./treasury/create-transaction.md) executes an authorized batch when that transaction succeeds onchain. One outer transaction can carry several [actions](./governance/action.md), which the app presents through Basic, Decoded, or Raw views before submission; the wallet determines its own confirmation display. Name, profile, and token operations can instead target contracts outside OSx.

Read [Actions and execution](./protocol-doc/core/execution.md) for how a batch runs as the account, and [Create, vote, and execute a proposal](./protocol-doc/guides/create-vote-execute.md) for the contract-level proposal lifecycle.

## How do governance settings change?

Governance settings live in the installed plugins and change through authorized calls to those contracts. For example, [Update Token Voting settings](./application/basic-action-views.md#token-governance) prepares an action for a proposal on a process authorized to make that change, or for a direct transaction by an actor whose Execute permission allows the batch. The account executes the settings call as itself, and the plugin checks that the account has the required permission. Existing Token Voting proposals keep their recorded voting settings; changed settings apply to proposals created afterward. The [governance designer](./governance/governance-designer.md#preparing-and-applying-an-installation) handles installing new processes by preparing the plugins and composing the actions that apply their installation and permissions.

Read [Token Voting's proposal lifecycle](./protocol-doc/plugins/token-voting-plugin.md#the-proposal-lifecycle) for which proposals a change affects, [majority voting](./protocol-doc/plugins/majority-voting.md#the-three-thresholds) for the three thresholds, and [voting modes](./protocol-doc/plugins/voting-modes.md) for how participation and execution timing interact.

## How do permissions and conditions work?

An OSx permission records who may perform an operation on a particular contract, in the permission table held by the account's `DAO` contract. A condition makes a grant depend on a rule evaluated at call time; ROOT controls permission changes and normally belongs to the account itself so those changes pass through its governance. The app presents permissions in [Permission Viewer](./access-control/permission-viewer.md), on [process details](./governance/process.md#process-details-page), and in the governance designer's Permissions step. Understanding the model becomes necessary before changing an allowlist, composing a permission change, or removing the last governance process. Permission grants, revocations, and conditional grants have no Basic forms and are deliberately absent from the default action list; the [action builder's generic routes](./application/action-builder.md#direct-execution-and-permission-changes) remain available to authors who understand their consequences, subject to authorization.

Read [the permission system](./protocol-doc/core/permissions.md) and [permission conditions](./protocol-doc/common/permission-conditions.md) for how grants are evaluated, then the [condition library](./protocol-doc/helpers/condition-library.md) for the available reusable checks.

## Why can an action be visible without being executable?

The action builder can discover a function through a verified contract's ABI, the description of its callable interface, without establishing permission to use it. A Basic form likewise helps an author prepare and review a call. At execution, the account checks the caller's Execute grant and any attached condition, then each target applies its own rules to the account's call. A proposal passing its voting requirements does not grant its process additional authority: its batch must still satisfy those execution checks. [Allowed-action filters](./application/action-builder.md#filtering-to-allowed-actions) and [simulation](./application/action-simulation.md) help assess a batch against known configuration and state, which may change before execution.

Read [how permission decisions are made](./protocol-doc/core/permissions.md#how-a-decision-is-made) for the authorization rules, and [ExecuteSelectorCondition](./protocol-doc/helpers/condition-library/execute-selector-condition.md) for how an allowlist constrains the calls inside a batch.

## Which configurations remain your responsibility?

OSx permits configurations beyond those the app offers, and the app's [configuration validation](./governance/governance-designer.md#before-publishing) rejects settings that can never hold without judging whether a viable configuration suits an organization. A duration participants cannot meet, an allowlist that permits no useful action, or removal of the only unrestricted process can prevent intended governance from functioning. Leaving ROOT with an externally owned account gives its controller power to rewrite permissions, and changing a condition across separate transactions can leave an interval without the intended authorization. Guided flows and audited contracts do not establish that these choices are sound. Test the intended setup on a testnet and consider the cautions in [Account creation](./accounts/account-creation.md) and [Governance designer](./governance/governance-designer.md) before committing assets or authority.

Read the cautions for [the DAO contract](./protocol-doc/core/dao.md#keep-in-mind) and [permissions](./protocol-doc/core/permissions.md#keep-in-mind), including [where ROOT ends up](./protocol-doc/core/dao.md#where-root-ends-up), to understand the consequences of retaining, transferring, or removing authority. For help evaluating your project's governance design or planning deployment, [contact Aragon about paid governance advisory](./application/getting-help.md#governance-advisory).

## What do audits establish, and where are the reports?

The OSx core and framework contracts, together with the governance plugins the app installs, have been audited by several firms across releases. Each contract repository links its audit reports from its README; start with the [OSx audits folder](https://github.com/aragon/osx/tree/main/audits) and use [the protocol repository map](./protocol-doc/repositories.md) to find the relevant plugin. [Aragon reports billions of dollars in assets governed](https://www.aragon.org/) across its stack. Those reports and that scale provide context for evaluating the contracts; they do not establish that an organization's chosen governance configuration is sound. Audit coverage belongs to the contracts and revisions examined, so it should be checked against the components being used.

Read [Why OSx: Change, always controlled](./protocol-doc/guides/why-osx.md#change-always-controlled) for how the protocol combines modular changes, permission checks, and contract audits.

## Protocol reference

Choose the topic that matches your question. The GitHub links open the corresponding pages outside this wiki.

| Question | Protocol reference | On GitHub |
| --- | --- | --- |
| What does the account's core contract do? | [The DAO contract](./protocol-doc/core/dao.md) | [DAO contract](https://github.com/aragon/protocol-doc/blob/main/core/dao.md) |
| How are permissions, ROOT, and conditional grants evaluated? | [The permission system](./protocol-doc/core/permissions.md) | [Permissions](https://github.com/aragon/protocol-doc/blob/main/core/permissions.md) |
| How does an account execute a batch of actions? | [Actions and execution](./protocol-doc/core/execution.md) | [Execution](https://github.com/aragon/protocol-doc/blob/main/core/execution.md) |
| How are plugins installed, updated, or removed? | [PluginSetupProcessor](./protocol-doc/framework/plugin-setup-processor.md) | [Plugin setup processor](https://github.com/aragon/protocol-doc/blob/main/framework/plugin-setup-processor.md) |
| Which governance mechanisms does OSx provide? | [Governance plugins](./protocol-doc/plugins/index.md) | [Governance plugins](https://github.com/aragon/protocol-doc/blob/main/plugins/index.md) |
| How does staged governance work at the contract level? | [Staged Proposal Processor](./protocol-doc/plugins/spp-plugin.md) | [SPP](https://github.com/aragon/protocol-doc/blob/main/plugins/spp-plugin.md) |
| How do I deploy a DAO through the contracts? | [Deploy a DAO](./protocol-doc/guides/deploy-a-dao.md) | [DAO deployment guide](https://github.com/aragon/protocol-doc/blob/main/guides/deploy-a-dao.md) |
| How do I create, vote on, and execute a proposal through the contracts? | [Proposal lifecycle guide](./protocol-doc/guides/create-vote-execute.md) | [Proposal lifecycle guide](https://github.com/aragon/protocol-doc/blob/main/guides/create-vote-execute.md) |
| How do I develop a custom plugin? | [Build a plugin](./protocol-doc/guides/build-a-plugin.md) | [Plugin development guide](https://github.com/aragon/protocol-doc/blob/main/guides/build-a-plugin.md) |
| Where are exact function signatures, events, and errors? | [ABI reference](./protocol-doc/abi/index.md) | [ABI reference](https://github.com/aragon/protocol-doc/blob/main/abi/index.md) |

For other topics, browse the [full protocol index](./protocol-doc/index.md) ([on GitHub](https://github.com/aragon/protocol-doc/blob/main/index.md)). Contract-level procedures describe what OSx permits; the platform's [deployment routes](./application/aragon-deployed-plugins.md) determine which capabilities you can set up in the app and which require the Aragon team.
