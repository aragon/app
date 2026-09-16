---
type: concept
title: Account
tags: [accounts, semantics, naming, identity, metadata]
source: aragon-knowledge-base/product/concepts/account-vs-dao.md (first-slice brain dump + product-owner Q&A, 2026-07-06) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner authority-vocabulary answer and authorization-model review (2026-08-04, see log.md) + product-owner release-notes briefing (2026-08-03; releases 1.3.0, 1.4, and the dictated 1.20.22/likely 1.22) + app source verification (2026-08-04, app@122f1bd1; see log.md) + protocol-doc/core/dao-metadata.md + protocol-doc/framework/dao-registry.md + product-owner semantic-anchor review and Safe core/extension verification (2026-09-10, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Account

An **account** is an address that can act: given a target, a value, and calldata, it makes that call as itself, so the target sees the account as its caller. That general-purpose execution capability lets it operate contracts and manage a treasury on its own behalf.

Two kinds qualify. An **externally-owned account** acts because whoever holds its private key can sign transactions. A **smart contract account** acts because its code exposes a general-purpose execution entry point: an Aragon account through [`execute`](../protocol-doc/core/execution.md), a [Safe](./safe.md) through its own equivalent.

Most contracts are not accounts in this sense. A standard ERC-20 contract has an address and can hold assets, but its token-ledger operations do not provide a general-purpose execution entry point. Ethereum's [account model](https://ethereum.org/en/developers/docs/accounts/) uses “contract account” more broadly for contracts with state; the Aragon product term identifies the narrower capability to make arbitrary calls as oneself.

## Account versus DAO

**Account** is the product term for the entity people deploy and govern through the app. **DAO** names its [Aragon OSx contract](../protocol-doc/core/dao.md), and can also describe a decentralized autonomous organization governed through that account, typically using token-based governance. A DAO is one use case of the platform.

Product and experience copy uses **account**. Use **DAO** when naming the OSx contract or an exact protocol identifier, or when describing an explicitly token-governed use case whose token context is visible in the same passage. When the organizational characterization is ambiguous, as it can be for an optimistic veto-gated setup, use account. Some existing UI labels still say “DAO”; the product-copy rule remains account.

An account is itself an [executor](../protocol-doc/core/dao.md). In the normal OSx route, a [plugin](../governance/plugin.md) calls `DAO.execute`, and the account calls each action target as itself. A plugin's [target configuration](../governance/target.md) can also route approved actions through the plugin's own context. The normal account-mediated route lets one shared execution framework support different governance arrangements.

## Account and governor are distinct capabilities

An account acts; a **governor** resolves actors' preferences over proposed actions. A governor is an entity or component, commonly a contract with an address and state, that implements a voting or decision method ([authorization and execution model](../access-control/authorization-and-execution.md)). The two capabilities can be separate or live in the same contract.

Aragon commonly separates them: a governance plugin can be the governor, while the account executes the approved actions. A [Safe](./safe.md) is a **governor/account monolith**: its core contract performs both roles, checking signer approvals and executing approved transactions. Its owners and approval threshold remain configurable, and modules can add alternative authorization paths.

An account with no attached governor, or one that has never made a call, is still an account.

Because external targets authorize the account's address, the account can outlive the governors installed behind it. For example, an organization can replace a council's multisig process with token voting while keeping its assets at the same address and retaining that address's ownership or roles on protocol contracts. The new process receives the appropriate execution scope; external contracts can continue recognizing the same account without each needing a new role assignment. [Scoped authority](../access-control/scoped-authority.md#separate-responsibilities-without-changing-the-account) determines which of those powers each process can exercise.

## Identifying an account

An account is first identified by its Ethereum address on its deployment network. Metadata and an optional ENS subname make that identity more readable.

The [account-creation flow](./account-creation.md) gives the account a name, description, logo, and resource links. These make the address recognizable in the app. Where no usable name is available, the default dashboard header displays a shortened account address.

On Ethereum mainnet, creation also offers an optional `<label>.dao.eth` subname, assigned to the account during [registration](../protocol-doc/framework/dao-registry.md). Leaving it blank still creates and registers the account. This account name is distinct from `name.aragon.eth`, the [Aragon Name](../application/aragon-names.md#claiming) associated with a connected user's wallet.

The `dao.eth` subname resolves to the account address and provides a human-readable destination for sending assets. The app also uses it in account URLs when available; the address remains usable when no subname exists.

For presenting a primary account alongside related accounts, see [Linked accounts](./linked-account.md).
