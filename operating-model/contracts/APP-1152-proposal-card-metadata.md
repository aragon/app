# APP-1152: Proposal card metadata

## Intent and scope

- Issue: https://linear.app/aragon/issue/APP-1152/fix-missing-metadata-warnings-and-duplicate-proposal-titles
- Task: low-risk UI bug fix, authorized by the user's implementation request.
- Use the sister `agent-framework` repository's operating loop. Keep the implementation minimal, reuse existing patterns, and add no tests.
- Worktree: `C:/dev/app/.tempor/APP-1152`; branch: `agent/app-1152-proposal-metadata`.
- Base: fresh `main` at `ad72589616c94e45a91cc3f97c7c9a3cc736c38c`, as requested. Local `develop` is an ancestor and is the framework's integration target.
- Authority: scoped edits, local commits, local develop integration, and task cleanup. No push, PR publication, protected-branch merge, or deployment.

## Acceptance criteria

- [x] Staged proposal cards show the existing missing/non-standard metadata warning in process lists and All proposals.
- [x] Standard and staged cards display the identifier only once when the title is empty, both with a description and without one.
- [x] Named proposals retain their title and identifier; title fallback remains based only on the title.
- [x] Preserve proposal links, summaries, status, stage context, publisher information, and details-page behavior.

## Technical interpretation

`DaoProposalListDefaultItem` already renders `AlertInline` using `proposalUtils.getMetadataStatus` and the metadata-alert translations. `SppProposalListItem`, shared by the process and All proposals lists through the proposal-item slot, lacks that warning. Both cards pass a slug as their identifier and use `getDisplayTitle`, which falls back to that same slug.

Implement one small slice: reuse the existing warning block in the staged card and omit the secondary identifier on either card when the title is empty. Retain `getDisplayTitle` so untitled proposals remain identifiable. Keep metadata classification unchanged: an existing description still counts as resolved metadata.

Architecture impact is local and reversible: two existing presentation components, with no new abstraction or changes to API, storage, permissions, dependencies, or module boundaries. No architecture decision, ADR, or additional human approval is required. Include one app patch changeset. No unrelated refactoring or test changes.

## Proof decisions

| Behavior/risk | Evidence | Timing |
| --- | --- | --- |
| Existing behavior and task isolation | Clean worktree, source inspection, `git diff --check` | Before implementation: passed |
| Standard and staged card rendering | Existing `daoProposalListDefaultItem`, `sppProposalListItem`, and `proposalUtils` suites | After implementation |
| Empty title with/without description; missing/non-standard metadata; named proposals | Review the input cases against the existing title/status helpers and both card props | After implementation |
| Both list entry points | Inspect the shared proposal-item slot registration and list callers | Before/after implementation |
| Type compatibility and formatting | App type-check through root Turbo; focused Biome check; changeset validation; diff review | After implementation |

No new tests or temporary test files: explicit user constraint, narrow presentation change, existing component/helper coverage, and input-case review. Proof-first-cycle is not required. No browser or live QA claim is made without actually running it.

## Evidence and completion

- Implemented in the two existing card components. No new abstraction, helper, translation, or test changes.
- Existing suites: `pnpm --filter @aragon/app exec jest --runInBand --runTestsByPath src/modules/governance/components/daoProposalList/daoProposalListDefaultItem.test.tsx src/plugins/sppPlugin/components/sppProposalListItem/sppProposalListItem.test.tsx src/modules/governance/utils/proposalUtils/proposalUtils.test.ts` — 3 suites, 22 tests passed.
- `pnpm type-check --filter=@aragon/app` — passed, including the prerequisite assistant-contracts build through Turbo.
- `pnpm exec biome check apps/app/src/modules/governance/components/daoProposalList/daoProposalListDefaultItem.tsx apps/app/src/plugins/sppPlugin/components/sppProposalListItem/sppProposalListItem.tsx` — passed without fixes.
- `pnpm validate:changesets` and `git diff --check` — passed. Verification runtime: Node 24.14.0, pnpm 11.24.0; the repo declares Node >=24.16.0.
- Dependency setup uses the lockfile in the task worktree; the primary checkout contains an old tooltip-preview dependency and is not used for verification.
- Source review confirms process and group tabs both use `DaoProposalListDefault`, which selects the registered `SppProposalListItem` for staged proposals.
- Review: no blockers or required follow-ups; changes remain limited to presentation plus the app patch changeset and this required contract. Local integration follows `finish-local-work` after committing this evidence.
- Risks: visual placement follows the existing UI-kit composition; runtime/browser QA remains separate from source review and existing tests.
- Open questions: none.

### Input-case review

| Input | Both cards | Staged warning |
| --- | --- | --- |
| Nonempty title | Title and secondary identifier retained | None for resolved metadata |
| Empty title, nonempty description | Slug used as title; secondary identifier omitted | None, matching existing metadata classification |
| Empty title and description, missing or unresolved IPFS metadata | Slug used as title; secondary identifier omitted | Existing missing-metadata message |
| Empty title and description, non-standard metadata string | Slug used as title; secondary identifier omitted | Existing non-standard-metadata message |
| Empty title and absent slug | No duplicated identifier; existing empty-title fallback retained | Determined by the existing metadata helper |

### Learning review

The context-bearing agent reviewed the issue, contract, live task context, diff, and local verification. No PR body was requested or prepared, so the PR trace auditor does not apply to this local handoff. No prior learning artifact is superseded.

| Signal | Impact | Causal analysis | Disposition |
| --- | --- | --- | --- |
| Existing checkout used a tooltip-preview UI kit | Sharing its dependencies would reduce confidence in verification | Ignored runtime dependencies survive a Git cleanup; the fresh worktree's offline lockfile install isolated this task and completed in about four minutes | No durable rule change: existing isolation policy covers this; dependencies and lockfile unchanged |
| Git/Corepack operations required sandbox escalation | Initial commands could not access Git metadata or the package-manager cache | Environment permissions, resolved through scoped tool escalation under existing task authority | No-op: no repository defect or verification bypass |
| Requested framework/default-branch names differed from disk and remote names | Brief read-only discovery before setup | Actual names are `agent-framework` and `main`; the intended sources were confirmed before mutation | No-op: local naming difference, no reusable code or policy change needed |

Learning decision: retain this task evidence; no new tests, rules, framework changes, or follow-up intents are warranted.
