# Contract: APP-942 permission-viewer audit remediation

Status: **Slices 2–6 complete; only manual browser review remains. Slice 1 stays reversed per the owner (existing `permissionsPage` flag artifacts retained, no new gate wiring). Slice 6 (2026-07-31) ran the scope/regression review with an owner-directed simplicity focus: an opus adversarial simplicity review over the full diff plus sonnet disposition/scope sweeps; ten behavior-preserving simplifications applied (folds, dead-code/dead-type removal, registry-canonical condition dispatch, per-module test co-location), five judgment calls explicitly rejected with rationale. All 62 audit finding IDs dispositioned with zero open (see `APP-942-finding-dispositions.md`). Verification: focused suites 32/214 green (a direct `PermissionDetailPanel` proof was added when the 2026-08-01 final-check bug hunt found the folded panel uncovered); full app jest 2289/2289 tests pass (3 unrelated suites fail to compile on a Windows-only jest/SVG path quirk in `daos/xmaquina`); lint clean; type-check baseline-red in the same 69 pre-existing files with zero changed-file diagnostics; `git diff --check` clean. Outstanding: manual narrow/wide viewport and graph interaction review in a real browser. Owner authorized final checks + draft PR on 2026-08-01; at PR time, `origin/app-942-permissions-graph-finish` was found to carry 8 parallel APP-942 remediation commits (including flag re-gating and the CNV-2 slot rename, both contrary to this contract's owner decisions) — the divergence is flagged in the draft PR for an owner decision.**

## Linked intent

- Issue / Linear: APP-942; related rollout dependency APP-953
- Audit: `C:\Users\navet\AppData\Local\Temp\claude\c--dev-app\c9c1dfaa-d272-491d-8f1b-5a02401cc5ff\scratchpad\permission-viewer-audit.md`
- Call feedback: adjacent `permission-viewer-call-feedback.md`
- Reconciled base: `675a7f9d` on `app-942-permissions-graph-finish`
- Owner decision (2026-07-31): APP-953 is complete; retain the existing `permissionsPage` flag artifacts, leave current gate wiring unchanged, and continue with the permission-viewer remediation.
- History decision: leave inherited `cc1a6a2c` ancestry unchanged; a later branch reconstruction/history rewrite requires separate explicit authority.
- Slot decision: keep the existing `PERMISSION_CONDITION` runtime key; CNV-2 is an owner-approved exclusion because the rename is non-critical and would add compatibility complexity.
- Owner decision (2026-08-01, draft-PR feedback round): on wide layouts the expanded row must not duplicate the empty condition state; below `md` the list drops the accordion affordance for summary cards with Details/Condition drill-in buttons (the condition button is absent — never disabled — when no condition exists), reusing the shared detail/condition content. The parallel-remediation divergence on `origin/app-942-permissions-graph-finish` is explicitly left to the other developer to decide; no action in this branch.
- Risk class: high (permission visibility and rollout control)
- Task class: bug-led development task
- First required artifact: contract

## Human intent

### Problem

The permission viewer is visually close to complete, but the audit found incorrect and invisible permission filtering, deleted rollout gates, swallowed fetch errors, breakpoint-divergent information, duplicated or bespoke UI/domain logic, and avoidable graph/convention complexity. The implementation should fix every verified finding that still reproduces on the reconciled base without redesigning the feature or recreating findings already fixed by the latest commits.

### Desired behavior

The page is a trustworthy, maintainable view of the permission rows returned by the primary DAO-permissions endpoint. List and graph are two presentations of the same selected rows. Responsive layouts preserve the same information model. Existing shared primitives and domain sources of truth are used. Rollout is deliberate and owner-approved.

### Acceptance criteria

- [x] **AC-1 — Complete, explicit visibility.** The primary endpoint remains the only permission-row source. No secondary-source stitching, permission-name carve-out, unresolved/residual heuristic, inactive/historical pre-filter, or unacknowledged view-local selector hides rows. Page-level rows may be hidden only by the two visible controls: DAO-granted permissions and true subplugin-touching permissions.
- [x] **AC-2 — Correct subplugin semantics.** `parentPluginAddress != null` is authoritative row enrichment; installed plugin metadata (`isSubPlugin`, `parentPlugin`, or the parent plugin's `subPlugins`) is fallback evidence only. A top-level `processInternal` entity with no parent remains visible. ANY_ADDR/create-proposal, unresolved, and historical permissions follow the same rules as every other permission. This deliberately supersedes the audit blueprint's over-broad `processInternal` shorthand and preserves the call's parent-vs-subplugin distinction.
- [x] **AC-3 — One row set, two views.** The page passes the identical filtered row array to list and graph, and graph presentation must not subsume ordinary source permission rows. Preserve only the audit-acknowledged condition-contract endpoint exception: those endpoints may be omitted as graph nodes/edges when their condition is represented as edge annotation, and that exception must remain explicit and tested. The parity already established by `675a7f9d` remains protected.
- [ ] **AC-4 — One responsive information model.** Every permission exposes, in order, Who, Where, Permission, Condition at every breakpoint. Condition always exists as a field and renders `-` when absent. Breakpoints may change the affordance, never the information or detail semantics. Mobile and desktop share row/detail content rather than parallel component systems.
- [x] **AC-5 — Shared entity and condition semantics.** Existing DefinitionList/Link/copy affordances, explorer URL builders, permission ID sources, Safe brand registry/types, and shared condition dispatch are reused. Conditions and voting-token addresses link to the explorer; permission IDs remain copyable non-address content and never receive an explorer link. Recognized Safe enrichment (`brandId: safe`) wins over generic/backend labels so a Safe is consistently identified as Safe; other backend entity labels retain their normal precedence.
- [x] **AC-6 — Honest states and controls.** Permission-query failure renders the existing error surface, not an empty state. Empty state remains reserved for a successful empty result. Toggle disabled-state computation is covered and does not require signature sorting or repeated whole-result comparisons.
- [x] **AC-7 — Preserve the rollout flag.** APP-953 is complete, but the owner explicitly directed that the existing `permissionsPage` flag declaration and configuration remain. Slice 1 is reversed and deferred; no new gate wiring or rollout behavior change is authorized in this remediation.
- [x] **AC-8 — Finish the surviving audit cleanup.** The graph is loaded only for graph view; obsolete no-op graph filtering is removed; canvas responsibilities are decomposed into settings-local seams without changing graph behavior; surviving condition UI, typing/generator, file/component, duplicated-dispatch, dead-code, spacing/a11y, and naming findings are corrected. Keep the existing `PERMISSION_CONDITION` runtime key unchanged. No compatibility layer or new app-wide framework is introduced.
- [x] **AC-10 — Single condition empty-state on wide layouts.** In the expanded row at `md`+, the condition detail area renders only when the row has a condition; the Details list's condition row with the `-` dash remains the sole empty-state signal. (2026-08-01 feedback round.)
- [x] **AC-11 — Mobile drill-in affordance.** Below `md`, list rows are summary cards, not accordions: each card shows Who/Where/Permission/Condition plus a Details button, and a Condition button only when a condition exists (an absent button, never a disabled one). Owner flag: the mobile drill-in presents the same card structure as the graph view's permission detail card — so the buttons open the shared `PermissionDetailContent` (the graph edge-card component) in a dialog, Details on the permission tab and Condition directly on the condition tab. No parallel component systems, no information loss. (2026-08-01 feedback round.)
- [x] **AC-9 — Scope integrity.** Refuted findings, the legitimate empty `backendApiMocks` array, and work already satisfied on the reconciled base are not reimplemented. The remediation adds no new unrelated design-sync/tooling changes and leaves inherited `cc1a6a2c` ancestry unchanged. Any later history reconstruction is separate work requiring explicit authority.

### Non-goals

- [ ] No permission-system, backend endpoint, authorization/enforcement, transaction, migration, or release-workflow change.
- [ ] No visual redesign or brittle graph-geometry rewrite.
- [ ] No new generic permissions framework or cross-module abstraction.
- [ ] No reintroduction of a second permission data source.
- [ ] No work on audit Appendix A refutations or GAP3-4 (`backendApiMocks`).
- [ ] No rename, alias, migration, or documentation churn for `PERMISSION_CONDITION` (CNV-2 is explicitly accepted).
- [ ] No implementation outside authorized slices 5–6, no new `permissionsPage` gate wiring, and no history rewrite, merge, or deploy under the current authorization. Owner authorization 2026-08-01: final checks, commit, push, and a **draft** PR are explicitly authorized; merge/deploy remain excluded.

### Constraints

- Technical: preserve Next.js/React module boundaries and current graph/list behavior except for the named defects; use current repo conventions.
- Product: the page is intentionally launched because APP-953 is complete; default visibility includes inactive/historical grants because the audit permits hiding only through the two explicit toggles.
- Security / privacy: this is a visibility/audit surface; tests must protect complete and correct permission representation. It must not change on-chain permissions.
- Time / scope: the audit is intent, not a line-perfect implementation spec. Each slice re-verifies its cited finding against current HEAD before editing.

### Audit reconciliation

The audit and current base already treat these outcomes as satisfied. They must be preserved, not rebuilt:

- `675a7f9d`: list/graph permission-row parity and removal of creator-row subsumption.
- `78adf047`: shared draggable-panel hook, info tooltip, and condition-display work.
- `91e7e6b0`: condition details rendered address-first with explorer links.
- `84881a3d`: DefinitionList affordance reuse and graph-builder simplification.

All other audit recommendations remain in scope only where the underlying problem still reproduces. Acceptance outcomes above take precedence over stale filenames, line numbers, or prescribed deletions.

| Audit group | Reconciled status | Remaining closure obligation |
|---|---|---|
| FLT | Single primary source already satisfied; FLT-1..6 behavior/cleanup remains where reproduced | Slices 2 and 5; filter/hook/page tests and final ID-level disposition |
| CMP / LST / RSP | DefinitionList/link, draggable, and tooltip work partly satisfied; parallel responsive trees and residual presentation issues remain | Slice 3; component tests plus viewport/a11y review |
| GRF | GRF-1 and GRF-2 outcomes are satisfied; GRF-3/4 remain where reproduced | Slice 4; graph unit/component tests and changed-file review |
| LBL / CND | Condition address linking partly satisfied; Safe precedence and residual condition-slot/UI issues remain | Slices 3 and 5; entity/condition component tests |
| VRB / TST / CNV / GAP1 | Partly satisfied by reconciled commits; surviving dead code, proof, naming, typing, and generator findings remain; CNV-2 is owner-excluded | Slice 5; tests, type-check, and targeted search/review; record CNV-2 as accepted/no-action |
| GAP2 | Owner explicitly retains the existing flag declaration/config after reviewing slice 1 | Owner-deferred/no implementation; preserve the restored artifacts and do not add gate wiring without separate authorization |
| GAP3 | Lazy graph remains; inherited design-sync ancestry is accepted unchanged for this task; GAP3-4 is legitimate/no-action | Slices 4 and 6; import-boundary proof and changed-file review |
| Appendix A / refuted findings | Excluded | No implementation; retain exclusion rationale |

Before review, every confirmed audit finding ID must appear in a compact disposition record as one of: satisfied by reconciled base commit, fixed by this remediation with proof, or explicitly excluded/deferred with owner-approved rationale. This matrix may live in the implementation PR; it need not duplicate the audit in this contract. **Done: the record lives at `operating-model/contracts/APP-942-finding-dispositions.md` (62/62 IDs, zero open).**

## Technical contract

### Current behavior

`useAllDaoPermissions` is the sole permission source and `daoPermissionsPageClient` supplies one explicitly filtered array to both views while preserving query errors. The existing `permissionsPage` artifacts remain restored per owner direction. The list now shares one responsive row/detail tree, entity and condition semantics use the shared DAO-service boundary, and graph-only code is lazy-loaded behind a decomposed settings-local canvas. Manual responsive and graph interaction review remains outstanding.

### Proposed system change

Keep selection at the DAO-permissions page boundary: one source, one explicit filter policy, one row array for both consumers. Carry query state intact to the page. Consolidate list presentation around shared feature-local row/detail content. Correct entity/condition/domain ownership at existing boundaries. Put graph-only dependencies behind the graph-view boundary and extract local pure helpers/hooks without changing graph contracts. Apply the remaining audit cleanup only after correctness is locked by proof.

### Affected surfaces

- Domain logic: permission-row filters, entity/condition resolution, permission types and test generators.
- UI: DAO permissions page, list, graph, details, condition slots, feature entry links.
- Storage: none.
- API: no endpoint/schema change; existing query error/status is propagated.
- Auth / permissions: no enforcement change; high-risk visibility semantics only.
- CI / deployment: none.
- Documentation: this contract; no slot documentation change.

### Architecture impact

- Impact: significant.
- Reasoning: the work crosses the shared row-selection boundary, query state, responsive presentation ownership, UI-domain types, and the React Flow load/layout boundary.
- Architecture-decision required: yes.
- Architecture-decision result: use incremental, settings-module-local remediation; preserve one canonical row set and existing graph contracts; do not create a broad permissions framework.
- Chosen direction: sequential slices on one task branch, with correctness before structural cleanup.
- Architectural constraints and non-changes: one source and page-selected row set; preserve the explicit condition-contract graph-presentation exception and existing `PERMISSION_CONDITION` key; no backend/auth/data/release changes; no newly introduced design-sync content; no test weakening; no graph-semantic change during decomposition.
- Architectural proof: focused selection/error/parity tests, responsive semantic tests plus viewport review, graph import/layout tests, type-check, and changed-file/history review.
- ADR required: no; the audit and contract are sufficient for this bounded feature remediation. Reassess only if rollout becomes a cross-feature policy.
- Split-work decision: one task/PR with sequential, independently reviewable commits. A staged rollout, compatibility migration, or history rewrite requires separate explicit authority and may require a follow-up contract.
- Human or governed approval required before coding: yes.
- Approval owner/status: user/product owner; slice 1 is reversed and the flag-retention decision is recorded. Slices 2–5 are explicitly authorized. The owner accepted carrying slice-3 adversarial blockers forward instead of stopping; slice 5 fixed the behavior gaps. Slice 6 was authorized and executed on 2026-07-31 with an owner-directed simplicity focus; manual browser review remains for the owner.

### Implementation slices

1. **Approved launch cleanup** — AC-7 flag removal was implemented locally, then explicitly reversed by the owner. Status: Deferred/no change; existing `permissionsPage` flag artifacts are restored and no new gate wiring is authorized.
2. **Permission selection and error proof/fix** — AC-1, AC-2, AC-3, AC-6 with proof-first filter, parity, toggle, and error cases. Status: Focused proof green (4 suites / 57 tests; expanded 5 suites / 74 tests), lint green, no changed-file type-check diagnostics, and adversarially approved. Repository type-check remains baseline-red outside slice 2; full repository tests have not been run.
3. **Responsive list and shared semantics** — AC-4 and AC-5; unify content, condition behavior, links/copy, Safe/entity resolution, and condition UI. Status: Focused proof green (8 suites / 61 tests in expanded regression); owner-directed provisional acceptance. Deferred to the final cleanup/review: Safe precedence outside `processInternal`, unsupported non-empty condition dispatch, malformed voting-token payload validation, and manual narrow/wide viewport proof.
4. **Graph boundary and structural cleanup** — AC-8 graph lazy-loading, no-op removal, and behavior-preserving canvas seams. Status: Focused proof green (5 graph suites / 41 tests; expanded page/graph regression 6 suites / 56 tests), focused lint and `git diff --check` green, no changed-file type-check diagnostics, and adversarially approved. The graph is behind a dynamic barrel, the identity edge helper is removed, and the 957-line canvas is decomposed into a 274-line orchestrator plus settings-local flow/layout modules. Manual graph interaction/layout proof is deferred to the final review.
5. **Domain, convention, and residual audit cleanup** — Remaining AC-8 types/generators, permission constants, file/component boundaries, dead code, test fixtures, spacing/a11y; explicitly leave the slot key/docs unchanged. Status: Adversarially approved. Focused behavior proof green (5 suites / 50 tests); compact condition/constants proof green (2 suites / 15 tests); domain/view-model proof green (7 suites / 55 tests); component-boundary proof green (5 suites / 49 tests); TST-6 proof green (1 suite / 11 tests); original CND-6 proof green (1 suite / 5 tests). Final blocker closure passed 5 suites / 53 tests, followed by a 17/17 list rerun after the typed icon wrapper fix. The shared generator now has direct default-coherence proof and backs list/graph/page fixtures; decoded-to-raw fallback is covered; list-header spacing uses the Accordion padding and real chevron affordance; and the legacy settings permission-row aliases are deleted. The full app type-check remains baseline-red on broad UI-kit declaration issues; its only two reported slice-local issues were corrected. Focused component/domain lint checks were green, and `git diff --check` plus feature-flag/slot-key scope checks are green. The combined root suite and final focused lint rerun were blocked before execution by the environment approval service's usage quota, not by test failures.
6. **Scope and regression review** — AC-9 plus full focused verification and manual responsive/graph review. Status: Done except manual browser review. Simplicity-focused review pass (opus diff review + sonnet disposition/scope sweeps) applied ten behavior-preserving simplifications and rejected five judgment calls with recorded rationale; one proposed cleanup (dropping sentinel `.toLowerCase()` normalization) was disproven by the case-insensitivity test and reverted. Finding dispositions: 51 fixed / 4 satisfied-by-base / 7 owner-excluded / 0 open (`APP-942-finding-dispositions.md`). Focused suites 32/214 green at close (final-check additions included); full app jest 2289/2289 tests pass on the final tree (3 unrelated Windows-env compile failures in `daos/xmaquina`); lint clean; type-check unchanged vs baseline; `git diff --check` clean. Manual narrow/wide viewport and graph drag/fullscreen review in a real browser is the sole remaining item.
7. **Owner feedback round (2026-08-01)** — AC-10 and AC-11 from the draft-PR review; proof-first per the proof-first-cycle skill. Status: Done. Red captured first (4 list failures + dialog module-not-found: buttons absent, empty-condition placeholder still rendered, single-tree count), then the smallest implementation: the expanded row's condition column renders only when a condition exists; below `md` each row is a summary card (same shared field components) with a Details button and a condition-gated Condition button, both opening the new `PermissionDetailsDialog` (settings dialog conventions: dynamic barrel, definitions entry, `PERMISSION_DETAILS` id) which renders the shared `PermissionDetailContent` — the graph edge-card component, now with an `initialTab` prop — per the owner's flag that the mobile structure equals the graph detail card. Green: 33 suites / 218 tests focused; lint clean; type-check unchanged vs baseline (69 pre-existing files, zero new); `git diff --check` clean. `NoConditionSlot` remains registered as the `'none'` dispatch even though the empty state no longer renders a slot in the UI (kept as the correct registry fallback rather than deleted). Visual confirmation of the new affordances rides on the outstanding manual browser review.

Slices are sequential because later refactors depend on the corrected selection/error contracts. They may use bounded subagents only with disjoint write scopes.

## Verification contract

| Acceptance criterion | Proof type | File/check/result | Required before implementation? |
|---|---|---|---|
| AC-1, AC-2 | table-driven unit tests | `permissionRowFilters.test.ts` covering both toggles, top-level/subplugin, ANY_ADDR, unresolved, and historical rows | yes |
| AC-3 | unit + page component tests | `buildPermissionGraph.test.ts`, `daoPermissionsPageClient.test.tsx`; both views receive the same array, ordinary rows remain represented, and the condition-contract exception is explicit | yes |
| AC-4 | component + manual viewport proof | `permissionsList.test.tsx`; Who/Where/Permission/Condition and the no-condition dash at narrow and wide layouts | yes for semantics; manual after layout change |
| AC-5 | unit/component tests | entity resolver, condition slots, and list/graph details prove Safe precedence and explorer/copy semantics | yes for regressions |
| AC-6 | hook + page component tests | `usePermissionsData.test.ts`, `daoPermissionsPageClient.test.tsx`; error vs successful-empty and toggle disabled states | yes |
| AC-7 | changed-file review | existing `permissionsPage` flag declaration/configuration remain unchanged; no new gate wiring is introduced | no; owner-deferred |
| AC-8 | unit/component/type checks | graph lazy boundary and behavior tests; condition component tests; domain type/generator tests; type-check; targeted searches for no-op/dead code; viewport/a11y checklist | before behavior-changing fixes; after pure extraction where no stable red oracle exists |
| AC-9 | deterministic + review | `git diff --check`, changed-file/range review, and finding-ID disposition record | no; review stage |
| AC-10, AC-11 | proof-first component tests | `permissionsList.test.tsx` (mobile card buttons, condition-button absence, single empty-condition state) and `permissionDetailsDialog.test.tsx` (shared card content per view) | yes |

### Proof decisions

| Behavior or risk | Proof artifact | Stage | Rationale |
|---|---|---|---|
| Permission visibility | proof-first tests | proof | Precise, security-adjacent, and regression-prone behavior needs a red oracle before code changes. |
| Rollout flag retention | changed-file review | review | The owner reversed slice 1; preserve existing artifacts and add no new gate wiring. |
| Query error handling and responsive information parity | proof-first component tests | proof | Stable semantic assertions exist independent of styling. |
| Graph/list parity already fixed at base | existing tests plus strengthened regression | proof | Preserve the current fix; do not recreate it. |
| Visual spacing, affordances, fullscreen/drag interactions | manual browser verification and targeted existing tests | review | jsdom cannot reliably prove geometry or responsive visual quality. |
| Pure graph canvas extraction | proof-after against existing graph/layout tests | implementation | The intended behavior is unchanged and existing behavior is the oracle. |
| Refuted/stale/legitimate audit findings | no new artifact | contract | They are explicitly excluded by AC-9 and the reconciliation section. |

### Proof strategy

- [x] Proof-first for permission selection and error behavior.
- [x] Proof-first for responsive information semantics in slice 3.
- [x] Proof-after for behavior-preserving structural extraction.
- [ ] Manual verification for responsive visual quality and graph interactions, with recorded evidence.

### Required commands

```bash
pnpm --filter @aragon/app exec jest --runInBand --runTestsByPath \
  src/modules/settings/utils/permissionRowFilters/permissionRowFilters.test.ts \
  src/modules/settings/utils/buildPermissionGraph/buildPermissionGraph.test.ts \
  src/modules/settings/hooks/usePermissionsData/usePermissionsData.test.ts \
  src/modules/settings/pages/daoPermissionsPage/daoPermissionsPageClient.test.tsx \
  src/modules/settings/components/permissionsList/permissionsList.test.tsx
pnpm --filter @aragon/app type-check
pnpm --filter @aragon/app lint:check
pnpm test
git diff --check
```

## Risks and open questions

### Risks

- Product: the existing flag artifacts are intentionally retained without new gate wiring; the slice-2 risk is continuing to hide audit rows.
- Technical: broad cleanup can change graph/list behavior if correctness and refactor slices are mixed.
- Security: display visibility is security-adjacent, though on-chain authorization is unchanged.
- Data: no mutation; risk is incorrect omission or labeling of returned permissions.

### Open questions

- None.

## Learning hook

Near task close before merge, decide:

- [x] Slice-4 learning: the named-export dynamic-barrel test is the narrow durable guardrail for keeping the heavy graph behind its conditional view boundary; no broader rule or skill change is justified from one instance.
- [ ] Follow-up intent proposed for any separate rollout, history, or durable guardrail work.
- [x] Durable memory action chosen for slice 4: retain the focused lazy-barrel and all-graph-edge tests; defer the task-wide visibility-filter learning decision until final review.
