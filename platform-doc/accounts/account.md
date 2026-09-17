---
type: concept
title: Account
tags: [accounts, semantics, naming, identity, metadata]
status: draft
source: aragon-knowledge-base/product/concepts/account-vs-dao.md (first-slice brain dump + product-owner Q&A, 2026-07-06) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner authority-vocabulary answer and authorization-model review (2026-08-04, see log.md) + product-owner release-notes briefing (2026-08-03; releases 1.3.0, 1.4, and the dictated 1.20.22/likely 1.22) + app source verification (2026-08-04, app@122f1bd1; see log.md) + protocol-doc/core/dao-metadata.md + protocol-doc/framework/dao-registry.md
---

# Account

The entity a user deploys and governs through the app. Two vocabularies name it, and both are correct in their own context:

- **Account** — the product term, and the more general concept: the thing that holds assets and acts.
- **DAO** — two narrower things. At the protocol layer, it names the account's contract: OSx's [`DAO.sol`](../protocol-doc/core/dao.md). In its own right, a *decentralized autonomous organization* — an accurate description of an account when its holders govern it as one, typically through token-based governance.

The terms nest rather than compete: every DAO is an account. Product and experience copy says **account**; "DAO" is right when a sentence names the OSx contract or an exact protocol identifier, or when it presents an explicitly token-governed use case whose token context is visible in the same passage. A DAO is one use case of the platform, never its product category — and the boundary has soft edges (an optimistic, veto-gated setup may or may not read as a DAO), so when in doubt, say account. The UI does not yet follow this rule everywhere; completing the product-copy rollout is tracked as a design opportunity, and these docs write the target copy rather than mirroring legacy labels.

## What an account is

An account is an address that can **act**: hand it a target, a value, and calldata, and it makes that call *as itself*, so the target sees the account as its caller. That generic execution entry point is the whole of it — an account is defined by being able to do arbitrary things on its own behalf, which is also what lets it meaningfully hold a treasury.

Two kinds qualify. An **externally-owned account** acts because whoever holds its private key can sign any transaction. A **smart contract account** acts because its code exposes such an entry point: an Aragon account through [`execute`](../protocol-doc/core/execution.md), a [Safe](./safe.md) through its own equivalent.

Most contracts are not accounts in this sense. An ERC-20 has an address, and tokens or ether can sit at it, but nothing can tell it to make a call on anyone's behalf — it exposes ledger operations, not execution. Ethereum's own state model does keep a record for every address, and its documentation calls those records accounts, "contract account" included ([Ethereum's account model](https://ethereum.org/en/developers/docs/accounts/)); that broader usage is worth recognizing when reading protocol material, but this base means the narrower thing, because the capability is what carries product meaning.

Protocol-doc names this same hat "the executor" ([DAO](../protocol-doc/core/dao.md)). At the product layer the noun is *account* and executing is what it does: an account **is** an executor rather than something paired with one.

In the normal OSx route, that capability makes the account the execution intermediary for its [plugins](../governance/plugin.md): a plugin calls `DAO.execute`, and the DAO account calls each action target as itself. A plugin's [target configuration](../governance/target.md) can also route approved actions through the plugin's own context. The normal account-mediated route is the kernel-like layer that lets one shared framework span different governance arrangements ([platform design principles](../principles.md)).

## Account and governor are distinct capabilities

An account acts; a **governor** resolves actors' preferences over proposed actions. A governor is an entity or component, commonly a contract with an address and state, that implements a voting or decision method ([authorization and execution model](../access-control/authorization-and-execution.md)). The two capabilities can be separate or live in the same contract.

Aragon commonly separates them: a governance [plugin](../governance/plugin.md) can be the governor, while the account executes the approved actions. A [Safe](./safe.md) combines them because its multisignature governance primitive and arbitrary-call capability are baked into the same smart account. An account with no attached governor, or one that has never made a call, is still an account.

Because the account is the address external targets authorize, it outlives the governors installed behind it: replacing the governor plugin can leave those targets' ownership or role configuration unchanged ([scoped authority](../access-control/scoped-authority.md#separate-responsibilities-without-changing-the-account)).

## How the app names and presents an account

An account's execution capability is separate from how the app names and renders it. **User promise:** see a human-readable account identity when its metadata is usable, retain an address fallback when it is not, and use an optional account-address ENS subname where the deployment supports one.

One account can also be presented alongside others it relates to — a primary account with any number of [linked accounts](./linked-account.md).

### Metadata-backed display

The account-creation flow pins the account's name, description, **logo** (serialized in the metadata's `avatar` field), and links as [DAO metadata](../protocol-doc/core/dao-metadata.md) ([creation payload](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialogUtils.tsx#L36-L47)). The app uses that metadata where the surface supports it. Its common display-name helper trims the metadata name and falls back to the truncated account address when the name is absent, empty, or whitespace ([display-name rule](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/daoUtils/daoUtils.ts#L77-L86)); the default dashboard header is one consumer of the same rule ([header presentation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/dashboard/components/dashboardDefaultHeader/dashboardDefaultHeader.tsx#L16-L62)). This is a bounded fallback for the surfaces using that helper, not a claim that every account string in the app is rendered through one universal component.

### The account's optional `dao.eth` subname

For an Ethereum-mainnet deployment, the creation wizard offers an optional label under `dao.eth`; it validates `<label>.dao.eth` and passes the chosen label to the DAO factory ([mainnet-only field and validation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createDaoForm/createDaoFormMetadata/createDaoFormMetadata.tsx#L33-L71), [field rendering](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createDaoForm/createDaoFormMetadata/createDaoFormMetadata.tsx#L101-L122), [factory transaction](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialogUtils.tsx#L49-L69)). When supplied, factory registration assigns the optional `<label>.dao.eth` record to the deployed account; leaving it blank still creates and registers the account ([DAO Registry](../protocol-doc/framework/dao-registry.md)).

The subname resolves to the account address, so it is a human-readable destination for sending assets to that address. The app also prefers the ENS value to the raw address in account routes when it is available ([URL construction](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/daoUtils/daoUtils.ts#L249-L260)). The address remains the durable fallback when no subname exists.

### Account identity vs. user identity

`<label>.dao.eth` names the deployed account's address. It is separate from `name.aragon.eth`, the Ethereum-mainnet ENS name for connected user wallets and uses as a primary ENS name and [Aragon Profile](./claiming-an-aragon-eth-name.md). One belongs to the governed account; the other belongs to the connected user, usually a person or organizational member.
