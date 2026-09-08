---
type: guide
title: Add a multisig gate to an advanced governance process
tags: [governance, onboarding]
status: draft
source: product-owner briefings (2026-07-28 and 2026-08-03, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md)
---

# Add a multisig gate to an advanced governance process

Use this guide when you want a Safe or an Aragon multisig to protect a defined point in an advanced governance process — before or after Token Voting, or elsewhere in a longer process. By the end, you will have chosen the right kind of multisig, placed its stage in the process, and defined the configuration needed to set it up.

**Availability:** the [advanced flow](../governance/governance-designer.md#the-advanced-flow) is available in Governance Designer, including its granular permission management. Contact the Aragon team when a complicated configuration cannot be represented faithfully in the flow; this is the [reach-out pattern](../design/reach-out-to-the-team.md). The decisions below prepare you to configure the process or to explain the case clearly.

## 1. Decide what the multisig should protect and how

Choose where the safeguard belongs in the process and whether the multisig should approve or veto at that point:

- **Before Token Voting:** use the multisig as the first stage when a smaller group should approve which proposals reach token holders.
- **After Token Voting:** place it after Token Voting when a security council or similar group should provide final approval before execution, or give it a veto role when the proposal should proceed unless that group objects during the protected window ([optimistic governance](../governance/optimistic-governance.md)).
- **Elsewhere in a longer process:** put the multisig at the point where its safeguard is needed and assign its approval or veto role explicitly; a multisig stage is not limited to sitting directly beside Token Voting.

A request that the multisig should "create proposals but not vote" does not necessarily require a separate permission. In Aragon, the multisig can be the governing [body](../governance/body.md) of an approval stage, with proposal creation limited to its members. The [multisig gates](../governance/multisig-gates.md) pattern explains why this staged form is usually the clearer model.

## 2. Choose the kind of multisig

Resolve what "multisig" means for this account before configuring the process ([Safe vs Aragon multisig](./safe-vs-aragon-multisig.md)):

- Choose a **Safe** when an existing Safe account and its owners should act as the stage's governing body. Have the Safe address ready.
- Choose an **Aragon multisig** when the account should install a multisig plugin for this role. Decide its members and approval threshold.

## 3. Configure the staged process

In the [governance designer](../governance/governance-designer.md):

1. Open **+ Governance** from the account's settings page, or from the dashboard of a newly launched account while it is still in the admin flow.
2. Choose the **advanced** flow and create the stages in the order you decided above.
3. Add the multisig as the body of its stage:
   - For an **Aragon multisig**, add the multisig plugin and configure its members and approval threshold.
   - For a **Safe**, use **add body → any address** and enter the Safe address. When the app recognizes the address as a Safe, it offers Safe owners as the eligibility condition for that body's proposal-creation control ([Safe as a body](../governance/safe-as-a-body.md)).
4. Add Token Voting and any other bodies to their stages, then configure each stage's duration, expiration, early-advance behavior, each body's approval or veto role, and the body thresholds ([stage](../governance/stage.md)).
5. Set who may create the overall proposal ([proposal creation](../governance/proposal-creation.md)). For a multisig-first process, this is commonly limited to the Safe owners or Aragon multisig members.
6. Review and apply the installation. On a newly launched account, the admin flow can execute the installation immediately; otherwise the governance change proceeds as a proposal.


## 4. Check the participant experience

- The [Voting Terminal](../design/voting-terminal.md) shows the whole staged pipeline on the proposal page, so a Safe or multisig stage is as visible as any other.
- Safe owners who need to act as the Safe connect through Safe's Apps section ([connecting a Safe](../accounts/connecting-a-safe.md)).
- [Action simulation](../governance/action-simulation.md) lets anyone on a supported chain check that a proposal's already-bundled actions will work, independent of which stage is active.
- The [action builder](../governance/action-builder.md) presents those actions decoded and readable.

## 5. Avoid the direct-permission shortcut unless invisibility is intentional

A Safe can instead receive proposal-creation or execution permission directly, outside the staged process. That role will not appear in the Voting Terminal, and an Aragon multisig cannot use an isolated permission the way a Safe account can. Prefer the visible staged form unless the account deliberately wants the Safe's role outside the process; [stages over direct permission grants](../governance/stages-over-direct-permissions.md) covers the trade-off and the exceptional setup.

## Done when

You are ready to configure the process when you have specified the multisig kind, its address or member configuration, its position and body role, and who may create proposals. Setup is complete when the Voting Terminal exposes the multisig as a visible stage in the intended position. If a complicated configuration cannot be represented faithfully in the flow, bring those decisions to the Aragon team.
