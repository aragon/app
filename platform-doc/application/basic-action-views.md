---
type: reference
title: Basic action views
tags: [governance, actions, transactions]
status: draft
source: established owner-confirmed action-builder and feature scope + app@f8bf9e87260190aefd7d8a0eb59f72844e6e4502 and installed @aragon/gov-ui-kit@2.11.2 action-view audit (2026-09-10, see log.md) + lending-market display verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner BENQI scope clarification (2026-09-13, see log.md) + OSx orientation contextual edits and permission-view source verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md)
---

# Basic action views

**Basic action views** explain familiar [actions](../governance/action.md) through purpose-built forms and readable summaries. They help an author choose what an account should do and help a reviewer understand the resulting change. The [Action builder](./action-builder.md) supplies the shared Basic, Decoded and Raw modes.

The actions below depend on the account's installed plugins, contract versions, permissions, and supported integration. The lending-market register/unregister actions are specific to BENQI. [Capital Distributor](../treasury/capital-distributor.md), [Gauge voting](../governance/gauge-voting.md) and [Cross-chain execution](../governance/cross-chain-execution.md) require compatible deployments arranged with Aragon. A visible action or a Basic view does not establish [authority to execute it](../access-control/authorization-and-execution.md).

## Preparing and reviewing

Most actions below have both a Basic form and a Basic details view on proposals and execution transactions. The important exceptions are:

- **Execute a nested batch** and **Create a nested proposal** have Basic details, while composition uses an ABI-derived form, raw calldata or an external transaction request.
- **Pause**, **Resume** and **End campaign** have Basic forms; their proposal and transaction details use Decoded or Raw.
- **Cross-chain destination actions** use a narrower interface: composition is generally through contract ABI or raw calldata. In destination details, recognized transfers and account/plugin metadata updates can retain Basic; the other specialized app views do not carry across automatically.

Catalogue entries and Basic views have separate support: [nested Execute and Create Proposal calls](#calls-containing-other-actions), for example, have Basic details without built-in catalogue entries or Basic forms.

Permission grants, revocations, and conditional grants (`grant`, `revoke`, and `grantWithCondition`) have no built-in catalogue entries, Basic forms, or Basic details. They can still appear as generic function items through an added contract ABI or a process's [allowed-actions list](./action-builder.md#filtering-to-allowed-actions). Decoded is available when the app has the function and parameter data; without it, or for a call explicitly entered as raw calldata, the view is Raw. The absence of dedicated entries and Basic views is deliberate: authors should understand [OSx permissions and their consequences](../osx-and-the-platform.md#how-do-permissions-and-conditions-work) before composing changes through the [Action builder's generic routes](./action-builder.md#direct-execution-and-permission-changes), subject to authorization.

Uploading an action file also changes which forms are available. Transfers and recognized multisig membership changes can regain their Basic forms. Other action families use Decoded or Raw, and imported mint, multisig-settings and Token Voting-settings actions can fail to open their form. Recreate those actions through **+ Action** when preparing them. For reuse and file format, see [action-set JSON](./action-builder.md#reusing-action-sets-as-json).

Basic summaries may depend on indexed metadata or current contract state. If a gauge record cannot be found, for example, Basic can show an empty state while Decoded still exposes its address. Review the target, action order and encoded call when a summary is incomplete; [simulation](./action-simulation.md) can help assess the batch before submission.

## Assets and identity

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Transfer assets** | Pay a recipient, move treasury funds or supply another account with native currency or an ERC-20 token. | Confirm asset, network, recipient and amount. The form permits amounts above the current balance, so funds must be available when execution occurs. A completed payment requires a separate return transfer to reverse. See [Assets](../treasury/assets.md#where-the-knowledge-surfaces). |
| **Update account metadata** | Change the account's name, description, image or resources so its public identity reflects its purpose. | The account address and authority remain the same. The replacement metadata is published to IPFS and its reference is set on the account; later metadata actions can update it again. |
| **Update process or body metadata** | Rename or explain an installed governance process or body, or update its resources. A top-level process can also change its human-readable proposal key. | This changes descriptive metadata; voting rules have their own settings actions. Unedited fields are preserved, the app pins the replacement JSON itself, and no IPFS hash is entered; the process key is included only for a standalone process. Metadata editing is offered for compatible plugin versions. Consider recognition and [proposal identifiers](../governance/proposal-identifiers.md) before changing a process key. |

## Multisig membership and rules

These actions manage the [membership](../governance/member.md#membership-and-participation) and settings of an installed Aragon multisig. This is independent from changing the owners of an externally-managed [Safe](../accounts/safe.md).

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Add members** | Give additional addresses a role in future multisig decisions, such as onboarding a signer or widening representation. | Adding members leaves the absolute approval threshold unchanged. Check whether the intended threshold should change too, and account for [membership snapshots](../protocol-doc/plugins/multisig-plugin/membership.md#two-speed-eligibility) on already-open proposals. |
| **Remove members** | Retire addresses from future multisig decisions, such as replacing a departed signer. | If the remaining roster would fall below the threshold, lower the threshold first in the ordered batch. Removal does not revoke snapshot eligibility on already-open proposals. **Verify `removeAddresses` in Decoded:** the Basic summary can incorrectly describe the selected members as additions. |
| **Update multisig settings** | Change how many approvals are required and, where exposed for a standalone process, who may create proposals. | The form bounds approvals against the current member count. Evaluate settings and membership changes together: the composer does not validate their combined outcome. See [batch ordering](../governance/action.md#action-order-and-failures) and [multisig gates](../governance/multisig-gates.md). |

Membership and settings can be changed again by another authorized action. Their effect on existing proposals follows the plugin's [membership and eligibility rules](../protocol-doc/plugins/multisig-plugin/membership.md), so restoring a roster is not a rollback of intervening decisions.

## Token governance

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Mint governance tokens** | Issue new tokens to a recipient, for example to expand a governance distribution. | The token must support minting and the account must hold its mint permission. Minting increases supply and can dilute existing holders' share; it does not spend an existing treasury balance. Voting consequences depend on the [voting-power mechanism](../guides/choose-token-voting-power-mechanism.md). |
| **Update Token Voting settings** | Adjust support, participation, duration, voting mode or proposal-creation requirements for a Token Voting process or body. | Choose thresholds against realistic participation. Proposal-creation controls are hidden for a body within an advanced process. Existing proposals retain their recorded settings; see [Token Voting](../protocol-doc/plugins/token-voting-plugin.md#the-proposal-lifecycle). |
| **Update Lock to Vote settings** | Adjust the corresponding rules for a process or body whose voting power comes from locked tokens. | Mode choice affects when voters can recover their tokens; Early Execution is unavailable. The Basic action also sets the separate minimum-approval ratio to zero, so it must not be used to preserve a deployment's nonzero approval floor. See [Lock to Vote](../protocol-doc/plugins/lock-to-vote-plugin.md#the-voting-model-and-how-it-differs). |

The settings details view compares proposed and existing values when the app can resolve the target plugin. An external or unavailable plugin may leave only Decoded or Raw. Later authorized settings changes can revise the configuration; minting has no inverse action in this Basic catalogue.

## Calls containing other actions

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Execute a nested batch** | Ask another authorized account or executor to run an ordered set of calls, including [execution on a linked account](../accounts/executing-on-a-linked-account.md). | Review the inner targets and the account that will call them. Linking accounts does not itself grant control. The nested batch's execution rules and failure settings still matter; see [execution](../protocol-doc/core/execution.md). |
| **Create a nested proposal** | Use one account's action to submit a proposal to another governance plugin, including a signaling proposal with no inner actions. | Review the target process, proposal content, timing and inner calls. A normal target proposal still has its own decision process; an [Admin plugin](../governance/admin-flow.md) executes its actions during creation. |
| **Forward a cross-chain message** | Initiate an action batch on a configured destination chain after the source account executes the forwarding action. | Confirm the destination route, inner calls, destination gas limit and controller fee-token funding. Changing destination clears the prepared inner batch. Source approval alone does not send the message; see [Cross-chain execution](../governance/cross-chain-execution.md). |

For nested details, the app checks decoded children against the encoded action array. If they disagree, it shows the array as raw actions so the reviewer can inspect the calls that are actually encoded.

## Gauges and lending markets

These actions administer the destinations available to [Gauge voting](../governance/gauge-voting.md). They do not cast a holder's allocation vote or automatically distribute rewards.

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Create a gauge** | Add an address and its description as a gauge destination. | Confirm the intended address and how voters should understand it. A created gauge remains in the list; deactivation controls whether it can receive new votes. |
| **Deactivate a gauge** | Stop an existing active gauge from receiving new votes, for example when retiring a destination. | This preserves the gauge's identity and can be reversed by reactivation. |
| **Reactivate a gauge** | Make an inactive gauge available for new votes again. | Select the existing inactive gauge; creating a second identity is unnecessary. |
| **Update gauge metadata** | Clarify or correct a gauge's name, description, image or resources. | The gauge address remains the same. Confirm that the new description still represents that destination. |

These four actions use the authority described in [gauge administration](../governance/gauge-voting.md#gauges-and-their-administration).

### BENQI lending-market actions

The following actions belong to the [BENQI-specific lending-market integration](../governance/benqi-lending-market-gauges.md). They use Gauge Registrar's separate permission and market identity.

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Register a lending-market gauge** | Register a market incentive with Gauge Registrar so it can be represented in Gauge voting. | Confirm the qiToken, Supply/Borrow choice and reward controller: together they identify the market incentive. Execution must occur outside the active voting window. |
| **Unregister a lending-market gauge** | Remove an existing market incentive registration when that arrangement should end. | Select the gauge by name and address. When reviewing a published proposal, inspect **Decoded** to verify the qiToken, incentive and controller; the selector and Basic details do not show those fields separately. The active-voting restriction also applies to removal. |

## Distribution campaigns

[Capital Distributor](../treasury/capital-distributor.md) turns a prepared allocation into token claims. Campaign management is available for client-arranged deployments with the required account authority.

| Action | Use and result | Before proposing or approving |
| --- | --- | --- |
| **Create a campaign** | Make a defined allocation claimable, such as an airdrop or a reward distribution. | Confirm the allocation, token, claim schedule and payout behavior before fixing them in the campaign. Client-specific lock payout gives recipients escrow positions. Creation does not itself pay every recipient; claims draw on account funds. |
| **Pause a campaign** | Temporarily stop claims while an issue is investigated or a distribution needs to wait. | Choose an active campaign. Resume can reopen it, subject to its existing schedule. Pausing does not reverse completed claims. |
| **Resume a campaign** | Reopen a paused campaign when claims should continue. | Check that the campaign's original claim window and funding still permit payouts. Resume does not rewrite its allocation or schedule. |
| **End a campaign** | Permanently close a campaign when no further claims should be accepted. | Ending is irreversible. The Basic form selects active campaigns; use Pause when the intended stop is temporary. |

For schedule timing, payout choices and client-specific preparation, see [Campaign actions](../treasury/capital-distributor.md#campaign-actions).
