---
type: concept
title: Action
tags: [governance, semantics]
status: draft
source: modularity strategy document (product-owner, mined 2026-07-14, see log.md) + product-owner briefing (2026-07-28, second answers) + product-owner principles review (2026-07-29, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Action

An **action** is one onchain call: a target address, native-token value, and calldata. Several actions can travel in one transaction. Actions are the ***what*** of governance — what decisions an organization makes — where a [process](./process.md) is the ***how*** it makes them.

In the normal OSx path, a governance plugin calls its [account](../accounts/account.md) through granted permission and the account makes each action call as itself (mechanism: [execution](../protocol-doc/core/execution.md) in the protocol docs). An alternate plugin `TargetConfig` can instead run actions in the plugin's context, so the concrete caller must be read from the execution route ([authorization and execution model](../access-control/authorization-and-execution.md)). Actions can reach execution through [proposals](./proposal.md), after the governance process passes them, or through a [direct transaction](../treasury/create-transaction.md) when the connected actor already holds execute permission. The route changes how the batch is authorized, not the shape of its actions.

At execution, the account's [`execute`](../protocol-doc/core/execution.md#the-execute-function) receives an `Action[]` as one batched call. A signer's wallet may therefore present an outer call more tersely than the semantic actions it contains; the app must make the actions readable before that signing boundary (see the [action builder](./action-builder.md) and [honest abstraction](../principles/honest-abstraction.md)).

## What arrives as one wallet request

Several app flows compose several semantic actions into a single outer call the signer approves once.

- **Any multi-action proposal.** Creating a proposal embeds the whole action array inside one create-proposal call on the process's plugin ([publish](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/dialogs/publishProposalDialog/publishProposalDialogUtils.tsx#L54-L85)). Executing it later is a second, terser call carrying only the proposal's identifier — no trace of the actions it triggers appears in that call at all ([execute](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/dialogs/executeDialog/executeDialogUtils.ts#L1-L49)).
- **Direct execution, with no proposal.** An account holding standing execute permission can compose several actions and send them as one call on the account. Any single action reverting reverts the whole batch ([direct execute](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/dialogs/executeActionsDialog/executeActionsDialogUtils.tsx#L1-L53)).
- **Installing a governance process.** The [governance designer](./governance-designer.md) publishes in two signatures: a prepare step that batches the setup call for every new body into one transaction, then a proposal whose action array bundles a permission grant, one install-application per body, the stage wiring, the matching revoke, and — where the process's scope is restricted — the three further actions that swap its plain execute grant for a conditioned one ([the bundle](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils.ts#L143-L178)). More than a dozen granular actions can ride inside that one proposal.
- **Uninstalling or updating** an installed [plugin](./plugin.md) takes the same shape at smaller scale: a grant, the apply call, and the matching revoke.

When the process publishing that installation is the bootstrap [admin plugin](../accounts/admin-plugin-by-default.md), creating the proposal *is* executing it, so the second signature both creates and performs the entire bundle atomically ([why admin behaves that way](../protocol-doc/plugins/admin-plugin.md)).

The app's own action views unpack one layer of this for a reviewer: an action that is itself a wrapped execute or create-proposal call has its inner actions decoded and listed individually rather than left as opaque calldata ([action builder](./action-builder.md)). That is a different problem from what the wallet shows — the app hands the wallet only a target, a value, and calldata, so what a signer sees in the confirmation dialog is entirely the wallet's own decoding.

## Native and external

Any deployed smart contract with write functions can back an action, in two flavors:

- **Account-native** — actions calling the account's own functions: withdrawing funds to an address, installing or uninstalling governance, updating metadata.
- **External** — actions interacting with any smart contract outside the account.

The distinction is not necessarily a visual one in the UI: "native" means the app *handles the action differently* — it has a purpose-built basic view rather than only a decoded or raw one. That is a function of the app being aware of the specific contract, not of whether the action is account-native: the [action builder](./action-builder.md) owns the presentation of every action, native or external.

## What every action integration owes

Every action must be able to be **prepared** — built into an action batch — and **shown** — rendered understandably wherever that batch appears. The app's toolkit for both is its own capability: the [action builder](./action-builder.md).

Both obligations are owed per action, and so is every check behind them. An integration validates its own fields, and the sharpest of those checks read live onchain state: the multisig's add-members action rejects an address that is already a member ([the member check](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/components/forms/manageMembershipAddressList/manageMembershipAddressListItem/manageMembershipAddressListItem.tsx#L59-L84)), and its update-settings action bounds the approval threshold by the plugin's current member count, the same protocol invariant the designer surfaces when configuring a new multisig ([the live count](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/multisigPlugin/components/multisigActions/multisigUpdateSettingsAction/multisigUpdateSettingsAction.tsx#L77-L82), [the bound](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/components/forms/numberProgressInput/numberProgressInput.tsx#L44-L53), [refuse unsatisfiable configuration](../design/invariant-validation.md)). No validation layer checks the actions **against each other** as the proposal is composed. Each is prepared on its own ([preparation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/utils/proposalActionPreparationUtils/proposalActionPreparationUtils.ts#L19-L42)) and freely reordered or removed within the list ([action builder](./action-builder.md#adding-actions)), so a batch whose actions each validate individually is composable — including one whose actions contradict each other.

Multisig membership is the concrete case: the protocol's member-count invariant is order-dependent, so shrinking a multisig below its current threshold has to lower `minApprovals` before removing members ([the invariant and the ordering it forces](../protocol-doc/plugins/multisig-plugin/membership.md#minapprovals-and-the-member-count)). The app composes either order equally readily: the remove-members action never consults the threshold at all ([the action](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/multisigPlugin/components/multisigActions/multisigRemoveMembersAction/multisigRemoveMembersAction.tsx#L37-L117)), and the update-settings bound reads the roster as it stands rather than as the batch would leave it — the same blindness in the other direction, since it also holds back a threshold that only the proposal's own added members would make valid.

The consequence lands at execution and costs the whole proposal: where a plugin's create call takes a failsafe map the app passes an empty one ([create proposal](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/multisigPlugin/utils/multisigTransactionUtils/multisigTransactionUtils.ts#L55-L70)), so one reverting action rolls back the batch just as it does for direct execution above — only here after the proposal has been created, approved, and executed.

The surface that does weigh a batch as a whole is [action simulation](./action-simulation.md), which runs the array rather than reasoning about it. It is optional: the creation wizard pairs simulating with skipping ([the dropdown](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/hooks/useSimulateActionsDropdown/useSimulateActionsDropdown.ts#L101-L123)), and a likely-to-fail verdict still leaves the author free to continue to submission ([the dialog](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/dialogs/simulateActionsDialog/simulateActionsDialog.tsx#L103-L124)).

## Open questions

- [ ] What does a specific wallet's confirmation dialog actually show for one of these batched outer calls — the decoded inner actions, or only the top-level function and raw calldata? The app contributes nothing to that rendering, so closing this needs a named wallet's documented behavior or a walkthrough, not more source reading.
