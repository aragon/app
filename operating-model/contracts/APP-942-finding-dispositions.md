# APP-942 audit finding dispositions (AC-9)

Companion to `APP-942-permission-viewer-audit-remediation.md`. Every confirmed finding ID from the audit
(`permission-viewer-audit.md`, 2026-07-31) is dispositioned against the working tree at slice-6 close.
Verified by code/test inspection (not status prose): one sonnet sweep over all 62 IDs, one opus
simplicity review over the full diff, plus orchestrator spot-checks; slice-6 amendments are marked **[S6]**.

Dispositions: **fixed** (by this remediation) · **base** (already satisfied by reconciled commits
`675a7f9d` / `78adf047` / `91e7e6b0` / `84881a3d`) · **excluded** (owner-recorded decision).
No finding is open.

## Totals

| Disposition | Count | IDs |
|---|---|---|
| fixed | 51 | all FLT, CMP-1/3..8, GRF-3/4, all LST, all RSP, LBL-1, all CND, VRB-1/3..7, all TST, CNV-1/3, all GAP1, GAP3-1/3 |
| base | 4 | GRF-1 (`675a7f9d`); CMP-2, GRF-2, VRB-2 (`78adf047`) |
| excluded | 7 | CNV-2, GAP2-1..4, GAP3-2, GAP3-4 |
| open | 0 | — |

Appendix A refutations (FLT-R1, FLT-R2, LBL-R1, LBL-R2): confirmed **not implemented / not reintroduced**.

## FLT — filtering & data flow (all fixed)

| ID | Evidence in working tree |
|---|---|
| FLT-1 | `permissionRowFilters.ts` holds exactly two predicates (`isDaoGrantedPermission`, `rowTouchesSubplugin`); `isResidualPermission`, `rowTouchesUnresolvedSupportingEndpoint`, `rowHasUnresolvedPermission` deleted |
| FLT-2 | Carve-out + `CREATE_PROPOSAL_PERMISSION_NAME` deleted; test flipped: `permissionRowFilters.test.ts` "applies the subplugin filter to create-proposal rows without a name carve-out" |
| FLT-3 | `isInactivePluginEndpoint` / `INACTIVE_PLUGIN_STATUSES` deleted; no pre-filter before the two toggles |
| FLT-4 | `usePermissionsData` returns `error`; `daoPermissionsPageClient.tsx` renders `Page.Error`; covered in page tests |
| FLT-5 | `types/permissionRow.ts` deleted; feature typed on `IDaoPermission`; no-op memo and `realDao`/`realAccounts` aliases gone |
| FLT-6 | Single-pass `getPermissionRowToggleAvailability` (early-break) replaces signature sort/join + two extra filter passes; covered by page `it.each` |

## CMP — component redundancy

| ID | Disposition | Evidence |
|---|---|---|
| CMP-1 | fixed | One `PermissionsListRow` tree at all breakpoints; mobile card gone; `permissionsList.tsx` 527→~80 lines across focused files |
| CMP-2 | base + **[S6]** | Drag logic unified in `useDraggablePanel` (`78adf047`). **[S6]** the residual chrome question was resolved the other way from the audit's sketch: T2.1 removed `PermissionDetailCard`'s second consumer, leaving an 8-prop shell with one caller — slice 6 folded the card into `permissionDetailPanel.tsx` and deleted `permissionDetailCard.tsx`. Node panel keeps its own compact header; the shared part (drag) stays shared. |
| CMP-3 | fixed | `PermissionEntityDetail`/`PermissionDetailValue` deleted; rows use `DefinitionList.Item` `link`/`description`/`copyValue` |
| CMP-4 | fixed | Condition address linked via `buildEntityUrl` everywhere; permission ID copyable, never linked (page + list tests) |
| CMP-5 | fixed | `PermissionEntityBrandId` enum in shared domain; badge from `brandedExternals`; raw `'safe'` literals gone |
| CMP-6 | fixed + **[S6]** | `UnrecognizedConditionSlot` registered; shared `PermissionCondition` is the single dispatch for list + graph. **[S6]** registry is now the sole authority: `NO_CONDITION → NoConditionSlot` registered too, imperative `getSlotComponent` probe deleted from `PermissionCondition`. |
| CMP-7 | fixed | Names sourced from `permissionTransactionUtils.permissionIds`; feature-local constants deleted (pre-existing `permissionNameUtils` internals untouched — out of scope) |
| CMP-8 | fixed | Kit `Avatar` used directly; shared `PermissionInfoTooltip`; no bespoke placeholder circle |

## GRF — graph (GRF-1/2 base; GRF-3/4 fixed)

| ID | Evidence |
|---|---|
| GRF-1 | Subsumption deleted at base (`675a7f9d`); regression test keeps specific creators alongside an open Anyone grant |
| GRF-2 | See CMP-2 |
| GRF-3 | Canvas 957→274-line orchestrator + `permissionGraphCanvasLayout.ts` + `permissionGraphFlowElements.ts` + `permissionGraphHandles.tsx`. **[S6]** tests co-located per module: `permissionsGraphCanvas.test.ts` split into `permissionGraphFlowElements.test.ts` + `permissionGraphCanvasLayout.test.ts` (same `it` bodies) |
| GRF-4 | `getVisibleEdges` and its test deleted (zero references) |

## LST / RSP / LBL (all fixed)

One responsive row/detail implementation (LST-1, RSP-1); condition field always present with `-` (LST-2, CND-3); unrecognized-condition treatment reduced to one `DefinitionList.Item` (LST-3); one text style for the collapsed cell (LST-4, CND-5); header shares the row padding shell and a real invisible chevron spacer, asserted in tests (LST-5); `hasCondition` computed once in `resolveConditionDisplay` (RSP-2); no dead `md:` classes — the subtree renders at all breakpoints (RSP-3); Safe `brandId` hoisted above layer/label fallbacks (LBL-1).

## CND — condition slots (all fixed)

CND-1 voting-token address linked + copyable; CND-2 single shared `PermissionCondition` dispatch; CND-4 slot slimmed to a definition-list item; CND-6 **[S6]** the raw-action fallback is now a direct `AllowedActionsList` + `toAllowedActionViews` call at both call sites — the interim `RawAllowedActionsList` pass-through wrapper was deleted (the audit asked for a fold, not a new indirection).

## VRB — verbosity (VRB-2 base; rest fixed)

VRB-1 see FLT-1; VRB-3 see CMP-3; VRB-4 single `useDao` (page test asserts `useDao` not called by the page); VRB-5 see FLT-6; VRB-6 aliases gone; VRB-7 `addressUtils.isAddressEqual` everywhere.
**[S6] note:** the two `isAddressEqual(address.toLowerCase(), SENTINEL)` calls in `permissionEntityUtils.ts` look redundant but are **load-bearing**: the kit helper checksum-validates via `isAddress` before case-folding, so lowering the input is what makes sentinel matching case-insensitive. A slice-6 attempt to drop them was reverted when the case-insensitivity test failed — the normalization stays, pinned by that test.

## TST — test quality (all fixed)

TST-1 dash parity asserted + divergence removed structurally; TST-2 filter tests mirror the two toggles; TST-3 toggle-disabled covered; TST-4 `buildRow` wraps shared `generateDaoPermission`; TST-5 deleted with GRF-4; TST-6 `renderGuard` helper in the SPP test.
**[S6]** two zero-value tests deleted from `permissionsList.test.tsx`: a byte-identical duplicate whose only extra assertion queried an i18n key that exists nowhere, and a test asserting the absence of pill classes no code emits (its real coverage duplicated by neighbouring tests).

## CNV — conventions

| ID | Disposition | Evidence |
|---|---|---|
| CNV-1 | fixed | One component per file across list and graph trees |
| CNV-2 | excluded | Owner decision: keep `PERMISSION_CONDITION` runtime key; confirmed unchanged, no `SETTINGS_` variant introduced |
| CNV-3 | fixed + **[S6]** | File names match their exports; **[S6]** `permissionDetailContent.test.tsx` renamed to match its unit (was `permissionDetailPanel.test.tsx`); dead re-export shims removed from `permissionGraphNode.tsx` and `permissionDetailPanel.tsx` so each symbol has one import path |

## GAP1 — shared domain (all fixed)

Brand precedence (GAP1-1, see CMP-5/LBL-1); `parentPluginAddress` authoritative with plugin-metadata fallback per AC-2 (GAP1-2); index signature + unsafe casts removed (GAP1-3); unions in `domain/enum/permissionEntity.ts` (GAP1-4); generator extended + `generatePermissionEntityRef`, consumed by the fixture helpers (GAP1-5).
**[S6]** GAP1-4 residue closed: write-only `sourceId`/`targetId`/`visualKind`/`sourcePosition`/`targetPosition` fields removed from the flow-node `data` payloads and their interfaces; `selfTargetId` (genuinely read by the layout) is now properly declared on `IPermissionStackNodeData`.

## GAP2 — rollout gating (all excluded, owner decision 2026-07-31)

Existing `permissionsPage` flag declaration/config retained verbatim; zero gate call sites is the deliberate recorded state (APP-953 complete); the diff touches no flag file. Slice 1 reversed; no new gate wiring authorized.

## GAP3 — branch hygiene

GAP3-1 fixed: graph behind a `dynamic()` barrel with a dedicated lazy-boundary test. GAP3-2 excluded: `cc1a6a2c` design-sync ancestry accepted unchanged; history rewrite requires separate authority. GAP3-3 fixed as a side effect of GAP3-1 (CSS side-effect import loads only inside the lazy chunk). GAP3-4 excluded: legitimate empty `backendApiMocks` array, untouched.

## Slice-6 review decisions (simplification pass)

Applied (all behavior-preserving, proof-gated): fold `RawAllowedActionsList` (CND-6); fold `PermissionDetailCard` into the edge panel (CMP-2 residue); delete dead re-export shims (CNV-3); dissolve `permissionsListTypes.ts` into its two component files; delete two zero-value tests; remove write-only graph-node data fields + honest `selfTargetId` typing (GAP1-4); make the condition registry the sole dispatch authority (CMP-6); split canvas tests per module (GRF-3); make `getEdgeFlow`'s always-passed param required; drop two `graph.edges` aliases.

Final-check additions (2026-08-01, pre-PR): an opus bug hunt over the slice-6 edit set confirmed every fold/repoint behavior-identical (exact test set-diff 22=22 `it`s across the split, no import cycles, byte-identical fold call sites) and surfaced one real gap — the card fold plus test rename had left `PermissionDetailPanel` with zero direct coverage (the graph test mocks the canvas, so the edge-panel branch never renders). Closed by a new `permissionDetailPanel.test.tsx` (header/who/where, conditional condition pill, close-without-drag; 3 tests green). Two accepted notes: condition dispatch now fails **loud** (`UnrecognizedConditionSlot`) instead of quiet if a future isolated test forgets `initialiseConditionRegistry()` — production initializes the registry at module scope in three places; and `buildFlowElements` returns untyped `Node[]` with index-signature data interfaces (pre-existing), so builder/component data drift is grep-territory, not tsc-territory.

Pre-existing, out-of-scope observations for follow-up (present at HEAD, untouched per AC-9): `allowedActionsList.tsx` references the missing i18n key `app.settings.executeSelectorConditionSlot.unknownContract` (renders the raw key when a target contract can't be named), and `getPermissionEdgePath` in `permissionGraphEdge.tsx` declares a never-read `visualKind` param.

Considered and rejected, with rationale:
- Re-slimming `generateDaoPermission` defaults (3 of 4 consumers reset them) — reverses an adversarially-approved slice-5 design for a taste-level win.
- Deleting the `VotingBodyBrandIdentity` → `PermissionEntityBrandId` re-export alias — would churn out-of-scope `sppPlugin` files; the shared-domain enum remains the single definition.
- Unifying the graph detail rows with the list's `DefinitionList` items (last CMP-3 residue) — a mechanical fold changes sentinel-row rendering (label duplication vs copy affordance), i.e. a small visual change needing an owner decision, not a refactor.
- Dropping one of `SafeAccountAvatar`'s three a11y labels — risk of breaking the accessible-name tests exceeds the 1-line win.
- Deleting the generator override-spread test — small but real coverage; removing it would weaken tests.

## Verification at slice-6 close

- Focused suites: 31 suites / 211 tests green (settings module + SPP guard hook + shared generator).
- Full `@aragon/app` jest: 2291/2291 tests pass; 3 suites fail to compile on a Windows-only jest/SVG-transform path quirk in unrelated `daos/xmaquina` (would not reproduce on Linux CI).
- Biome lint: clean (`biome check`, no diagnostics).
- Type-check: baseline-red in the same 69 pre-existing files as before this work; zero diagnostics in changed files (before/after file sets byte-identical).
- `git diff --check`: clean. Scope checks: flag artifacts, slot key, design-sync files untouched; no dangling references to deleted symbols; i18n keys all used.
- Outstanding: manual narrow/wide viewport review and graph drag/fullscreen interaction review in a real browser (jsdom cannot prove geometry) — the only open item, assigned to final human review.
