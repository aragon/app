---
okf_version: "0.1"
---

# Aragon Platform

The **Aragon platform** is a vertically integrated, full-stack solution for governing treasuries and protocols on EVM-compatible blockchains. The application builds on [Aragon OSx](./osx-and-the-platform.md), with shared product concepts, rules, and design principles that keep its features consistent, coherent, and scalable.

Protocol mechanics (the DAO contract, permissions, the plugin framework, and the governance plugins) are documented in the [protocol docs](./protocol-doc/index.md); the pages here link to them for the mechanism and add the product meaning on top.

**Three-layer model:** *protocol mechanism → product capability → interaction pattern*. Aragon OSx supplies the contracts and execution rules; the platform organizes those capabilities into accounts, governance processes, and actions; interaction patterns make them understandable and usable. These layers have distinct concepts, with a direct correspondence where it helps.

## Use Aragon

For custom development, deployment of an existing capability through Aragon, or paid governance advisory and workshops, see [Getting help](./application/getting-help.md#when-the-app-needs-the-aragon-team).

[Guides](./guides/index.md) help people accomplish concrete tasks in the Aragon platform. Start by [choosing a voting-power mechanism for token governance](./guides/choose-token-voting-power-mechanism.md), [choosing between a Safe and an Aragon multisig](./guides/safe-vs-aragon-multisig.md), [adding a multisig gate to an advanced governance process](./guides/multisigs-in-advanced-governance.md), or [hardening token governance against governance attacks](./guides/harden-token-governance-against-attacks.md).

## Understand the platform

Read [Aragon OSx and the platform](./osx-and-the-platform.md) for how the app relates to the contracts behind accounts, governance, and permissions. Its [protocol reference](./osx-and-the-platform.md#protocol-reference) routes deeper questions to specific topics, with GitHub links for sharing.

Start with the [value proposition](./value-proposition.md) for what the platform enables, then the concepts the rest of the graph hangs off: the [account](./accounts/account.md), what the deployed entity is and why the product says "account" where the protocol says "DAO"; the [governance process](./governance/process.md), [body](./governance/body.md), and [member](./governance/member.md), the central relationships behind the governance surface; and [scoped authority](./access-control/scoped-authority.md), how the account's effective authority is divided among governance processes. From there, follow the area your question touches.

## Browse by area

- **[Accounts](./accounts/index.md)** — account entities, creation, upgrades, selected-account views, and linked-account relationships.
- **[Governance](./governance/index.md)** — the platform's governance semantics: [processes](./governance/process.md), [bodies](./governance/body.md), [members](./governance/member.md), [proposals](./governance/proposal.md), the [governance designer](./governance/governance-designer.md), and staged governance patterns like [multisig gates](./governance/multisig-gates.md).
- **[Treasury](./treasury/index.md)** — what the account holds and how the app shows it: the account as [vault](./treasury/vault.md), [assets](./treasury/assets.md), [transactions](./treasury/transactions.md), and [reward distributions](./treasury/capital-distributor.md).
- **[Application](./application/index.md)** — global discovery, wallets and participant identity, address input and display, action preparation, transaction submission, shared collection behavior, support, and curation.
- **[Access control](./access-control/index.md)** — how decisions become authorized calls and how people inspect that configuration: the [authorization and execution model](./access-control/authorization-and-execution.md), concrete [OSx authorization paths](./access-control/osx-authorization-paths.md), the [Permission Viewer](./access-control/permission-viewer.md), and [scoped authority](./access-control/scoped-authority.md), layered over the protocol's [permission system](./protocol-doc/core/permissions.md).

For capabilities deployed through an arrangement with the team, see [Aragon-deployed plugins](./application/aragon-deployed-plugins.md). Reward recipients can use [Capital Distributor](./treasury/capital-distributor.md#rewards-page) to inspect and claim their allocations.
