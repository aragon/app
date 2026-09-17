---
type: capability
title: Cross-chain execution
tags: [governance, actions, cross-chain]
status: draft
source: product-owner briefing (2026-08-28) + app source verification at @aragon/app@1.38.0 (2026-09-08) + tagged frontend and backend reconciliation + aragon/crosschain@47b8034 + product-owner answers (2026-09-09, see log.md) + supported-chain reconciliation (2026-09-10, app@d1fa9970; see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Cross-chain execution

**Cross-chain execution** lets an [account](../accounts/account.md) on one chain forward a nested action batch for execution by another account on a destination chain. The app supports composing and reading that message through a recognized Cross-Chain Controller plugin.

## Availability

Cross-chain execution uses a bespoke [Aragon deployment](../application/aragon-deployed-plugins.md) for each account. Controllers, executors, adapters, and routes are configured for that deployment. The app supports composing and reading actions for compatible installed controllers. There is no self-service controller setup in the app; [contact the Aragon team](../application/getting-help.md#working-with-the-aragon-team) to arrange deployment and routes.

## Execution route

The source account calls `forwardMessage` on its Cross-Chain Controller. The controller passes the message to a Chainlink CCIP adapter. A corresponding controller on the destination chain receives the message through its adapter and dispatches the nested actions through the executor configured for the destination account. The executor runs the actions as one ordered, atomic batch: if any nested action fails, none of them execute.

The message is sent only when the containing action batch executes. If it belongs to a proposal, approving the proposal does not bridge anything by itself: execution of the approved proposal initiates the forwarding step.

## Building and reading the action

When the [Action builder](../application/action-builder.md) detects a configured Cross-Chain Controller, it offers the Basic action **Forward message**. The author:

1. selects a destination from the controller's configured routes, excluding the current source chain;
2. composes at least one nested action in the destination-network context; and
3. supplies the destination gas limit, using the app's estimate as a starting point.

The nested composer builds actions on a [supported destination chain](../application/supported-chains.md). Route configuration determines which controller and account receive the message, so the available destinations depend on the account's configured routes. **Forward message** is excluded from its own nested list. If the source process is restricted to allowed actions, the dialog loads the corresponding target-and-selector set for the selected destination chain before offering nested actions. Changing the destination clears the chain-specific nested batch and the previous gas result.

The configured route identifies a fee token. The form shows its symbol and links the controller address to the explorer, then warns that the controller needs a sufficient token balance to pay for delivery.

### Destination gas limit

The estimate comes from a backend simulation of the destination batch. The client adds a 30% safety margin, enforces a floor of `200,000`, and caps the field at `3,000,000` gas:

- an estimate below the floor becomes `200,000`;
- an estimate that fits below the cap but whose margin is clipped produces a reduced-margin warning; and
- a measured requirement above the cap produces no usable estimated value and tells the author to split the action batch.

The field remains manually editable, but it is required, accepts whole numbers only, and enforces the same floor and cap. The estimate is guidance rather than proof that destination execution will succeed. A destination or nested-action change invalidates the previous result, and a late response for an older batch is ignored.

### Reviewing destination actions

The action's readable view shows the destination chain, gas limit and nested actions. It cross-checks decoded children against the encoded message; if any child differs, the whole inner array is shown as raw actions. The nested array can also be downloaded in the Action builder's portable action format.

Destination actions have [narrower specialized support](../application/basic-action-views.md#preparing-and-reviewing) than the outer message. The destination composer uses contract ABI or raw-calldata forms. A destination transfer selected from an allowlist can fail to open its Basic form; use the general ABI or raw-calldata route to prepare that call. In destination details, recognized transfers and account/plugin metadata can retain Basic, while governance settings, gauge and campaign actions use Decoded or Raw. The destination view does not reuse the source account's plugin context.
