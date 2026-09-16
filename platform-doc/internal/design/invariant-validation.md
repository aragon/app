---
type: pattern
title: Refuse unsatisfiable configuration
tags: [design, interaction, access-control]
status: draft
source: product-owner principles review (2026-07-29, see log.md) + protocol-doc/plugins/multisig-plugin/membership.md + app source verification (2026-08-04, app@122f1bd1; see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md)
---

# Refuse unsatisfiable configuration

Invariant validation rejects governance settings that cannot satisfy the rules they configure. Consequential but valid choices receive warnings and remain the account's decision. This is the design rule for governance invariants; required fields and metadata formats have their own input rules, and passing a form does not prove complete coverage of contract constraints.

For example, an approval or support ratio that can never be reached would create an impossible configuration rather than express user autonomy. The protocol has the same shape for multisig membership: `minApprovals` must stay between one and the current member count ([membership invariant](../../protocol-doc/plugins/multisig-plugin/membership.md)).

This boundary is narrower than actor eligibility. An eligibility guard explains why the connected actor cannot take an otherwise valid action; an invariant refusal rejects a value that cannot describe a workable configuration for anyone.

## Instances

The [governance designer's numeric controls](../../governance/governance-designer.md#configuring-token-based-governance) exclude 100% support while allowing 100% participation, reflecting the [strict support comparison](../../protocol-doc/plugins/majority-voting.md). Multisig approvals are capped at the member count, including in the [update-settings action](../../application/basic-action-views.md#multisig-membership-and-rules). In Aragon's advanced configuration flow, a [stage's thresholds](../../governance/stage.md#stage-rules) are capped at the number of bodies of the corresponding role.

The [proposal-creation step](../../governance/governance-designer.md#wizard-sequence) rejects restricted creation without a configured source of creation eligibility. This is a check across the process design; it does not prove that a current holder meets a voting-power requirement.

[Gauge management](../../governance/gauge-voting.md#management-form-validation) restricts deactivation to active-gauge selections and reactivation to inactive-gauge selections. Its required names and descriptions are metadata rules. [BENQI registration](../../governance/benqi-lending-market-gauges.md#registering-and-removing-market-incentives) warns about execution during voting while allowing proposal creation; a timing notice is not a configuration refusal.

For support and multisig approval thresholds, a minority configuration remains satisfiable. The app marks that choice with a warning and allows it, leaving the decision to the account.
