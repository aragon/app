---
type: capability
title: Action builder
tags: [governance, transactions]
status: draft
source: original product vision document + modularity strategy document (product-owner, mined 2026-07-14, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app action import/export and permission-filter verification + product-owner scope answer (2026-08-04, see log.md) + product-owner action-builder briefing and app verification (2026-08-05, app@122f1bd1; see log.md)
---

# Action builder

The app's shared toolkit for composing ordered [actions](./action.md) and rendering them understandably wherever they appear. The same builder prepares actions for a [proposal](./proposal.md) and for a [direct `DAO.execute` transaction](../treasury/create-transaction.md); its viewer explains action batches on proposal and transaction surfaces. **User promise:** build robust action batches without hand-crafting calldata, and understand what an account is being asked to execute.

This readable action builder is a core part of the product's value as a **control surface** for protocols and on-chain assets — the bar being a substantially better experience than reading calldata on Etherscan, and ultimately better than comparable interfaces.

## Understanding actions

Every action carries a **viewer**: a dropdown of the same three presentation levels, always present on every action, **disabled when unsupported** for that particular action. Keeping the stable set visible orients the reader while the disabled state communicates which representations this action supports — the disabled treatment in [control availability](../design/control-availability.md). The app shows the friendliest level it can and falls back down toward raw as support drops off:

- **Basic view** — available when the app is *aware of the contract*: a custom UI purpose-built for that contract's ABI and function selector. It reads more cleanly than a decoded dump and sometimes carries enriched data of its own — a transfer showing the recipient's ENS name, or a [Capital Distributor](./capital-distributor.md) action showing the campaign being created. Specialized examples include an action whose payload is a nested `DAO.execute` action array, one proposal creating another proposal on a plugin, and creating, deactivating, reactivating, or updating metadata for [gauges](./gauge-voting.md). These are examples of the generalized nested-action presentation, not separate top-level capabilities. There are a number of basic views today, deliberately uncatalogued here: the set grows over time and includes ones built for specific clients.
- **Decoded view** — available when the app has the contract's ABI: calldata decoded against it and broken down into parameters for the reader to interpret, without the basic view's native framing. **Contract data, including the ABI, comes from the block explorer** — an unverified contract has no ABI there, so decoded (and basic) are unavailable for it and the viewer falls back to raw. This is also why *composing* an action against a contract's write methods needs the ABI (see [Adding actions](#adding-actions)), while *reading* an already-attached action never strictly does: raw view carries no such dependency.
- **Raw view** — always available, on every action regardless of contract verification: the action's underlying calldata itself.

**Nested calls are unnested and decoded**, at the decoded and basic levels. When an action tells another account to execute — as in [executing on a linked account](../accounts/executing-on-a-linked-account.md) — the app decodes the inner calls so the reader sees what will ultimately run.

The basic/decoded/raw ladder and nested-call decoding are the app's mitigation for an outer wallet call that may not reveal the semantic actions clearly. This readable presentation is what a Safe signer reviewing a nested `Create Proposal` call does not get; [stages over direct permission grants](./stages-over-direct-permissions.md#why-it-is-discouraged-nested-action-review) is the canonical instance. Reading actions clearly is also a different question from testing whether they will work once executed — see [action simulation](./action-simulation.md).

## Adding actions

The same builder appears in [proposal creation](./proposal-creation.md#creating-a-proposal) and the direct [create-transaction flow](../treasury/create-transaction.md). It starts as an empty action list, with three routes beneath it: the primary **+ Action** control, **WalletConnect**, and **Upload**. In proposal creation, an author can leave this list empty and publish a [signaling proposal](./proposal.md).

When several actions are present, their list order is their execution order. The account executes them in that order as one action batch — after a proposal passes, or immediately through a direct transaction — and any action can be moved up or down or removed before submission ([protocol execution](../protocol-doc/core/execution.md)).

### Filtering to allowed actions

During proposal creation, when the selected process has an execute grant scoped by the [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md), **Only show allowed actions** starts enabled. In that state:

- **+ Action** is filtered to the target-and-selector combinations the condition allows;
- **WalletConnect** is hidden; and
- **Upload** is hidden.

The bulk routes are hidden because an arbitrary external transaction or imported array is unlikely to fit the process's allowlist. Turning the toggle off restores the broader routes and action list, but it does not expand the process's onchain authority: a drafted action outside the condition can still fail when the process tries to execute it. [Scoped authority](../access-control/scoped-authority.md) owns why the condition exists and how its allowlist changes.

### Adding one action

**+ Action** opens a searchable list grouped by contract. Each group carries the contract's name and address; each item is exactly one write function, identified in the interface by its function selector. Selecting one item appends one action to the builder.

The default list is curated rather than a dump of every ABI the app knows. Installed plugins register the actions they contribute, and the app registers further friendly actions against known permission IDs; the resulting plugin actions are filtered to calls the account itself is authorized to make. When allowed-only filtering is active, the process condition's target-and-selector list supplies the available items instead. A registered action with a purpose-built form keeps that form when it also appears in the allowed set.

To call a function outside the curated list, the author can paste a contract address into the search or choose **Add contract address**. The verification dialog checks whether the address is a proxy, resolves its implementation when it is, checks contract verification, and asks the backend for the ABI. A verified ABI contributes the contract's write functions to its group. An unverified address can still be added, but without an ABI it contributes only the raw-calldata route; decoded function forms are unavailable.

**Transfer** is the deliberate exception to the contract-first list. Showing every asset in the account as a separate token contract would make a routine treasury action depend on the user understanding how token balances are stored. From the unrestricted curated list, Transfer therefore begins without a selected contract and asks for the asset, amount, and recipient in a friendly form. An allowed-only Transfer can instead arrive fixed to the condition's target, with asset selection locked. Selecting an ERC-20 makes the token contract the target and encodes its `transfer` call. Selecting the chain's native asset makes the recipient the target, leaves calldata empty (`0x`), and carries the amount as the action's native-token `value` ([action shape](./action.md)).

### Composing and validating one action

The composer uses the same stable **Basic / Decoded / Raw** menu as the reading-side viewer, with unsupported levels disabled, but editability depends on how the action entered the builder:

- **Basic** is a purpose-built form registered for a known contract and function. It can name the task in product language, select appropriate controls, fetch supporting data, and add helpers that a generic ABI form cannot. Transfer's asset, amount, and recipient form is the representative example. When Basic is available, it is the editable semantic form; Decoded and Raw show what that form produces.
- **Decoded** is the ABI-derived form. When no Basic form exists and an ABI is available, it exposes one field per function parameter, labels the parameter with its Solidity type, shows its NatSpec notice when present, and handles nested tuple and array inputs. Validation follows the declared types — including booleans, addresses, byte strings, and unsigned integers — and valid field values are re-encoded into calldata. A payable function also exposes the native-token value. When Basic exists, Decoded is a read-only inspection of the same action rather than a second editable source of truth.
- **Raw** exposes the action's `value` and `data`. It is editable for an explicitly raw action, including an unverified contract with no ABI; for an ABI-backed or Basic action it is the read-only encoded result. An author can therefore populate the Decoded form and switch to Raw to inspect the calldata it produced.

This hierarchy keeps every action expressible: friendly where the app has product knowledge, typed where it has an ABI, and raw when neither is available.

### Adding through WalletConnect

WalletConnect makes the [account](../accounts/account.md) the address connected to another dApp. The author copies that dApp's WalletConnect URI — commonly exposed through its QR-code flow — into the Aragon dialog. The Aragon app then listens for the dApp's transaction requests. It does not immediately attach the first one: supported requests are decoded when possible and queued, so the author can collect several and add the batch to the action list at once. A request that cannot be decoded is preserved as a raw action rather than discarded. With the roles reversed, WalletConnect is also how a primary account [executes on a linked account](../accounts/executing-on-a-linked-account.md) it controls.

This interoperability has an important limit. Many dApps assume an EOA can confirm one transaction immediately before the interface reveals the next dependent step. A token approval followed by a swap is the common shape: if the dApp waits for the approval to execute before offering the swap, but if the approval must pass through governance it cannot collect both steps in one uninterrupted session. WalletConnect can capture the requests a dApp emits; it cannot make every EOA-oriented multi-transaction flow governance-aware.

### Adding through upload

Upload accepts a portable JSON action array. The reuse workflow and its exact shape are below.

Permission management uses this generic action surface. A grant, conditional grant, revoke, or condition-configuration call can be attached to a proposal or sent through a direct transaction when the route's caller and the account's authorization admit it. The [governance designer](./governance-designer.md) establishes a new process's initial scope; [scoped authority](../access-control/scoped-authority.md) explains how later actions change the live configuration.

## Reusing action sets as JSON

The complete action array can be downloaded from three surfaces: while composing a proposal's actions, from an existing proposal's details page, and from the detail dialog for an execution on the [Transactions](../treasury/transactions.md) page. The composition flow is the concrete app location behind the release-note source's ambiguous phrase "a governance process that's in progress."

The file is an array of actions, each carrying the same three fields the account eventually executes: `to`, `value`, and `data`. It is an action set, not a proposal object. The product has no separate duplicate-proposal command: reusing a proposal means downloading its action JSON and uploading that portable set into a new builder.

Import validates that array and its field shapes, then decodes the actions as a batch. The builder shows a loading state while this happens. Recognized actions regain their Basic forms; other verified calls regain the Decoded view. An action whose contract cannot be verified or whose calldata cannot be decoded remains present in Raw view with its imported target, value, and calldata preserved.

The reading-side and composing-side menus deliberately use the same Basic / Decoded / Raw vocabulary. What differs is which level is editable: the reader only inspects, while the composer edits at the friendliest supported level and exposes lower levels as the resulting representation.
