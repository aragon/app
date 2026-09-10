---
type: concept
title: Body
tags: [governance, semantics]
status: draft
source: aragon-knowledge-base/product/concepts/process-vs-body.md (product-owner Q&A, 2026-07-06) + product-owner briefing (2026-07-28, multisig gates) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefings (2026-08-04, see log.md)
---

# Body

A **body** describes who supplies preferences to a governance decision: a group of people, token holders, or a single address. A governor representing the body records those inputs and applies its voting or approval method. When the body is configured as a stage in a wider [governance process](./process.md), that result alone does not complete the process or act on the DAO; any ability to create or execute comes from the actual function grant and call route.

Bodies are how the product talks about *who decides*, separately from *how the decision reaches the DAO*:

- A multisig or [token voting plugin](../protocol-doc/plugins/token-voting-plugin.md) whose result feeds a stage of a [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) represents a body and is its governor: its output goes to the pipeline, not to the DAO.
- Whether a given [plugin](./plugin.md) is *also* a [process](./process.md) depends on what its approved actions accomplish ([target](./target.md)); [process](./process.md) holds the worked contrast.
- A body need not be a plugin at all — a [Safe](../accounts/safe.md) can serve as a [stage's governing body](./safe-as-a-body.md), standing in as an external account rather than a plugin installed on the DAO. The Safe remains an account and governor globally; **body** describes what it contributes to this process. Whether it or its members may create or execute the process's proposal is a separate authorization configuration ([proposal creation](./proposal-creation.md)).

Like a process, a body is an app-built abstraction over the [plugin substrate](./plugin.md#the-product-abstractions-sit-on-top), not a separate protocol fact.

## Why the distinction matters

Advanced governance composes **multiple bodies into one process** (e.g. a council stage followed by a token-holder stage; per-stage composition and thresholds are on [stage](./stage.md)). UI, permissions, and analytics must attribute decisions to bodies while attributing execution and proposal lifecycle to the process — collapsing the two breaks as soon as a setup is more than a single plugin.

The partition is visible in the app's two member-facing lists: the [proposals](./proposal.md) list is partitioned by **process**, while the **members list** is partitioned by **body** — members belong to a governing body, and that body is one of the bodies installed on the DAO (a plugin — a Safe serving as a stage's body is deliberately *not* shown on the members list; see [Safe as a body](./safe-as-a-body.md)). For a token-based body, the [token panel](./token-panel.md) places its available wrap, voting-escrow lock, and delegation controls in the Members-page aside; [veLocker](./velocker.md) owns the voting-escrow-specific position and dynamic-delegation semantics. Bodies (and processes) belonging to a [linked account](../accounts/linked-account.md) are folded into these same lists, flat, with an indicator marking that they belong to a linked account.

If one plugin is both a process and a body, these partitions do not create two identities: its single [plugin metadata](../design/metadata-input.md#plugin-metadata-follows-the-plugin) record can be presented in both places.

## Reusing a plugin body

One installed plugin can serve as a body in more than one governance process. That reuses the **same body and the same governance settings** in every process it serves. Minimum-duration interactions can make this shape especially risky, so configurations that share a body across processes follow the [reach-out-to-the-team pattern](../design/reach-out-to-the-team.md) rather than being treated as an ordinary self-serve setup.

The product has no separate object for a body's underlying **census**. Two plugin instances may represent the same people or token holders while using different governance parameters in different processes; those are still two bodies. This is a different choice from reusing one plugin instance: separate instances allow different settings, while reuse keeps one shared configuration. When this produces duplicate-looking member lists, [App CMS](../app-cms.md#five-established-uses) can hide one plugin from the datalist presentation without changing either body or its configuration.
