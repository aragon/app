---
type: concept
title: Stage
tags: [governance, semantics]
status: draft
source: verbal product-owner briefing on governance flows (2026-07-16, see log.md) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + SPP and app source verification (2026-08-03, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md)
---

# Stage

One step of a multi-stage [governance process](./process.md). A process built on the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) has **one or more stages**, and every stage has **zero or more [bodies](./body.md)**. The plugin exposes lower-level parameters ([stages and bodies](../protocol-doc/plugins/spp-plugin/stages-and-bodies.md)); this page holds the app's **semantic layer** on top — the abstractions a user configures per stage in the [governance designer](./governance-designer.md)'s advanced flow. How a proposal then traverses the stages is [staged proposals](./staged-proposals.md).

## The stage abstractions

- **Stage duration** — the period the stage gives its bodies to decide. When any body can veto, the full duration is a protected objection window: the stage cannot advance before it ends.
- **Expiration period** (optional) — extra time after the stage duration in which the proposal may still advance. The app encodes one deadline from the stage's start; passing it expires the proposal permanently, whether or not its thresholds were ever met.
- **Early advance** (approval-only) — with at least one body and no vetoing bodies, allows the stage to advance as soon as its approval threshold is met instead of waiting out the stage duration. A vetoing or bodyless stage always waits for the full duration.
- **A role per body: approval or veto** — the role belongs to each body, not to the stage as a whole. One stage may mix approving and vetoing bodies, such as token holders approving while a security council can veto; a veto-only stage is the staged expression of [optimistic governance](./optimistic-governance.md).
- **Independent body thresholds** — the approval and veto thresholds count bodies of the corresponding role, one unit per body rather than the members, tokens, or votes inside it. Reaching the veto threshold blocks the proposal regardless of approvals.
- **A bodyless stage is a timelock** — with nobody to decide, the stage is a pure delay that becomes advanceable after its duration.
- **A body need not be a plugin** — a [Safe](../accounts/safe.md) can be a [stage's governing body](./safe-as-a-body.md). Bodies installed by the flow report automatically; an external address is a manual body whose external process reports its result. Multisig-governed stages gating what comes before or after them are the worked pattern: [multisig gates](./multisig-gates.md).

## SPP field disposition

The app's semantic layer does not mirror the lower-level structs one for one: some values are user-facing concepts, some are derived from those concepts, and some are fixed implementation choices. Against the pinned SPP parameter surface, every field is dispositioned as follows:

| SPP field | Disposition in the app semantic layer |
|---|---|
| `Stage.bodies` | **Covered** — a stage contains zero or more bodies; zero bodies produces the timelock shape. |
| `Stage.maxAdvance` | **Derived** — stage duration plus the optional expiration period; without an expiration the app uses a large default deadline. |
| `Stage.minAdvance` | **Derived** — zero only when early advance is enabled for a nonempty approval-only stage; otherwise it equals the stage duration. |
| `Stage.voteDuration` | **Covered** — stage duration. It is the automatic bodies' voting length and, when any body can veto, the protected veto window. |
| `Stage.approvalThreshold` | **Covered** — the number of approving bodies required for the stage to pass. |
| `Stage.vetoThreshold` | **Covered** — the number of vetoing bodies required to block the stage; a veto threshold, once met, overrides approvals. |
| `Stage.cancelable` | **Fixed, not surfaced** — the app encodes `false`; app-created stages do not enable SPP proposal cancellation. |
| `Stage.editable` | **Fixed, not surfaced** — the app encodes `false`; app-created stages do not enable SPP action editing. |
| `Body.addr` | **Covered** — selecting or adding the body supplies its address, including the designer's unvalidated any-address route. |
| `Body.isManual` | **Derived** — external-address bodies are manual; bodies installed by the flow are automatic. |
| `Body.tryAdvance` | **Fixed, not surfaced** — the app encodes `true`; the report requests a same-transaction advance, which SPP still treats as best-effort and subject to state and permission checks. |
| `Body.resultType` | **Covered** — each body's approval or veto role; both roles may appear in the same stage. |

For configurations whose conditions or sub-plugin interactions exceed this stage model, see [when a staged process reaches an edge case](./staged-proposals.md#when-the-model-reaches-an-edge-case).
