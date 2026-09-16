---
type: guide
title: Add a multisig gate to an advanced governance process
tags: [governance, onboarding]
status: draft
source: product-owner briefings (2026-07-28 and 2026-08-03, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + supported-chain reconciliation (2026-09-10, app@d1fa9970; see log.md) + product-owner briefings (2026-09-11, see log.md) + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and locked connector packages (2026-09-13, see log.md)
---

# Add a multisig gate to an advanced governance process

Add a Safe or an Aragon multisig to protect a defined point in an advanced governance process — before or after Token Voting, or elsewhere in a longer process. By the end, you will have chosen the right kind of multisig, placed its stage in the process, and defined the configuration needed to set it up.

**Availability:** advanced governance setup requires the Aragon team. Use [Advanced — On request](../governance/governance-designer.md#the-advanced-flow) to get in touch. The decisions below prepare the configuration you will give the team.

## 1. Decide what the multisig should protect and how

Choose where the safeguard belongs in the process and whether the multisig should approve or veto at that point:

- **Before Token Voting:** use the multisig as the first stage when a smaller group should approve which proposals reach token holders.
- **After Token Voting:** place it after Token Voting when a security council or similar group should provide final approval before execution, or give it a veto role when the proposal should proceed unless that group objects during the protected window ([optimistic governance](../governance/optimistic-governance.md)).
- **Elsewhere in a longer process:** put the multisig at the point where its safeguard is needed and assign its approval or veto role explicitly; a multisig stage is not limited to sitting directly beside Token Voting.

A request that the multisig should "create proposals but not vote" does not necessarily require a separate permission. In Aragon, the multisig can be the governing [body](../governance/body.md) of an approval stage, with proposal creation limited to its [members](../governance/member.md#membership-and-participation). The [multisig gates](../governance/multisig-gates.md) pattern explains why this staged form is usually the clearer model.

## 2. Choose the kind of multisig

Resolve what "multisig" means for this account before configuring the process ([Safe vs Aragon multisig](./safe-vs-aragon-multisig.md)):

- Choose a **Safe** when an existing Safe account and its owners should act as the stage's governing body. Have the Safe address ready.
- Choose an **Aragon multisig** when the account should install a multisig plugin for this role. Decide its members and approval threshold.

## 3. Arrange the staged setup with Aragon

1. Open **Process** from Settings, or use the governance-setup action on the onboarding dashboard, choose **Advanced — On request**, and select **Get in touch** ([getting help](../application/getting-help.md)).
2. Give the team the stage order and the multisig details: an existing Safe's address, or the intended Aragon multisig members and approval threshold.
3. Specify the other bodies, each body's approval or veto role, stage durations and expiration, early-advance behavior, and body thresholds ([stage](../governance/stage.md)).
4. Specify who may create the overall proposal ([proposal creation](../governance/proposal-creation.md)). For a multisig-first process, this is commonly limited to Safe owners or Aragon multisig members.
5. Review the configuration and installation with Aragon. An account still in its admin bootstrap can apply the installation immediately; otherwise its authorized governance process approves and executes the installation proposal.

## 4. Check the participant experience

- The [proposal page](../governance/proposal.md#voting) shows the whole staged pipeline, so a Safe or multisig stage is as visible as any other.
- Safe owners who need to act as the Safe connect through a custom Safe App or WalletConnect ([connecting a Safe](../application/connecting-a-safe.md)).
- [Action simulation](../application/action-simulation.md) lets anyone check a proposal's already-bundled actions on a [chain with simulation available](../application/supported-chains.md), independent of which stage is active.
- The [action builder](../application/action-builder.md) presents those actions decoded and readable.

## 5. Avoid the direct-permission shortcut unless invisibility is intentional

A Safe can instead receive proposal-creation or execution permission directly, outside the staged process. That role will not appear in the Voting Terminal, and an Aragon multisig cannot use an isolated permission the way a Safe account can. Prefer the visible staged form unless the account deliberately wants the Safe's role outside the process; [stages over direct permission grants](../governance/multisig-gates.md#stages-over-direct-permission-grants) covers the trade-off and the exceptional setup.

## Done when

You are ready to brief Aragon when you have specified the multisig kind, its address or member configuration, its position and body role, and who may create proposals. Setup is complete when the installed process exposes the multisig as a visible stage in the intended position.
