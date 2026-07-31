# Contract: APP-942 permission-viewer audit remediation

Status: **Contract decisions resolved; implementation intentionally not started and requires explicit follow-up authorization.**

## Linked intent

- Issue / Linear: APP-942; related rollout dependency APP-953
- Audit: `C:\Users\navet\AppData\Local\Temp\claude\c--dev-app\c9c1dfaa-d272-491d-8f1b-5a02401cc5ff\scratchpad\permission-viewer-audit.md`
- Call feedback: adjacent `permission-viewer-call-feedback.md`
- Reconciled base: `675a7f9d` on `app-942-permissions-graph-finish`
- Owner decision (2026-07-31): APP-953 is complete and the permissions page is intentionally launched without a feature gate.
- History decision: leave inherited `cc1a6a2c` ancestry unchanged; a later branch reconstruction/history rewrite requires separate explicit authority.
- Slot decision: keep the existing `PERMISSION_CONDITION` runtime key; CNV-2 is an owner-approved exclusion because the rename is non-critical and would add compatibility complexity.
- Risk class: high (permission visibility and rollout control)
- Task class: bug-led development task
- First required artifact: contract

## Human intent

### Problem

The permission viewer is visually close to complete, but the audit found incorrect and invisible permission filtering, deleted rollout gates, swallowed fetch errors, breakpoint-divergent information, duplicated or bespoke UI/domain logic, and avoidable graph/convention complexity. The implementation should fix every verified finding that still reproduces on the reconciled base without redesigning the feature or recreating findings already fixed by the latest commits.

### Desired behavior

The page is a trustworthy, maintainable view of the permission rows returned by the primary DAO-permissions endpoint. List and graph are two presentations of the same selected rows. Responsive layouts preserve the same information model. Existing shared primitives and domain sources of truth are used. Rollout is deliberate and owner-approved.

### Acceptance criteria

- [ ] **AC-1 — Complete, explicit visibility.** The primary endpoint remains the only permission-row source. No secondary-source stitching, permission-name carve-out, unresolved/residual heuristic, inactive/historical pre-filter, or unacknowledged view-local selector hides rows. Page-level rows may be hidden only by the two visible controls: DAO-granted permissions and true subplugin-touching permissions.
- [ ] **AC-2 — Correct subplugin semantics.** `parentPluginAddress != null` is authoritative row enrichment; installed plugin metadata (`isSubPlugin`, `parentPlugin`, or the parent plugin's `subPlugins`) is fallback evidence only. A top-level `processInternal` entity with no parent remains visible. ANY_ADDR/create-proposal, unresolved, and historical permissions follow the same rules as every other permission. This deliberately supersedes the audit blueprint's over-broad `processInternal` shorthand and preserves the call's parent-vs-subplugin distinction.
- [ ] **AC-3 — One row set, two views.** The page passes the identical filtered row array to list and graph, and graph presentation must not subsume ordinary source permission rows. Preserve only the audit-acknowledged condition-contract endpoint exception: those endpoints may be omitted as graph nodes/edges when their condition is represented as edge annotation, and that exception must remain explicit and tested. The parity already established by `675a7f9d` remains protected.
- [ ] **AC-4 — One responsive information model.** Every permission exposes, in order, Who, Where, Permission, Condition at every breakpoint. Condition always exists as a field and renders `-` when absent. Breakpoints may change the affordance, never the information or detail semantics. Mobile and desktop share row/detail content rather than parallel component systems.
- [ ] **AC-5 — Shared entity and condition semantics.** Existing DefinitionList/Link/copy affordances, explorer URL builders, permission ID sources, Safe brand registry/types, and shared condition dispatch are reused. Conditions and voting-token addresses link to the explorer; permission IDs remain copyable non-address content and never receive an explorer link. Recognized Safe enrichment (`brandId: safe`) wins over generic/backend labels so a Safe is consistently identified as Safe; other backend entity labels retain their normal precedence.
- [ ] **AC-6 — Honest states and controls.** Permission-query failure renders the existing error surface, not an empty state. Empty state remains reserved for a successful empty result. Toggle disabled-state computation is covered and does not require signature sorting or repeated whole-result comparisons.
- [ ] **AC-7 — Complete the approved launch.** APP-953 is complete and the owner confirms the page is intentionally launched. Keep the route and both entry links available, remove the obsolete `permissionsPage` flag/config/docs/test assumptions, and prove there are no remaining rollout-gate references or mixed states.
- [ ] **AC-8 — Finish the surviving audit cleanup.** The graph is loaded only for graph view; obsolete no-op graph filtering is removed; canvas responsibilities are decomposed into settings-local seams without changing graph behavior; surviving condition UI, typing/generator, file/component, duplicated-dispatch, dead-code, spacing/a11y, and naming findings are corrected. Keep the existing `PERMISSION_CONDITION` runtime key unchanged. No compatibility layer or new app-wide framework is introduced.
- [ ] **AC-9 — Scope integrity.** Refuted findings, the legitimate empty `backendApiMocks` array, and work already satisfied on the reconciled base are not reimplemented. The remediation adds no new unrelated design-sync/tooling changes and leaves inherited `cc1a6a2c` ancestry unchanged. Any later history reconstruction is separate work requiring explicit authority.

### Non-goals

- [ ] No permission-system, backend endpoint, authorization/enforcement, transaction, migration, or release-workflow change.
- [ ] No visual redesign or brittle graph-geometry rewrite.
- [ ] No new generic permissions framework or cross-module abstraction.
- [ ] No reintroduction of a second permission data source.
- [ ] No work on audit Appendix A refutations or GAP3-4 (`backendApiMocks`).
- [ ] No rename, alias, migration, or documentation churn for `PERMISSION_CONDITION` (CNV-2 is explicitly accepted).
- [ ] No implementation, proof changes, history rewrite, commit, push, PR, merge, or deploy under the current authorization.

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
| GAP2 | Owner confirms intentional launch; obsolete flag declaration/config remains | Slice 1; delete dead rollout artifacts and prove route plus both entry links remain available |
| GAP3 | Lazy graph remains; inherited design-sync ancestry is accepted unchanged for this task; GAP3-4 is legitimate/no-action | Slices 4 and 6; import-boundary proof and changed-file review |
| Appendix A / refuted findings | Excluded | No implementation; retain exclusion rationale |

Before review, every confirmed audit finding ID must appear in a compact disposition record as one of: satisfied by reconciled base commit, fixed by this remediation with proof, or explicitly excluded/deferred with owner-approved rationale. This matrix may live in the implementation PR; it need not duplicate the audit in this contract.

## Technical contract

### Current behavior

`useAllDaoPermissions` is already the sole permission source and `daoPermissionsPageClient` supplies one filtered array to both views. However, `permissionRowFilters` still permanently removes inactive endpoints and uses unresolved/residual/name-specific rules unrelated to the two controls; query errors are discarded; all three `permissionsPage` gates are absent; the list still has separate mobile and desktop trees; Safe/domain/condition conventions remain fragmented; and graph loading/canvas structure plus several smaller audit findings remain unresolved.

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
- Approval owner/status: user/product owner; rollout, history, and slot decisions are resolved. A follow-up instruction to implement remains pending.

### Implementation slices

1. **Approved launch cleanup** — Complete AC-7 by removing the obsolete `permissionsPage` flag artifacts while retaining an available route and both entry links. Status: To do.
2. **Permission selection and error proof/fix** — AC-1, AC-2, AC-3, AC-6 with proof-first filter, parity, toggle, and error cases. Status: To do.
3. **Responsive list and shared semantics** — AC-4 and AC-5; unify content, condition behavior, links/copy, Safe/entity resolution, and condition UI. Status: To do.
4. **Graph boundary and structural cleanup** — AC-8 graph lazy-loading, no-op removal, and behavior-preserving canvas seams. Status: To do.
5. **Domain, convention, and residual audit cleanup** — Remaining AC-8 types/generators, permission constants, file/component boundaries, dead code, test fixtures, spacing/a11y; explicitly leave the slot key/docs unchanged. Status: To do.
6. **Scope and regression review** — AC-9 plus full focused verification and manual responsive/graph review. Status: To do.

Slices are sequential because later refactors depend on the corrected selection/error contracts. They may use bounded subagents only with disjoint write scopes.

## Verification contract

| Acceptance criterion | Proof type | File/check/result | Required before implementation? |
|---|---|---|---|
| AC-1, AC-2 | table-driven unit tests | `permissionRowFilters.test.ts` covering both toggles, top-level/subplugin, ANY_ADDR, unresolved, and historical rows | yes |
| AC-3 | unit + page component tests | `buildPermissionGraph.test.ts`, `daoPermissionsPageClient.test.tsx`; both views receive the same array, ordinary rows remain represented, and the condition-contract exception is explicit | yes |
| AC-4 | component + manual viewport proof | `permissionsList.test.tsx`; Who/Where/Permission/Condition and the no-condition dash at narrow and wide layouts | yes for semantics; manual after layout change |
| AC-5 | unit/component tests | entity resolver, condition slots, and list/graph details prove Safe precedence and explorer/copy semantics | yes for regressions |
| AC-6 | hook + page component tests | `usePermissionsData.test.ts`, `daoPermissionsPageClient.test.tsx`; error vs successful-empty and toggle disabled states | yes |
| AC-7 | server + entry-point tests and targeted search | route renders without a gate, settings-info and hierarchy links remain visible, and no obsolete `permissionsPage` flag/config reference survives | yes |
| AC-8 | unit/component/type checks | graph lazy boundary and behavior tests; condition component tests; domain type/generator tests; type-check; targeted searches for no-op/dead code; viewport/a11y checklist | before behavior-changing fixes; after pure extraction where no stable red oracle exists |
| AC-9 | deterministic + review | `git diff --check`, changed-file/range review, and finding-ID disposition record | no; review stage |

### Proof decisions

| Behavior or risk | Proof artifact | Stage | Rationale |
|---|---|---|---|
| Permission visibility and rollout | proof-first tests | proof | Precise, security-adjacent, and regression-prone behavior needs a red oracle before code changes. |
| Query error handling and responsive information parity | proof-first component tests | proof | Stable semantic assertions exist independent of styling. |
| Graph/list parity already fixed at base | existing tests plus strengthened regression | proof | Preserve the current fix; do not recreate it. |
| Visual spacing, affordances, fullscreen/drag interactions | manual browser verification and targeted existing tests | review | jsdom cannot reliably prove geometry or responsive visual quality. |
| Pure graph canvas extraction | proof-after against existing graph/layout tests | implementation | The intended behavior is unchanged and existing behavior is the oracle. |
| Refuted/stale/legitimate audit findings | no new artifact | contract | They are explicitly excluded by AC-9 and the reconciliation section. |

### Proof strategy

- [x] Proof-first for permission selection, rollout, error behavior, and responsive information semantics.
- [x] Proof-after for behavior-preserving structural extraction.
- [x] Manual verification for responsive visual quality and graph interactions, with recorded evidence.

### Required commands

```bash
pnpm --filter @aragon/app exec jest --runInBand --runTestsByPath \
  src/modules/settings/utils/permissionRowFilters/permissionRowFilters.test.ts \
  src/modules/settings/utils/buildPermissionGraph/buildPermissionGraph.test.ts \
  src/modules/settings/hooks/usePermissionsData/usePermissionsData.test.ts \
  src/modules/settings/pages/daoPermissionsPage/daoPermissionsPage.test.tsx \
  src/modules/settings/pages/daoPermissionsPage/daoPermissionsPageClient.test.tsx \
  src/modules/settings/components/daoSettingsInfo/daoSettingsInfo.test.tsx \
  src/modules/settings/components/daoHierarchy/daoHierarchy.test.tsx \
  src/modules/settings/components/permissionsList/permissionsList.test.tsx
pnpm --filter @aragon/app type-check
pnpm --filter @aragon/app lint:check
pnpm test
git diff --check
```

## Risks and open questions

### Risks

- Product: launch is approved; the remaining risk is leaving stale flag artifacts or continuing to hide audit rows.
- Technical: broad cleanup can change graph/list behavior if correctness and refactor slices are mixed.
- Security: display visibility is security-adjacent, though on-chain authorization is unchanged.
- Data: no mutation; risk is incorrect omission or labeling of returned permissions.

### Open questions

- None.

## Learning hook

Near task close before merge, decide:

- [ ] Actual learning or no-op rationale included in the implementation PR.
- [ ] Follow-up intent proposed for any separate rollout, history, or durable guardrail work.
- [ ] Durable memory action chosen for feature-flag removal and visibility-filter guardrails, or explicitly declined with rationale.
