---
type: capability
title: Action builder
tags: [governance, transactions]
status: draft
source: original product vision document + modularity strategy document (product-owner, mined 2026-07-14, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner Granular Access Control marketing brief + release-notes briefing (2026-08-03, see log.md) + app action import/export and permission-filter verification + product-owner scope answer (2026-08-04, see log.md) + product-owner action-builder briefing and app verification (2026-08-05, app@122f1bd1; see log.md) + product-owner release-notes briefing and app verification (2026-09-08, @aragon/app@1.36.0–1.38.0; see log.md) + tagged-source reconciliation (2026-09-09, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner Action builder review and app@adad6787 cross-chain detail verification (2026-09-10, see log.md) + OSx orientation contextual edits and permission-view source verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + direct-composer filtering verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557; see log.md); relocated section provenance in log.md (section-audit observations, 2026-09-13) (2026-09-13; no fresh source verification) + product-owner briefings (2026-09-15, see log.md)
---

# Action builder

The **Action builder** lets users compose ordered [actions](../governance/action.md) and inspect what each action will do. It provides familiar forms for common tasks, contract-function inputs for other calls, and access to the encoded calldata. Users can prepare changes without writing calldata by hand and review the calls an account is being asked to execute.

The [execution route](./execution-routing.md) determines whether the prepared actions are submitted through a governance proposal or the separate direct-execution flow.

## Adding actions

During [proposal creation](../governance/proposal-creation.md#creating-a-proposal), the Action builder starts with an empty list. **+ Action** opens a searchable action catalog grouped by contract. Each group shows the contract's name and address; each item identifies a write function by its function selector. Selecting an item adds an action to the list, ready to configure.

The catalog includes actions supplied by installed plugins and other actions registered by the app. Choose an action, fill in its fields, and add any further actions needed for the proposal. The available [views](#viewing-actions) let you inspect the resulting call as you edit.

`grant`, `revoke`, and `grantWithCondition` have no built-in catalogue entries or Basic forms. Use the [generic permission-change routes](#direct-execution-and-permission-changes) with an understanding of the authority being changed.

Actions execute in list order. You can move each action up or down or remove it before submission. An empty list is also valid for a [signaling proposal](../governance/proposal.md#proposal-lifecycle).

### Adding a contract

To call a function outside the catalog, paste a contract address into the search or choose **Add contract address**. The app checks whether the address is a proxy, resolves its implementation, and retrieves the verified contract's ABI through the backend and block explorer. Its write functions then appear in the contract group.

An unverified address can also be added. Without an ABI, it offers raw-calldata input; with an ABI, the app can provide named function parameters.

Explorer-backed contract data is chain-dependent too: the backend selects a configured explorer API for the network, using Etherscan, Routescan, zkSync, or Blockscout integrations as appropriate. One product consequence is whether the [action builder](./action-builder.md#viewing-actions) can use a contract's published ABI for Decoded views. Basic support also depends on recognizing the action and supplying its supporting data.

### Transferring assets

**Transfer** asks for the asset, amount, and recipient. In the unrestricted catalog, you choose the asset without first selecting its contract. When Transfer comes from an allowed-actions list, the asset can be fixed to the permitted target.

For an ERC-20 transfer, the action calls the token contract's `transfer` function. For the chain's native asset, it targets the recipient, uses empty calldata (`0x`), and carries the amount in `value` ([action fields](../governance/action.md)).

The asset picker defaults to held ERC-20 tokens, showing each asset's symbol, amount held, and fiat value.

That offer is a default, not a boundary. An **Add address** route sits above the holdings list, is the empty state's action, and appears on its own when a pasted address matches nothing the account holds; the address must resolve as an ERC-20 — otherwise the selector reports "Not a recognized token" — but is never checked against the holdings, and enters the form showing a balance of zero.

Transfer composition accepts a positive amount even when it exceeds the account's current balance. This lets a proposal describe a transfer funded before execution. **Max** fills the current holding as a convenience; the account must have sufficient funds when the transfer executes.


Transfer amounts are rounded to the token's supported precision. For example, entering 1.1234567 for a token with six decimals produces 1.123457 in both the amount field and the encoded action. The app gives no separate rounding notice, so review the resulting amount before submission.

These selection and amount rules apply to proposals and direct transactions.

### Adding through WalletConnect

**WalletConnect** connects the [account](../accounts/account.md) to another dApp so you can collect that dApp's transaction requests as actions. Copy the dApp's WalletConnect URI, commonly available through its QR-code flow, into the Aragon dialog. Requests are decoded when possible and queued, allowing you to collect several before adding them to the action list together. Requests that cannot be decoded retain their raw calldata.

Some dApps wait for one transaction to execute before offering the next step. For example, a dApp may require a token approval to complete before it offers a swap. If that approval needs governance approval and execution, you cannot collect both requests in one uninterrupted session.

WalletConnect also supports the reverse arrangement, where a primary account composes actions in Aragon to [execute on a linked account](../accounts/executing-on-a-linked-account.md).

### Reusing action sets as JSON

**Upload** adds a saved JSON action array. You can download an action array while composing a proposal, from an existing proposal's details page, or from an execution's detail dialog on the [Transactions page](../treasury/transactions.md).

Each entry contains the action's `to`, `value`, and `data`. To reuse a proposal's actions, download that array and upload it into a new proposal. Metadata and governance settings are supplied separately during creation; the app has no separate duplicate-proposal command.

Import validates the array and field shapes, then decodes the actions while showing a loading state. Transfers and recognized multisig membership changes can regain Basic forms. Other action families use Decoded or Raw, and imported mint, multisig-settings, and Token Voting-settings actions can fail when opening their Basic form. Recreate those actions through **+ Action**. [Basic action views](./basic-action-views.md#preparing-and-reviewing) lists the form-support distinctions.

An action that cannot be decoded retains its imported target, value, and calldata in Raw.

## Composing and validating one action

Decoded forms expose a field for each function parameter, labeled with its Solidity type and its NatSpec notice when available. They support nested tuples and arrays, validate values against their declared types, and encode valid input as calldata. Payable functions also expose the native-token value.

Basic forms can add task-specific controls and checks against current onchain state. The multisig add-members form rejects an existing member, and the settings form limits the approval threshold to the current member count. These checks apply independently to each action; they do not anticipate changes elsewhere in the array. For example, the settings form can reject a higher threshold even when an earlier action would add enough members to support it.

Review the [action order and combined effects](../governance/action.md#action-order-and-failures), and use [action simulation](./action-simulation.md) to test the batch through its intended execution route.

## Viewing actions

Each action can be viewed as **Basic**, **Decoded**, or **Raw**, depending on the available information. These views are available while editing an action and when reading already-proposed actions on the [Proposal details page](../governance/proposal.md#proposal-details-page). On the proposal page, the actions are read-only.

| View | What you see | When composing an action |
| --- | --- | --- |
| **Basic** | A purpose-built form or readable summary for a recognized action, such as a transfer, metadata update, or governance setting. Recognition uses the action type or a registered function signature, with supporting data supplied by the app. | Where a Basic form is available, you edit its task-specific fields. Decoded and Raw show the resulting call for inspection. |
| **Decoded** | The contract function and its parameters, decoded using the ABI. | When no Basic form exists and an ABI is available, you edit the function parameters. With a Basic form, Decoded is read-only. |
| **Raw** | The encoded calldata and native-token value. This view is available regardless of contract verification. | You can edit an explicitly raw action, including a call to an unverified contract. For a Basic or ABI-backed action, Raw shows the encoded result read-only. |

The app opens the friendliest supported view: Basic, then Decoded, then Raw. When multiple views are supported, a dropdown shows all three and disables unavailable choices. An action with only Raw support has no view dropdown.

Decoded requires an ABI; when the explorer cannot supply one, the call remains available in Raw. Some Basic actions, such as native-token transfers, have a readable representation without that lookup. [Basic action views](./basic-action-views.md) lists the supported actions and distinguishes their forms from their read-only details, including client-specific availability.

## Filtering to allowed actions

During proposal creation, when the selected process's Execute permission is scoped by an [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md), **Only show allowed actions** starts enabled. It filters **+ Action** to the permitted target-and-function combinations and hides **WalletConnect** and **Upload**.

Turning the toggle off restores those routes and the broader catalog. The process's onchain permissions still apply, so actions outside its allowed scope can fail at execution. [Scoped authority](../access-control/scoped-authority.md) explains how that scope is configured and changed.

In [direct transaction composition](../treasury/create-transaction.md), this toggle starts off. Turning it on hides WalletConnect and Upload but does not narrow the action catalog to the connected actor's Execute permission. The catalog's account-permission check below still applies.

An allowed-actions list can expose permission functions as generic items even though the built-in catalogue has no dedicated entries for them.

Allowed actions keep their Basic forms where supported. A target or function the app cannot decode remains available with a generic label and Raw input.

### Permissions in the action catalog

Registered plugin actions can declare a required permission ID. The catalog includes such an action when the indexed active grants match that permission ID, the action target as `where`, and the account as `who`. Actions without a declared permission requirement remain available.

This check matches the grant; it does not evaluate any attached condition or establish that execution will succeed. The selected process's allowed-actions filter is applied in addition to this catalog check.

## Nested action arrays

An action can contain another action array, such as a call asking another account to execute a batch or asking a plugin to create a proposal. Recognized Execute and Create Proposal calls have Basic details that list their inner actions. To compose those calls, use a Decoded form, raw calldata, or an external transaction request.

When reviewing a nested execution, the app compares the decoded inner actions with the encoded array. If they disagree, it shows the entire inner array as raw actions.

The **Forward message** form for [cross-chain execution](../governance/cross-chain-execution.md#building-and-reading-the-action) opens a nested composer on the destination network. The configured route determines the destination account. Contract definitions added during composition remain available when the dialog is reopened. Destination forms and read-only details have their own support rules, described under [Cross-chain execution](../governance/cross-chain-execution.md#building-and-reading-the-action).

## Direct execution and permission changes

An authorized wallet can also use the Action builder in the [direct transaction flow](../treasury/create-transaction.md). It composes an array for `DAO.execute`, and completed executions can be reviewed through the Transactions page.

To compose `grant`, `revoke`, or `grantWithCondition`, use **Add contract address** with the account's verified ABI and choose the function in a Decoded form. **Upload** and **WalletConnect** can also supply these calls. Decoded is available when the app has the function and parameter data; without it, or for a call explicitly entered as raw calldata, the view is Raw. Their absence from the built-in catalogue and Basic forms is deliberate: research [OSx permissions and conditions](../osx-and-the-platform.md#how-do-permissions-and-conditions-work) and understand the consequences before changing authority.

These permission changes can run through proposals or direct transactions only when the account's permission table authorizes the route. Normally, a proposal runs on a process that can make the account call itself, where the account holds [ROOT to administer its permission table](../access-control/osx-authorization-paths.md#root-administers-the-dao-permission-table). A verified ABI exposes the functions without establishing authority to execute them. Read [Manage permissions through governance](../protocol-doc/guides/manage-permissions.md) for the governed route and [granting and revoking](../protocol-doc/core/permissions.md#granting-and-revoking) for the operations' rules before composing a change.

Condition-configuration calls can also be included in proposals or direct transactions when the caller and account have the required authority. The [governance designer](../governance/governance-designer.md) configures a new process's initial scope; subsequent changes use the action paths described in [Scoped authority](../access-control/scoped-authority.md).
