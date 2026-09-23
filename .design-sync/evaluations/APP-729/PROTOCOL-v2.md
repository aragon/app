# APP-729 evaluation protocol v2

Status: evaluation redesign; no new model run authorized or executed. This does not amend or rescore the historical runs as if they followed v2. `PROTOCOL.md`, `PROMPT.md`, retained transcripts, generated sources and screenshots remain v1 evidence.

## Decisions this evaluation serves

1. Is the delivered bundle usable, revision-identifiable and sufficiently complete for the chosen workflow? This is APP-1220/1208 acceptance, not a claim of improvement.
2. Do added context pieces help an implementer make a consequential decision or find its authoritative basis? This is the incremental-context question in APP-729.
3. Which additions should remain, change, or be removed? Provenance and deterministic styling have correctness value independent of model-output improvement.

A good prototype is not evidence for all three. No component-count, file-count, citation-count or visual-polish score substitutes for these decisions. APP-1212 full-feature acceptance and APP-741 delivery benchmarking stay separate.

## First: inspect materials without generation

For each added piece, record:

- Its actual bytes/revision and how the model can reach it from the supplied project's entry point.
- Its job: routing, disambiguation, authoritative API/example access, composition constraints, identity, or styling correctness.
- The unique information it adds compared with existing references. Cross-links can have value without adding new facts.
- Whether it is derived, manually maintained, or generated prose; identify the maintained authority and refresh relationship.
- Whether a reference resolves in the model's tool environment, not merely on the evaluator's filesystem.
- The current run evidence: exposed, consulted, applied, contradicted, or unknown. A final citation or a filename in a readme alone does not prove a tool read.
- The smallest failure it should prevent and the observation that would disprove the claimed benefit.

Disposition may be keep for correctness, keep provisionally, repair reachability/coverage, simplify redundant prose, or remove. No blanket requirement to prove every provenance field through a generative A/B.

Check path resolution, declaration coverage, source hashes, projection-to-registry agreement and generated CSS with deterministic inspection first. Reuse existing owner checks. Do not add an exhaustive catalog gate, duplicate sibling suites, or spend a Claude Design round proving an obvious missing file.

## Integrity and accepted-code gate

The historical remote old/new runs are exploratory usability observations. Their runtime versions and session conditions differed. They are not a causal estimate of the added context's value.

Before another run:

- Retain the supplied artifact bytes and manifest; verify archive and payload hashes, consumed package identity, converter identity, registry/projection provenance, guidance and styling inputs. Distinguish producer-asserted identity from locally verified identity and remote-import agreement.
- Do not equate source checkout, installed package, generated archive, imported project and production deployment. Verify each relevant link separately; leave missing ones unknown.
- Use a fresh authorized disposable design for each arm, with the intended design-system context visibly attached. If the platform cannot provide this, stop. Do not use a shared design-system project's chat as a workaround.
- Freeze the exact combined submitted message, not just the task substring. Retain composer/submitted-text evidence; normalize only with an explicit record of what changed. Equal stored hashes alone do not prove equal server-received bytes.
- Match exposed model/effort, editable instructions, tools, source access, network policy and output requirements. Record hidden settings as unknown.
- Record unavoidable automatic checking/fix behavior in both arms. If initial source cannot be captured, evaluate terminal output and observed corrections; do not claim first-pass quality.
- Accepted-code closure remains subject to existing APP-729/1220 criteria. A provisional candidate observation does not close either ticket.

## When a paid comparison is justified

Write a short decision card before choosing a task:

1. The unresolved decision: what would we keep, change or remove depending on the result?
2. The suspected mechanism and the exact context addition expected to help.
3. A representative user need already supported by maintained source. Avoid an artificial puzzle constructed to reward new wording.
4. An evaluator-only answer key from revision-matched source: valid alternatives, required contract facts, relevant failure and reference availability.
5. Why static inspection or existing evidence cannot settle it.
6. Smallest output that exposes the decision: usually a component/contract choice with citations and minimal composition, not a rendered application.
7. The stop rule and interpretation for both correct, candidate-only correct, old-only correct, both wrong, or incomparable runs.
8. Which question this run answers, declared before it runs: **no-regression** or **delta**. The candidate context is a superset of the old — it adds material and removes none — so a task the old arm already satisfies cannot separate them. Both arms passing is then the expected and correct result, and it is evidence of no regression, not an absence of value. A delta run instead requires a need whose correct answer depends on material only the candidate carries (registry usage/ownership evidence, App-owned compound contracts, source references), with the old arm expected to fail or answer less precisely. Naming the expectation up front is what keeps a delta probe from being a puzzle built to reward new wording: the answer key still comes from revision-matched source, and a delta task that the old arm passes is a real null result to record, not a task to replace.

Do not put component names, source paths, the new guide's name, the expected contract, or baseline output into the user task unless that information is naturally part of the real user request. Both arms get the same instruction to ground their answer. Keep the answer key separate.

## Isolating context from runtime

Preferred experiment: two disposable copies of the same verified runtime artifact. Keep components, exports, JS/CSS/fonts, provider shims, preview behavior and authoritative source/API access identical. Change only a declared set of context additions and the entry-point links that expose them; retain a file/hash diff proving the allowed delta.

Do not obtain a control by deleting API files needed for the task. If the proposed treatment itself adds missing authoritative API/source material, that is a separate access/coverage intervention: label it accordingly rather than calling it selection-guidance value. Repair both arms first when the purpose is only to test routing prose.

A context-only control is a synthetic ablation, not the historical old bundle. Keep its result separate from the historical v1 comparison. An aggregate context treatment cannot attribute an effect to each included file. Narrow the treatment when the keep/remove decision concerns one piece; do not run a factorial benchmark by default.

If the exporter/platform cannot supply equivalent arms without changing runtime or history, document the limit. A descriptive workflow check is still possible, but no causal improvement claim follows.

## Observation and stopping

Default to one paired narrow attempt, only after explicit authorization to execute. No three-task quota. Randomize which arm starts first where practical and record it; do not send one arm's output to the other. One pair yields a directional case observation, not a reliable effect estimate.

Record:

- Chosen component/composition and supported alternatives.
- Correctness of required props, provider boundaries, state ownership and side effects.
- Authoritative references actually followed, with reachable revision-matched targets.
- Compiled-source reconstruction, broken paths and unresolved declarations encountered.
- Unsupported contracts or invented policy, human interventions and automatic correction events.
- Observed discovery effort only where the transcript exposes it. Do not estimate tool calls, latency, cost or token savings from collapsed tool labels or handoff length.

Use the existing observation labels with direct evidence. Keep task outcome, defect ownership and causal attribution separate.

| Result | Decision |
| --- | --- |
| Both correct with comparable observed discovery | No demonstrated advantage for this task; keep correctness-critical material, consider simplifying redundant context. Do not seek a harder task merely to manufacture a win. |
| Candidate reaches a correct decision or avoids a documented dead end | Evidence consistent with the declared mechanism; useful case evidence, not proof of a general effect or per-file credit. |
| Old correct, candidate wrong | Inspect conflict, distraction or accidental arm differences before blaming content. Retain the failure. |
| Both wrong | Check missing authority/access and task feasibility before adding instructions or rerunning. |
| Arms differ outside the allowed context delta | Incomparable for causality; preserve outputs and repair setup before any separately authorized rerun. |

Repeat only if an unresolved high-impact decision warrants it. Full rendering is reserved for a question that genuinely depends on layout/runtime; reuse deterministic source and consumer checks for token/style correctness.

## Retention and reporting

Preserve original captures. Corrections to evaluator metadata get a dated note and a snapshot of the superseded record; do not rewrite a historical timestamp to describe a later session. Record unknown originals as unknown rather than reconstructing them from memory.

A report separates:

- Verified artifact facts and deterministic check results.
- Observed run behavior.
- Producer/model assertions not independently verified.
- Inferences and hypotheses.
- Sibling-owner proposals, which do not silently amend their acceptance criteria.

The report ends with the decision and remaining prerequisites, not a blanket pass/fail for the bundle. No publishing, shared-project changes, accepted/deployed claims or repeated generation is implied by preparing this protocol.
