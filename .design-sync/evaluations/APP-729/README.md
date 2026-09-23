# APP-729 — incremental context audit

## Decision

**Keep the existing runs as exploratory usability evidence. They do not establish whether the new context pieces improved the result. Do not run another generation yet.**

Both final prototypes demonstrated the requested member-entry states. The candidate produced a more detailed implementation handoff. Its standalone `FormWrapper` shell was a disclosed prototype choice; its handoff correctly prescribed `WizardPage` for integration. That is not a bundle regression.

The additions contain useful, source-grounded distinctions—not just an inventory. Their delivery, consultation and incremental effect are separate questions. A registry path in a readme does not prove that the registry bytes were available to the model, and a good handoff does not establish which reference produced it.

The local candidate payload now provides stronger evidence: all 702 manifest-listed files match their recorded hashes, but neither registry nor selection-guide JSON is present. The actual App wrapper declaration is a generic stub. These are delivery/export gaps to fix before measuring context value; the exact remote uploaded subset remains unverified.

This report replaces the earlier causal and first-pass wording. [Frozen protocol v1](PROTOCOL.md), [task](PROMPT.md), transcripts, generated outputs and screenshots remain historical evidence. [Protocol v2](PROTOCOL-v2.md) governs a possible future evaluation; it does not retroactively validate these runs or authorize another one.

## What APP-1220 actually needs

[APP-1220](https://linear.app/aragon/issue/APP-1220) requires a current, revision-matched bundle with useful discovery/guidance, deterministic styling parity, and an honest old/new comparison. [APP-729](https://linear.app/aragon/issue/APP-729) does **not** require a statistically significant improvement, a separate canvas, or a new exhaustive review gate.

| Obligation | Owner | Evidence and remaining boundary |
| --- | --- | --- |
| Source-grounded inventory and generated selection view | APP-726 | Evaluator-side discovery checked listed references and registry/projection hashes. This is not proof of model-side delivery or consultation. |
| Maintained usage guidance | APP-728 | Candidate project readme exposes concrete behavioral guidance. Source-guide revisions and the imported rendition need to be tied together by the refresh. |
| DTCG/source parity | APP-727 | Existing validator is the appropriate proof. This audit did not rerun it or certify the final dependency chain. |
| Deterministic primitive CSS generation | APP-735 | Existing generation test is the appropriate proof, not a Claude output. |
| Representative App/design-sync consumer parity | APP-736 | Existing two-consumer compilation/parity checks are the appropriate proof. They do not fingerprint the remote project's CSS. |
| Accepted artifact identity, refresh and reachable references | APP-1208 | The evaluated candidate was explicitly assembled from unmerged PRs. Its readme and runtime version are not an archive-to-remote identity check. |
| Demonstrated discovery/selection and honest comparison | APP-729 | Final usability observations retained. Context attribution unresolved; final accepted-bundle handoff still depends on APP-1208. |

APP-734 semantic redesign, APP-1209 Paper work, and APP-803 Base UI do not gate this audit. APP-741's delivery benchmark remains separate.

## Audit of the added pieces

Disposition means what to retain or revise, not a claim that generative benefit has been measured.

| Piece | Distinct job / actual new information | What this run establishes | Disposition |
| --- | --- | --- | --- |
| `registry.json` | Source-grounded inventory: stable IDs, props/story/test references, static App usage, provenance/fingerprints, curated intent. Not a second API implementation or named team-ownership directory. | Present in the candidate source worktree but absent from the retained local payload and its verified manifest. `discovery.json` checks a separate source snapshot, not remote consultation. | Keep as the authoritative inventory; make the promised context reachable through APP-1208, not a duplicate catalog. |
| `selection-guide.json` | Generated decision projection: alternatives, compound members/aliases, key contracts and composition. Avoids reading hundreds of inventory records for a choice. | Present in source but absent from the retained local payload; the readme names it without delivering those bytes. Model-side consultation is not established. | Keep as a generated view. Deliver the selection content as readable context with resolvable authority before testing its effect. |
| App conventions / imported readme | App versus kit responsibility, providers/forms/dialog stack, meaningful behavioral caveats, styling scope. | The captured readme contains the additions below. The prototype/handoff is consistent with some, but the transcript has only aggregate reads/searches. | Keep one maintained guide. Preserve source links; avoid copying the registry or full API. Tie the imported rendition to its source revision. |
| GovKit package guidance | Reusable component semantics, package-local source/API/story/test navigation, copy/accessibility conventions. App policy stays in the App guide. | Source audit supports that division. The run does not identify which package guidance bytes were consulted. | Keep package-local responsibility; use explicit cross-repository links for App composition rather than duplicating it. |
| Per-component `.d.ts`, prompts and examples | Exact usable contracts and examples, distinct from selection advice. | Both handoffs report implementation recovery; the retained candidate declaration independently confirms the generic stub. Converter source resolves package-owned types, not the mapped App export. | Fix the converter/source boundary through APP-1208. Do not mask it with a manual registry API catalog. |
| DTCG/generated CSS and utility notes | Preserve source values and consumed styling; state what utilities actually emit. | Candidate rendered the exercised states. Remote CSS bytes were not fingerprinted; checker output is available only as model narration. | Use APP-727/735/736's deterministic checks and APP-1208's consumed-artifact identity. Do not score styling parity as context effectiveness. |

### Verified local payload boundary

`/Users/kd-m2air/.herdr/artifacts/app-1208/candidate-bundle-identity.json` lists 702 files / 15,434,159 bytes. This audit recomputed every listed file hash and the canonical tree hash: **702 matches, zero mismatches**, tree SHA-256 `5a4b779ac2c6b73f318c238f920064fd81d052b5ae6352f75bef061b0f23c96e`. Neither the manifest nor a direct payload glob contains a registry/selection-guide file. Both JSONs exist in the candidate's source worktree.

The producer handoff says a 566-file subset was uploaded, excluding local validation artifacts. The 702-file manifest is not a receipt for that subset; no complete remote export was verified here. Therefore: absence in the retained payload is verified; absence from every possible remote/external source is not.

The actual `components/forms/AddressesInput/AddressesInput.d.ts` contains only `[key: string]: unknown` and identifies the App export as coming from GovKit. Converter `package-build.mjs:710-711` loads GovKit's shipped declarations; `lib/dts.mjs:362-388` looks only through package-owned declarations/exports; `lib/emit.mjs:379-398` emits the generic fallback. App runtime inclusion and App type extraction are different paths. The emitted file does not contain the separate `--skip-dts` marker: do not diagnose this as a deliberately skipped declaration build.

Ownership metadata is a separate, cross-cutting export problem: `components/wizards/WizardPage/WizardPage.prompt.md:1` also says “from @aragon/gov-ui-kit.” The emitter uses global package metadata for exports supplied by the App. APP-1208 should preserve source ownership in both declarations and generated prompts across App exports. `window.GovUiKit` is a runtime namespace, not evidence of package ownership.

### Concrete semantic additions worth retaining

Compared with the [old readme](access/old-project-readme.txt), the [candidate readme](access/candidate-project-readme.txt) adds or sharpens:

- **Address input channels:** editable `onChange` values differ from resolved/accepted `onAccept` values; stale accepted values are not the current editable state. ENS resolution is mainnet-based; `chainId` concerns explorer links. App `AddressesInput` owns required/duplicate/form policy.
- **Provider responsibility:** actual hooks determine dependencies; membership in a component group is not itself a provider requirement.
- **Dialog stack behavior:** `close(dialogId)` closes the intended child; unqualified `close()` has different stack semantics.
- **Action ownership:** `ActionSimulation` displays caller-supplied state and callbacks; it does not execute transactions. Button/link/loading behavior has real contract differences.
- **Compound choice:** namespace members and aliases are composition relationships, not independent alternatives.
- **Interactive nesting:** `AddressOutput.hasInteractiveAncestor` matters inside an already interactive parent.
- **Styling scope:** a token existing does not establish that a particular utility was emitted.

These are good candidates for source-backed decision checks because a plausible implementation can get them wrong. The prior member-entry prompt mostly exercised discovery of an already-obvious App wrapper, whose API and existing baseline guidance already supplied much of the answer.

One coverage regression is concrete: the candidate still names `WizardPage` at readme lines 49-53, but drops the old readme's explicit statement that the wizard supplies form context and renders chrome/footer automatically. Meanwhile its line 29 still tells consumers to wrap App form inputs in `FormWrapper`. APP-728 should restore the standalone-versus-wizard exception. This is a plausible mechanism for composition mistakes, not proof that it caused the observed shell choice; the candidate handoff itself recovered the correct integration.

Captured readme sizes: old 5,273 bytes; candidate 8,916 bytes. These are byte counts, **not** token cost or a quality score. File hashes and correction provenance are in [audit/record.json](audit/record.json).

## What the historical pair actually shows

| Observation | Old | Candidate | Interpretation |
| --- | --- | --- | --- |
| Visible runtime/version | GovKit 2.10.0 | GovKit 2.11.4, unmerged candidate | Runtime and context changed together; not a context-only comparison. |
| Visible model/effort and task | Opus 5 / Medium; retained exact message | Same visible settings and exact message | Observable prompt parity, not proof of identical hidden backend settings. |
| Final requested states | Empty, populated, invalid and duplicate demonstrated | Same | Both were usable for this task. |
| Add/remove | 1 → 2 → 1, removal floor demonstrated | Same | Core behavior reused from App components. |
| Form composition | `WizardPage.Container/Step` in prototype | Standalone `FormWrapper`; real `WizardPage` integration explained | Old closer to real-flow shell; candidate disclosed its departure correctly. |
| Handoff | Inline source/component/provider notes | Separate, more detailed source/contract/validation handoff | Output difference observed; cause unresolved. |
| ENS | Not exercised | Reverse resolution rendered `vitalik.eth` from an address fixture | Candidate-only observed behavior. Not proof that guidance caused it, or that typed-name forward resolution was tested. |
| Mobile | Embedded 390px prototype mode | Actual 390×844 capture, no horizontal overflow in retained observations | Both exercised narrow layouts, with different capture methods. |
| Human corrections in retained valid runs | 0 | 0 | Excludes the discarded old setup attempt. |
| Observed post-completion prototype correction events | 1: duplicate-feedback persistence | 0 | Not all model edits. Candidate transcript includes edits during construction; no first-pass comparison is available. |
| API discovery | Handoff reports declaration stub → implementation recovery | Same | Shared export/access problem, not an improvement attributable to selection guidance. |

Candidate `MemberCount` uses a 40-hex-character regex for its optional readiness tag (`runs/candidate/served-source.html:65-75`). The handoff labels this custom prototype code. It is not authoritative validation; no incorrect readiness transition was exercised. Preserve that risk without calling it a bundle defect.

### Comparability and evidence limits

1. **Different runtime and source bundles.** Any outcome difference can come from runtime/API/style changes as well as context.
2. **Different project setup.** Old ran in a separate project. Candidate generation ran inside the supplied design-system project when no “New design” action was found. This departed from v1's stop/isolation instructions; it is an evaluator protocol failure, not evidence of model incapacity.
3. **Remote identity not verified.** No complete old archive/converter identity was recovered. The local candidate manifest now matches all 702 listed files, but the reported 566-file upload subset has no independently verified manifest here. Candidate readme names App base `3c9bb798…` and GovKit `8d70bdf0…`; discovery inspected a different GovKit snapshot, `64b517f5…`. The candidate reports source-to-published-package equivalence as unknown.
4. **Exposure is not consultation.** Captured readme references and generated citations are evidence of exposure/claims, not receipts for registry/source reads. Aggregate “Reading ×14” / search labels cannot establish per-file consultation, reconstruction effort or cost.
5. **Initial state is unrecoverable from these records.** The old pre-correction source was not retained. Candidate construction-time edits preceded its final output. Screenshots prove terminal behavior, not first-pass quality.
6. **Only one task/pair.** No general ranking, per-piece attribution, reliable tool-effort comparison, or cost/latency claim follows.
7. **Candidate continuation gate bypassed.** v1 required validating APP-1208's actual artifact and manifest before the candidate run. The evaluator proceeded using the designated remote project without doing that validation. Later local-manifest verification does not retroactively satisfy the gate. v2 is prospective, not a claim that the historical deviation was authorized or compliant.

The retained project screenshot shows “Published” beside an apparently unchecked checkbox, below a prompt to publish the design system. It is a control label, not sufficient evidence of a published state. The defensible observation is that no New design action was found in the attempted workflow; it does not prove that an isolated run was impossible.

## Sibling proposals and questions

These are proposals within existing responsibilities. No sibling acceptance criteria, status or implementation was changed by this audit.

### APP-1208 — fix the delivery boundary before another paid run

- Deliver the registry/selection view as readable context, with resolvable authoritative source/API/examples. They exist in source but are missing from the retained payload. Merely naming their source-worktree paths in the imported readme does not satisfy the promised delivery. They need not become JavaScript runtime exports.
- Record the accepted source/package/converter and emitted-artifact identities together. Explain which snapshots `64b517f5…` and `8d70bdf0…` describe; do not assume they match. Preserve a hashable export and identify which remote project received it.
- Fix App type extraction for mapped/extra-entry exports. The retained `AddressesInput.d.ts` confirms the package-only resolver's fallback, not a missing runtime component. Check sibling App exports through the same path rather than patching just one generated file. Use the source/exporter's existing seams; avoid a second manually maintained API catalog.
- Retain the raw CSS checker report and the CSS it examined before choosing a fix. The model reported 32 runtime-variable and 30 motion/easing findings; its explanation is not independent validation. Classify expected implementation variables or fix classification upstream if confirmed. No blanket zero-warning gate.

### APP-726 / APP-728 — keep the split, narrow duplication

- APP-726 owns inventory and the generated decision projection; APP-728 owns behavioral/composition guidance. APP-1208 owns making them reachable in the consumed bundle.
- Use one small source-backed decision to demonstrate why the selection projection helps: e.g. editable versus accepted address state, a compound alias, or simulation display versus execution. This is not a quota of new examples or model runs.
- Keep provider/form distinctions precise and cross-link authority. Do not infer named team ownership from package/domain labels or turn the guide into a second registry.
- Question for the owners: **which concrete decision would a consumer get wrong or spend materially longer resolving without the added selection/guidance?** Cite the source answer first. If APIs already make the answer obvious, retain the material for navigation/maintenance without claiming a measured generation gain.

### APP-727 / APP-735 / APP-736 — reuse deterministic proof

- APP-727: validate the final override source after APP-736's split to `layoutRoot.overrides.css`; retain the final source/package parity identity.
- APP-735: regenerate and run its existing committed-output/repeatability test on the final APP-727 chain. The reviewed APP-736 notes say its APP-735 base did not yet include APP-727's final validator commit.
- APP-736: rerun existing representative two-consumer parity on that final chain, then let APP-1208 fingerprint what the converter actually consumes. Branch-reported equal CSS and an App smoke are not remote-artifact identity.
- None needs another Claude Design run. Do not expand into semantic token redesign or exhaustive utility coverage.

## Smallest justified next step

**First: artifact inspection, not generation.** Establish which context files and usable APIs the next consumer can actually read, and bind them to the accepted refresh. Reuse the existing deterministic checks for registry consistency, token generation and consumer parity. This audit did not execute sibling branch tests.

Only then decide whether any remaining product decision warrants measuring incremental context value. If it does, use [protocol v2](PROTOCOL-v2.md):

- One narrow task selected from a real unresolved decision, with a source-backed answer kept out of the task prompt.
- Same verified runtime, APIs/examples, tools, model settings and isolated session setup in both arms. Vary only the named context piece/group.
- Prefer a short implementation decision/handoff over a full rendered prototype unless runtime/layout behavior is the uncertainty.
- Distinguish exposed, consulted and correctly applied references. Compare observable errors/reconstruction/interventions, not prose length or invented tool-cost counts.
- A combined-context pair can evaluate the combined intervention, not each file. One pair is directional, not statistical proof.
- If both arms solve it cleanly, record no demonstrated incremental advantage on that task. Do not keep making the task harder until the candidate wins.

A same-runtime ablation is **not** the historical old bundle and does not replace APP-729's honest historical record. No new generation is authorized by this document.

## Evidence and corrections

- [baseline.json](baseline.json): coordination, identity claims and run locations.
- [comparison.json](comparison.json): detailed retained observations and limitations.
- [discovery.json](discovery.json): scoped evaluator-side source checks, not a bundle substitute.
- [Old run](runs/old/) and [candidate run](runs/candidate/): unchanged transcripts, served source, handoffs, state observations and screenshots.
- [audit/record.json](audit/record.json): audit evidence, checksums and correction log.
- [audit/prior-records/](audit/prior-records/): snapshots of the six evaluator records immediately before this overhaul. They are **not** guaranteed original captures.

Corrections preserve the old setup capture's real session URL and mark its unrecoverable title null; the valid-session URL is only a later pointer. The evaluator model is restored from session context and kept separate from Claude's visible model. Automatic correction counts now share an explicit post-completion definition. Unsupported causal/first-pass claims are withdrawn rather than replaced with another presumed improvement.
