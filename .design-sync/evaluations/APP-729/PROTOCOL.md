# APP-729 evaluation protocol v1

Frozen before any old- or candidate-bundle task generation. File hashes and freeze time are in `baseline.json`. Future amendments get a new protocol version and an explanation; retain this version and any runs made with it. No candidate-run result has been examined.

## Task grounding

The selected use case is multisig membership setup, not a hypothetical new product. At App revision `3c9bb798f3679fb2eb8052a192847ab2274ed1d5`:

- `apps/app/src/plugins/multisigPlugin/components/multisigSetupMembership/multisigSetupMembership.tsx:25-45` uses `ManageMembershipAddressList`.
- `apps/app/src/shared/components/forms/manageMembershipAddressList/manageMembershipAddressList.tsx:84-111` composes the App's `AddressesInput.Container` and membership rows.
- `apps/app/src/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx:53-135` separates raw input from accepted addresses and prevents removal of the final row.
- `apps/app/src/shared/utils/addressesListUtils/addressesListUtils.ts:15-35` owns invalid/duplicate/custom validation.
- `.design-sync/previews/AddressesInput.tsx` supplies Empty (`Default`), `Filled`, and `ChecksumError` examples; `.design-sync/app-entry.ts:63-69,85-104` exposes `AddressesInput` and a bundle-local `FormWrapper`.

These establish that the task is supported. They do **not** establish what is present in the preserved old artifact. The old bundle is not yet available. Judge each run's API usage against the artifact and matching source actually supplied, not automatically against the newer 2.11.4 source. A capability gap and a model contract mistake are separate findings.

## Fixed run instructions

Create a fresh Claude Design conversation/project with only the preserved bundle selected as its design-system context. Use this instruction text for both runs:

> Use the supplied design-system bundle as the primary design context. Read its guidance and linked source/API/examples when available. Treat missing access or revision identity as unknown. Do not edit the design-system project, install or refresh a bundle, publish changes, or use another evaluation conversation. Report unavailable capabilities explicitly.

Then submit the exact task text in `PROMPT.md`, unchanged. No evaluator-selected component names, corrections, or registry extracts are added to the old run. The discovery investigation is separate evaluator evidence, not a replacement bundle or extra baseline guidance.

## Before generation

1. Obtain APP-1208's preserved old artifact and preservation acknowledgment. Copy it read-only into evaluator-owned retention, retaining the original archive bytes. Compute SHA-256 and record the file inventory/hashes, supplied manifest, and original handoff location. Do not refresh or reconstruct it.
2. Record known App/kit, converter, registry, selection-guide, guidance, and styling identities with the evidence supporting each. Missing fields stay `null`/unknown. An old kit version mentioned in notes does not prove artifact identity. A remote project ID does not prove its contents match the archive.
3. Use an authorized disposable evaluation project or have an authorized operator perform the run. Do not overwrite either existing design-system project. Record project/session URL, bundle import/selection receipt, and evidence of the selected bundle's identity. If the surface cannot select the preserved bytes without replacing a shared project, stop for authorization.
4. Record the visible model name and any exposed model/version ID **before submitting**. Choose a model available for both runs; lock the exact choice after the old run. Do not identify the Claude Design model as the OMP evaluator's model. If backend ID, system instructions, temperature, or seed are hidden, record them as unknown/not exposed.
5. Record date/time, account/workspace access level without credentials, all editable project instructions, enabled connectors/tools and permissions, available source/API paths and revisions, network access, browser/viewport, and actual bundle supplied. Keep the same selectable model, instructions, tools, permissions, and viewport for the candidate. Any unavoidable difference limits comparability.
6. Source access is limited to the supplied bundle and references it exposes. Do not supply the APP-726 PR inspection as a sidecar to the old bundle. Freeze any external resources the run actually uses, with retrieved bytes/hash/revision and timestamp. Unversioned Storybook and live ENS are possible confounders, not proof of revision agreement.

## Observation and retention

Capture the initial response and prototype before corrections: full conversation/tool transcript where exportable, source/code export, screenshots at desktop 1440×900 and mobile 390×844 where supported, selected project/session links, and any runtime errors. Record actual viewport differences. Hash retained outputs. A summary written by the evaluator is not the model's actual output.

Keep an intervention log with sequence/time, actor, exact message/action, reason, and affected output. Setup actions and access failures are distinct from in-run human corrections. Preserve every initial output even if a correction succeeds. A requested clarification receives only a task-scope answer; record its exact wording, and do not provide component choices or a solution. Any assisted continuation is a separate attempt after the initial result has been saved.

Stop after the first complete response/prototype or a terminal failure. Do not silently retry a failure. Capture initial and corrected attempts separately. There is no success quota and no requirement that the candidate improves.

## Fixed evaluation criteria

Use `observed`, `problem observed`, `not observed`, or `not applicable`, with a direct output/transcript/source reference and explanation. These are observation labels, not numeric scores. Report distinct mistakes and corrections as an enumerated evidence list, not estimated counts. If no run occurred, every outcome is **not observed**, not zero defects.

| Criterion | Evidence to inspect | What would constitute a problem |
| --- | --- | --- |
| Component selection and reuse | Named components/imports in output, supplied exports, reasons for choosing them, App composition references | Invented exports; duplicating an available suitable widget without a task-driven reason; confusing an App wrapper with a public kit export |
| Source and props discovery | References actually followed; file/revision and API evidence available to the model | Fabricated references; unsupported props/callback shapes; treating generated selection prose as the entire API |
| Examples and meaningful states | Consulted story/preview examples; rendered initial/populated/error states and interaction record | Claiming static sample data proves live behavior; omitting a requested state without explanation; claiming inaccessible examples were verified |
| Composition and contracts | Component tree, providers/form initialization, input and accepted-value handling, add/remove transitions | Missing required context; foreign form-provider instance against a bundle-local form; treating edited text as a resolved address; rendering a namespace as a component; corrupting rows when removing one |
| Validation responsibilities | Invalid and duplicate entries, final-row removal behavior, responsibility assigned to kit versus App | Reimplementing checksum/ENS logic unnecessarily; accepting duplicates without feedback; inventing live membership validation outside scope; claiming a newer API exists in the old bundle |
| Unnecessary reimplementation | Custom code compared with usable components actually available in that bundle | Custom address input, button, list/form machinery or styling that replaces an existing suitable contract without justification. Necessary glue and explicit bundle gaps are not automatically mistakes |
| Human corrections | Unedited initial result and chronological intervention log | Requiring corrections; count/list observed corrections separately from defects. Never infer zero corrections from a missing transcript |
| Design context and handoff | Reachable selected design/source context, desktop/mobile evidence, accessible labels/actions, documented deviations | Unsupported claims of visual approval or canvas access; broken layout/controls; losing source/API references. A separate canvas is not required for this task |

Do not penalize the old run merely for lacking the new registry. Measure whether it can solve the same discovery/composition task with the context it actually has. Do not award the candidate points merely for containing new files.

## Candidate continuation gate (not run in this pass)

Wait for APP-1208's actual artifact and identity. Do not assemble upstream PRs or generate a substitute. Validate the supplied App revision/dirty-input record, consumed kit version and hashes, converter identity, registry source/kit provenance, selection-guide-to-registry SHA-256, guidance identity, and APP-727/735/736 styling identities against the candidate manifest and bytes. Record unknowns and disagreements; do not repair them in APP-729.

Label it **candidate from unmerged PRs**, not accepted/deployed code. Start a fresh Claude Design session with the same prompt and editable instructions; never carry over baseline output, corrections, evaluator notes, or solved code. Record any changed model/tools/access as a limitation. Preserve a failing artifact and route its defect to APP-1208 (integration/provenance/exporter), APP-726 (registry/projection), APP-728 (guidance), or the relevant styling owner (APP-727/735/736). A corrected artifact needs a new identity and a separately recorded rerun.

After reviews land, repeat identity validation and affected task/discovery checks against accepted code. Recheck changed props, exports, paths, examples, providers, guidance, and emitted styling. Verify the selected remote project corresponds to that artifact separately from local accepted-code identity and production deployment. Neither this preparation nor a successful unmerged-candidate run completes APP-729 or APP-1220; APP-1212 remains separate.
