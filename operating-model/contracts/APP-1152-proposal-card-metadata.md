# APP-1152: Proposal card metadata

## Intent and scope

- Issue: https://linear.app/aragon/issue/APP-1152/fix-missing-metadata-warnings-and-duplicate-proposal-titles
- Task: low-risk UI bug fix, authorized by the user's implementation request.
- Use the sister `agent-framework` repository's operating loop. Keep the implementation minimal, reuse existing patterns, and add no tests.
- Correction worktree: `C:/dev/app/.tempor/APP-1152-title`; branch: `agent/app-1152-title`, based on local `develop` at `1b881a408`. Clean status and baseline diff check passed before editing.
- Base: fresh `main` at `ad72589616c94e45a91cc3f97c7c9a3cc736c38c`, as requested. Local `develop` is an ancestor and is the framework's integration target.
- Authority: scoped edits, local commits, local develop integration, and task cleanup. No push, PR publication, protected-branch merge, or deployment.

## Acceptance criteria

- [x] Staged proposal cards show the existing missing/non-standard metadata warning in process lists and All proposals.
- [x] Standard and staged cards retain the existing identifier and render no fallback title when the title is empty, both with a description and without one.
- [x] Named proposals retain their actual title and identifier.
- [x] Preserve proposal links, summaries, status, stage context, publisher information, and details-page behavior.

## Technical interpretation

`DaoProposalListDefaultItem` already renders `AlertInline` using `proposalUtils.getMetadataStatus` and the metadata-alert translations. `SppProposalListItem`, shared by the process and All proposals lists through the proposal-item slot, lacks that warning. Both cards pass a slug as their identifier and use `getDisplayTitle`, which falls back to that same slug.

Implement one small slice: reuse the existing warning block in the staged card, retain `id={proposalSlug}`, and render `title={proposal.title}` in both cards. The identifier already identifies untitled proposals; the card title must not fall back to that identifier. Keep `getDisplayTitle` for the details page and keep metadata classification unchanged: an existing description still counts as resolved metadata.

The user's correction supersedes the initial interpretation, which hid the identifier instead of removing the duplicate title. The warning change remains valid.

Architecture impact is local and reversible: two existing presentation components, with no new abstraction or changes to API, storage, permissions, dependencies, or module boundaries. No architecture decision, ADR, or additional human approval is required. Retain the existing app patch changeset. Update the existing card test that expected the buggy fallback; add no new tests or unrelated refactoring.

## Proof decisions

| Behavior/risk | Evidence | Timing |
| --- | --- | --- |
| Existing behavior and task isolation | Clean worktree, source inspection, `git diff --check` | Before implementation: passed |
| Standard and staged card rendering | Existing `daoProposalListDefaultItem`, `sppProposalListItem`, and `proposalUtils` suites | After implementation |
| Empty title with/without description; missing/non-standard metadata; named proposals | Review the input cases against the existing title/status helpers and both card props | After implementation |
| Both list entry points | Inspect the shared proposal-item slot registration and list callers | Before/after implementation |
| Type compatibility and formatting | App type-check through root Turbo; focused Biome check; changeset validation; diff review | After implementation |

No new tests or temporary test files: explicit user constraint, narrow presentation change, existing component/helper coverage, and input-case review. The existing fallback test will instead assert that the identifier appears once, using the uppercase slug returned in production. Proof-first-cycle is not required. No browser or live QA claim is made without actually running it.

## Evidence and completion

- Corrected both existing card components and updated one existing fallback test; there are no new abstractions, helpers, translations, or tests. The results below were verified again for the correction.
- Existing suites: `pnpm --filter @aragon/app exec jest --runInBand --runTestsByPath src/modules/governance/components/daoProposalList/daoProposalListDefaultItem.test.tsx src/plugins/sppPlugin/components/sppProposalListItem/sppProposalListItem.test.tsx src/modules/governance/utils/proposalUtils/proposalUtils.test.ts` — 3 suites, 22 tests passed.
- `pnpm type-check --filter=@aragon/app` — passed, including the prerequisite assistant-contracts build through Turbo.
- Focused Biome check of the two card components and the updated existing test — passed without fixes, using the installed Biome 2.5.10 binary.
- `pnpm validate:changesets` and `git diff --check` — passed. Verification runtime: Node 24.14.0, pnpm 11.24.0; the repo declares Node >=24.16.0.
- Dependency setup uses the lockfile in the task worktree; the primary checkout contains an old tooltip-preview dependency and is not used for verification.
- Source review confirms process and group tabs both use `DaoProposalListDefault`, which selects the registered `SppProposalListItem` for staged proposals.
- Initial review was superseded by the user's correction: removing the identifier was the wrong fix. Correction verification passed; review confirmed that the final diff against `main` makes no identifier change and removes the fallback from both card titles. No remaining review blockers. Local integration follows `finish-local-work` after committing this evidence.
- Risks: visual placement follows the existing UI-kit composition; runtime/browser QA remains separate from source review and existing tests.
- Open questions: none.

### Input-case review

| Input | Both cards | Staged warning |
| --- | --- | --- |
| Nonempty title | Title and secondary identifier retained | None for resolved metadata |
| Empty title, nonempty description | Identifier retained; title empty | None, matching existing metadata classification |
| Empty title and description, missing or unresolved IPFS metadata | Identifier retained; title empty | Existing missing-metadata message |
| Empty title and description, non-standard metadata string | Identifier retained; title empty | Existing non-standard-metadata message |
| Empty title and absent slug | No identifier or title | Determined by the existing metadata helper |

### Learning review

The context-bearing agent reviewed the issue, contract, live task context, user correction, diff, and local verification. No PR body was requested or prepared, so the PR trace auditor does not apply to this local handoff. Prior environment observations are preserved; the original conclusion that the implementation fully matched the issue is superseded.

| Signal | Impact | Causal analysis | Disposition |
| --- | --- | --- | --- |
| Existing checkout used a tooltip-preview UI kit | Sharing its dependencies would reduce confidence in verification | Ignored runtime dependencies survive a Git cleanup; the fresh worktree's offline lockfile install isolated this task and completed in about four minutes | No durable rule change: existing isolation policy covers this; dependencies and lockfile unchanged |
| Git/Corepack operations required sandbox escalation | Initial commands could not access Git metadata or the package-manager cache | Environment permissions, resolved through scoped tool escalation under existing task authority | No-op: no repository defect or verification bypass |
| Requested framework/default-branch names differed from disk and remote names | Brief read-only discovery before setup | Actual names are `agent-framework` and `main`; the intended sources were confirmed before mutation | No-op: local naming difference, no reusable code or policy change needed |
| User identified that the fix changed the identifier rather than the title fallback | Required a correction to the code, contract, and earlier explanation | The initial interpretation optimized for showing the identifier once and failed to preserve the unaffected identifier field; passing tests did not establish alignment with the requested UI behavior | Fix now: keep the identifier, remove the card title fallback, and update the existing fallback test; no new framework rule needed because contract alignment is already required |
| Windows rejected removal of the first task's temporary directory with a long-path error | Git unregistered the worktree but left ignored files | Installed dependency paths exceeded Git's default Windows path handling | Preserve those prior artifacts; use command-scoped long-path support for ordinary Git cleanup of the correction worktree |

Learning decision: correct the implementation and contract within APP-1152 and retain this evidence; no new tests, rules, framework changes, or follow-up intents are warranted.
