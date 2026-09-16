---
type: reference
title: Voting Terminal design reference
tags: [design, components, governance]
status: draft
source: relocated from governance/proposal.md following product-owner audience-boundary review (2026-09-14, see log.md); original classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 with gov-ui-kit@2.11.4 (2026-09-13); no fresh source verification
---

# Voting Terminal design reference

Use gov-ui-kit's `ProposalVoting` pattern when building the proposal page's voting surface. The [proposal's voting and stage decisions](../../governance/proposal.md#voting) define the behavior the assembly must preserve.

For the compound component's API and variants, use gov-ui-kit's `Modules/Components/Proposal/ProposalVoting` story, especially `SimpleGovernance`, `SingleStage`, `MultiStage`, and `MultiBody`. The corresponding [Figma component](https://www.figma.com/design/ISSDryshtEpB7SUSdNqAcw/Governance-UI-Kit?node-id=16752-20193&m=dev) supplies the visual specification; local checkout entry points are listed in [Source repositories](../maintenance/repositories.md).
