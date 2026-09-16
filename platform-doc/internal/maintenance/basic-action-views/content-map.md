---
type: reference
title: Basic action documentation content map
tags: [maintenance, governance, actions]
source: basic-action-view audit and content design (2026-09-10, see log.md) + product-owner BENQI scope clarification (2026-09-13, see log.md)
---

# Basic action documentation content map

Structure decision for the [basic-action audit](../basic-action-views.md). The inventory contains 22 action identities distributed across existing feature homes, with material differences between editing, reading, importing and nesting.

## Structure comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| Expand Action builder with every action | Makes the shared composition/viewing model carry 22 individual use cases and family-specific rules. Imports and nesting already need their own bounded explanation there. | Keep the model and common workflow in Action builder; add a catalogue link. |
| One area-filed reference plus existing feature pages | Gives a reader one complete list of actions, while campaign, gauge and cross-chain rules remain in their established capabilities. A compact list can distinguish create/detail support without reproducing technical evidence. | Adopt governance/basic-action-views.md, type reference, linked from Action builder and governance navigation. |
| Separate canonical page for every registration | Splits short actions such as pause/resume and duplicates the capability pages. Registry rows are not independent product concepts. | No new atomic action pages. Reconsider only when a particular action accumulates independent explanation that does not fit its feature home. |

## Page and section map

| Home and type | Purpose and outline | Unique facts / identities | Inbound navigation and contextual links |
| --- | --- | --- | --- |
| [Basic action views](../../../application/basic-action-views.md), reference | Lead and availability → preparing/reviewing exceptions → assets/identity → multisig → token governance → nested calls → gauges → campaigns | Complete action-level coverage A01–A22: purpose, when to choose, important outcome and prerequisite. Compact creation/details distinctions, including imports and destination scope. | Action builder, Action, governance index; feature links to Assets, multisig gates, voting-power guide, linked-account execution, Capital Distributor, Gauge voting and Cross-chain execution. |
| [Action builder](../../../application/action-builder.md), capability | Shared Basic/Decoded/Raw model, adding actions, nested arrays, import/export | Correct ABI/support relationship; menu visible only with multiple supported modes; exact import limits and generic destination composition. | Existing callers plus catalogue reciprocal link. Does not duplicate action-purpose tables. |
| [Capital Distributor](../../../treasury/capital-distributor.md#campaign-actions), capability section | Create allocation → schedule and payout decisions → pause/resume/end consequences → review support link | A19–A22 feature rules; schedule timestamps fixed during preparation; temporary versus permanent closure; clarify create-form versus details support. | Catalogue's campaign section, existing treasury/reward links. |
| [Gauge voting](../../../governance/gauge-voting.md#gauges-and-their-administration), capability section | Shared gauge lifecycle | A13–A16 gauge management rules and authority. | Catalogue gauge section and existing governance navigation. |
| [BENQI lending-market gauges](../../../governance/benqi-lending-market-gauges.md), client-specific capability | BENQI registration, removal, and presentation in shared Gauge voting | A17–A18 roles, market identity, active-voting constraint, and display limits; owner-confirmed BENQI scope. | Named BENQI catalogue subsection, Gauge voting, Aragon-deployed plugins, and governance navigation. |
| [Cross-chain execution](../../../governance/cross-chain-execution.md#building-and-reading-the-action), capability section | Route → destination batch → gas/funding → destination review | A12 route behavior; destination editor/details have narrower specialized support. | Catalogue nested-call section and existing governance navigation. |
| Action, Proposal creation, Create transaction, Transactions, Executing on a linked account | Shared callers and reviewers | Route-specific links to catalogue; no second matrix. Action distinguishes contract ownership from specialized interface support. | Existing area navigation and catalogue contextual links. |
| Assets, multisig gates, governance designer | Existing action-family contexts | Link payment, membership and rule changes to their exact catalogue sections without recreating feature definitions. | Existing feature navigation. |
| maintenance/basic-action-views.md and its parts, maintenance references | Snapshot → separate inventories → rendering/normalization → content map | Runtime types, selectors, component names, line-linked evidence, gaps and provenance. | Backlog Inventories and log close-out. No technical audit columns in product prose. |

## Publication and uncertainty dispositions

The 22 action identities include client-specific integrations. The 2026-09-13 owner clarification identifies Gauge Registrar's A17–A18 as BENQI-specific; it corrects the audience of the existing coverage without supplying a new launch ruling. Their shared action registration and Aragon deployment do not make them a general offering. Capital Distributor retains its established installed experience and client-specific authoring boundary. Cross-chain availability follows the owner's bespoke-deployment ruling.

Client registry names such as katanaEmissionsTest and gaugeDistributionsDemo remain technical evidence; no new public service or deployment claim is derived from them. The [client scope register](../client-specific-integrations.md) records BENQI and the resolved Alchemix ruling: the Alchemix account has not launched and only brief examples are authorized. Its voting widget does not add an action identity. Automated capital-flow policies remain excluded. The protocol mechanism pages remain upstream and unmodified.

The new canonical reference is draft and joins the existing finite remaining-draft review cohort. Changed feature pages retain their existing draft status. Installation mismatch and runtime-data limits stay in the audit's snapshot/completeness section, not in reader-facing source-processing narration. Established user-facing failure limits are stated where they change a decision; candidate fixes have opportunity entries. No missing protocol mechanism is restated as a new platform definition.
