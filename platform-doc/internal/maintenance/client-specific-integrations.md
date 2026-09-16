---
type: reference
title: Client-specific integrations
tags: [maintenance, governance, clients]
source: product-owner Alchemix ruling (2026-09-11, see log.md) + product-owner BENQI scope clarification and request for a reusable handling convention (2026-09-13, see log.md) + product-owner supplied Morpho Guardians V2 case study (2026-09-14, see log.md) + product-owner catalogue grouping, voice, advisory, and custom-work scope corrections (2026-09-15, see log.md)
---

# Client-specific integrations

This register records owner-established client scope and the documentation homes that must preserve it. [WORKFLOW.md](../../WORKFLOW.md#client-specific-integrations) defines the handling rule. Audience, rollout, deployment method, and documentation review state are separate decisions; shared app code and Aragon deployment do not broaden the supported audience.

| Client and integration | Supported audience and source surfaces | Rollout and coverage boundary | Documentation homes |
| --- | --- | --- | --- |
| Morpho — Guardians V2 | Morpho Vaults V2 depositors; the named example in the mechanism guide. | Owner-supplied [published case study](https://blog.aragon.org/guardians-v2-strengthening-governance-in-morpho-vaults-v2/), used to explain fit. No general self-service vault integration or deployment instructions are implied. | [When Lock to Vote makes sense](../../guides/choose-token-voting-power-mechanism.md#when-lock-to-vote-makes-sense). |
| BENQI — lending-market gauges | BENQI-specific Gauge Registrar integration: register/unregister actions identified by qiToken, Supply/Borrow incentive, and reward controller; their presentation through shared Gauge voting. The general Gauge Voter capability retains its existing scope. | The 2026-09-13 ruling corrects the audience of existing capability coverage. It supplies no new rollout ruling and does not inherit Alchemix's not-launched state. Retain the existing behavior under BENQI scope; do not offer this integration generally. | [BENQI lending-market gauges](../../governance/benqi-lending-market-gauges.md); [BENQI action catalogue subsection](../../application/basic-action-views.md#benqi-lending-market-actions); named links from [Gauge voting](../../governance/gauge-voting.md#gauges-and-their-administration) and governance navigation. |
| Alchemix — delegation override and objection | Currently exclusive to Alchemix; custom voting plugins and account-specific controls using DAO slots. Delegation override lets a token holder override their delegate’s vote. The second-stage objection plugin lets a participant change Yes to No, or cast No if they have not voted. This does not establish a shared implementation mechanism with BENQI. | The governance account has not launched. The owner permits only brief examples; [Product scope exclusions](./product-scope-exclusions.md) remains authoritative for the launch boundary and permitted depth. Launch and expansion to other clients require separate rulings. | Brief example in [DAO slots](../design/dao-slots.md). The owner removed the detailed example from the deployment catalogue on 2026-09-15; its behavior is retained in this register. No standalone capability or guide expansion under the current ruling. |

Add a row when a client scope ruling is established, naming the client, integration, affected source surfaces, exact product homes, and any publication exception. A new source finding about the same integration updates its existing row. Unanswered material questions belong in tasks; this register is not a second backlog or an exhaustive census of client configuration code.

Dedicated client pages are queryable with `wiki --root . list --where scope=client-specific` and `wiki --root . list --where client=benqi`. Those queries do not include brief sections embedded in shared pages; the table records them. Product readers and assistants must retain the named-client qualifier when using either form of coverage.
