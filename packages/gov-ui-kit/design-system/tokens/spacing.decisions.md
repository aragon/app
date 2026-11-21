# Semantic spacing: decisions and exceptions

The review list for the spacing layer (`source/spacing.*.tokens.json`, generated into `src/theme/tokens/spacing.css`).
Same shape as the typography and colour records: what the owner decided, the rules that came from the owner's review of
the previews, what was decided provisionally with the reason and the alternative, the role and size tables, and every
exception with its pattern, its Today value against its role and an empty resolution column.

**Status values:** `OWNER` decided by the owner · `PROVISIONAL` decided by Claude on judgement, awaiting review ·
`OPEN` not decided, nothing built on it. [V] measured, [J] judgement.

Sources: the spacing analysis of 21 November 2026 (24,799 rendered spacing instances in 314 kit stories and 121 app
screens at 390 and 1440 px, tied to 430 source places; `scratchpad/spacing/analysis.md`), the owner's review of the
simulated previews, and the phase 1 build (generator, previews, kit core primitives).

## 1. Decided by the owner

| ID | Decision |
| --- | --- |
| O-00 | **What New is** (overrides the analysis): today's design cleaned up, not redesigned. No significant size changes, no qualitative design decisions. Each role's New value is today's dominant value for that job (the on-scale value minimising the change over its places, including whether it steps at md); off-grid values snap to the grid. **Change budget:** in New a place moves at most 4 px where its Today value is ≤ 24 px and 8 px above, at either width; a place that would move more is doing another job (reclassify it, or split the role when ≥ 10 places share the pattern). Looser and compact are one scale step either side of New. |
| O-01 | Withdrawn by O-00 (the stepped ladder 8→12 / 16→24 / 24→40). |
| O-02 | Withdrawn by O-00 (page gutter 32): the gutter's New value is today's dominant 16→24. |
| O-03 | Looser keeps New's phone values for `inset-page` and `inset-item` (looser grows those on desktop only); applied to `inset-item-flat` too. |
| O-04 | Geometry stays allowlisted as the only raw numbers New keeps: avatar-stack overlaps, ≤ 2 px optical nudges, the explore hero pulled up by the header height, page main's `lg:px-28` (rewritten as a max-width). |
| O-05 | Defaults stay Today; no user-facing toggle. Previews: the Storybook "Spacing" toolbar control and the app debug panel select "Spacing (GovKit preview)" (Today / New / New, looser / New, compact; values `today`, `new`, `looser`, `compact`), cookie `aragon.debug.spacingPreview`, `data-spacing` on `<html>` rendered by the server in `layoutRoot.tsx`, ignored unless the `debugPanel` flag is on. |
| O-06 | **The app chrome moves gently.** The navigation chrome (sidebar nav, links, groups and footer, the top and mobile header bars, the mobile nav menu, the app footer) has its own roles: New = Today snapped to the grid; looser and compact move it by at most the smallest scale step, clearly less than content, never enough to push the sidebar footer out of view at 1440. |

## 2. Rules from the owner's review of the previews

| ID | Rule |
| --- | --- |
| R-01 | Padding never takes a gap role. An element with a background, border or click target takes an inset or control role; padding on anything else is spacing between siblings: Today keeps it through an `inset-flush--<pattern>` exception, New makes it 0 and the parent's gap carries the space. (The classifier had mapped 531 instances in 22 places this way; the kit ones are converted, the app ones are listed in CONVERSION.md.) |
| R-02 | Field wrappers, search bars, input boxes and the rich-text editor are controls (`control-lg` height and padding), never surfaces. The editor's toolbar-to-content spacing is control padding that does not grow in looser (pad-y 12 in looser). |
| R-03 | A caption/count/status line attached to a list belongs to that list (gap-related to the list, the group gap between the filter bar and the caption+list block, its text aligned with the row inset in New) and has no padding of its own in New. |
| R-04 | No stacked spacing: an element without background or border must not carry padding that adds to its parent's gap in New. |
| R-05 | Header and top bars are chrome: their height comes from their controls, their vertical padding is a small chrome value that does not change with density; never `inset-page`. |
| R-06 | Avatar-only and icon-only buttons stay square/circular: their padding is frame geometry (equal on all sides, density-invariant), never control pad-x; only a label beside the avatar is control padding. |
| R-07 | The app footer (both the page footer and the sidebar footer) is chrome under O-06. |
| R-08 | Checks in every New mode, on all stories and screens: dead space (whitespace between content boxes growing > 50 % and > 16 px; single-line elements with more than 2× their height of combined spacing), square icon/avatar buttons (|w − h| ≤ 1 px), chrome bars changing height by ≤ 4 px, the sidebar footer in view at 1440, and the change budget (max and mean change reported). |
| R-09 | Today stays pixel-identical: kit visual-diff 0 of 314, app baseline 0 of 121, per-element padding/margin/gap/height identical at 390 and 1440, and the class-ordering audit for every `className` passed into a converted component. |

## 3. Provisional decisions (made by Claude; review each)

| ID | Decision | Why | Alternative |
| --- | --- | --- | --- |
| P-01 | Utilities `<family>-<role>` (`px-inset-item`, `p-inset-surface`), gap roles without their `gap-` prefix (`gap-group`, `gap-x-related`, `mt-section`, `space-y-tight`), sizes `<family>-<size>` (`h-control-md`, `px-tag`, `min-h-row`), exceptions `<family>-<role>--<pattern>` with the pattern spelling the Today value (`fixed-24`, `12-16`). | One spelling for token, class and report; `gap-gap-group` would read badly; the generator rejects an exception whose prefix is not a role or size. | Short role names (`p-item`, `p-surface`). |
| P-02 | Every utility has the same shape: the base value and the md value through Tailwind's `md` variant inside the utility, even when equal (sizes included). Variables `--space-<name>[-<axis|dimension>][-md]` on `:root` (Today) and `[data-spacing="…"]`; nothing in Tailwind's `--spacing-*` namespace. | The md step follows whatever `md` means where the CSS is compiled (the app column's container query); one shape makes the sort order uniform (P-03); the `--spacing-*` namespace would create `w-`, `size-`, `inset-` utilities from every role (verified). | Single-declaration utilities for unstepped roles (mixed sort order). |
| P-03 | Class ordering: a generated utility declares its property twice, so Tailwind sorts it before every raw class of the same property: a raw class in `className` always beats a role, between roles the later name wins. Audit (`order-audit.mjs`): 242 call sites passing spacing classes into the converted components, 7 flipped and were rewritten to render Today again (connectWalletDialog, wizardDetailsDialog, lockToVote/token setup governance, governanceStageBodiesField, setupStrategyDialogDistributionRecipients, assetAddressSelectAddAddressView); 0 flips after. | The trap returns with every conversion; the rule "raw beats role" is simpler than "larger number wins". | tailwind-merge (not in the stack). |
| P-04 | Role values recomputed by O-00 from the classified places (`build/reassign.cjs`): the L1-optimal on-scale pair per role; places outside the budget moved to the neighbouring level whose New fits (e.g. 10 group places at 8→12 became related). Splits where ≥ 10 places share a pattern: `gap-group-stepped` (28 places at 16→24), `gap-section-wide` (11 at 40), `inset-item-flat` (15 x / 23 y places at one value), `inset-surface-flat` (21 / 19), `inset-surface-wide` (24 at every width: aside cards and the 19 `p-6` Card call sites). Before splitting, 50 gap-group places and 20 gap-section places were over budget; after, 9 gap places and the listed inset outliers remain (judgement). | The owner asked for data-chosen values and a budget, not a ladder. | Keep one role per level and accept exceptions over budget. |
| P-05 | `inset-tight` New is 4 on both axes (Today 2). | Its x places tie between 2 and 4 by total change; 4 keeps the dropdown popover's 8 within the budget; y follows x so a chip stays even. Compact has a floor of 2. | 2 (the modal value). |
| P-06 | `inset-flush`: a role whose value is 0 in every mode, for R-01 padding; its exceptions are exempt from the budget (`budgetExemptRoles`), checked by the dead-space audit instead. Used in the kit for the dialog header's and description's bottom padding and the data list status line. | Makes R-01 expressible without a gap role on padding. | Restructure every such place now (parent gaps): done where the box is identical (dialog footer actions: `pt` → `mt-group-stepped`). |
| P-07 | Navigation chrome roles: `inset-nav` (sidebar panel 12 × 16), `inset-nav-item` (nav link 16 × 12; y does not change with density: a step on every link adds 8 px per link and would push the sidebar footer out at 1440), `inset-nav-bar` (header bars and mobile menu, 16→24 × 12→20, density-invariant so a bar changes height by ≤ 4 px), `gap-nav-tight/related/group/section` (4 / 8 / 16 / 24). Rule enforced by the generator: New = Today snapped; looser and compact = New or one scale step. Chrome exceptions carry their own snapped values. | O-06, R-05, R-07; the chrome's Today values are already on the grid. | One step on every chrome dimension (fails the footer and bar checks). |
| P-08 | `Card` gets `inset?: 'none' \| 'surface' \| 'surface-flat' \| 'surface-wide'`, default `none`. | Card adds no padding today and is published: a `surface` default would change every content-padded call site and every external consumer. Call sites move from `className="p-6"` to `inset="surface-wide"` in the app batches. | Default `surface` (analysis D-12) with `none` on the 28 content-padded call sites. |
| P-09 | Button maps `size` / `responsiveSize` to `h-control-*`, `px-control-*`, `gap-control-*`, icon-only `w-control-*` (width follows the height token, so it stays square in every mode); the label wrapper is `px-control-label`. Toggle: `h-control-sm md:h-control-md`, `px-control-md md:px-control-lg`. Choice labels (checkbox, radio, switch): `pl-control-sm--8-12`. | The control size is the job; the responsive maps keep their per-breakpoint classes. | A control utility per size × breakpoint. |
| P-10 | The data list search bar: `py-control-lg`, its left padding `pl-inset-item--12-24` (it aligns the search icon with the row content inset), its right padding `pr-control-md--8-12`, the clear button's distance `mr-related--8-16`; the clear button's `p-2.5` and the spinner's `m-1` stay as frame geometry. | R-02 with the budget: control-lg pad-x (16) is 8 px from Today's 24 at desktop. | `px-control-lg` (over budget). |
| P-11 | The data list status line: `px-inset-item-flat--fixed-12` (New 16) and `py-inset-flush--fixed-10` (New 0). | R-03 within the budget at phone; full alignment with the 24 px desktop row inset would move it 12 px (over budget) and needs the caption+list restructure (OPEN-1). | Leave it raw. |
| P-12 | Raw classes left in kit core: `emptyState` stacked `p-6 md:p-12` (no role within the budget), `radioCard` `gap-x-0.5 md:gap-x-4` (2→16), `dialogHeader` `pr-14 md:pr-16` (room for the absolute close button = surface inset + the button), `checkboxCard` `mt-0.5 md:mt-1` (optical nudges of 2→4 px that follow the line height), and the frame geometry of R-06 (`p-1`, `p-2.5`, `m-1`). | No role fits, or the number is geometry; listed for the owner and the judgement pass. | Widen the allowlist, or budget-exempt exceptions. |
| P-13 | The definition list's column gap is `md:gap-x-group-stepped`: the grid only has columns from md. A phone `gap-x` on the flex column would change the computed column gap (invisible) and fail the per-element proof. | Exact per-element Today. | `gap-x-group-stepped` on the base class. |
| P-14 | Tooling for the batches (scratchpad `spacing/tools/`): `today-check.mjs` (fast Today check of a diff), `sync-exceptions.mjs` (adds used exceptions to the source), `order-audit.mjs`, `compare-records.cjs` (per-element proof), `mode-audit.cjs` (R-08 checks), `app-capture.sh`, `remaining.cjs`. | Each batch can prove Today in seconds before the full proofs. | Only the full captures. |

## 4. Proofs of phase 1 (21 November 2026)

Today [V]: kit `visual-diff` against `origin/tokens/pipeline`: 314 of 314 stories identical (one new story,
`core-cards-card--inset`, only in head). App baseline (production build, mock backend, base = a worktree of
`origin/tokens/pipeline`): 121 of 121 screens identical at zero tolerance. Per-element records (padding, margin, row and
column gap, height, width, min-height of every recorded element, at 390 and 1440): app 45,079 identical, 0 differ; kit
9,829 identical, 2 differ: the dialog footer's actions row (story `dialog-footer--with-children`), whose 16→24 px top
padding became a top margin of the same size (`mt-group-stepped`), pixel-identical (auto-margin slack ignored). Class
ordering: 242 call sites, 0 flips after the 7 rewrites (P-03).

New-mode audits (R-08) on the phase 1 state (kit core converted, the app not yet) [V]:

| Scope / mode | Changed values, mean / max | Dead space | Single-line, grown | Square buttons | Chrome bars > 4 px | Sidebar footer | Over budget |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kit New | 1,421, 3.46 / 4 px | 0 | 0 | 0 | 0 | 0 | 0 |
| kit looser | 5,761, 4.10 / 12 px | 0 | 2 (proposal decoder, empty parameter row) | 0 | 0 | 0 | (informational) |
| kit compact | 5,853, 3.98 / 8 px | 0 | 0 | 0 | 0 | 0 | (informational) |
| app New | 5,115, 3.42 / 4 px | 0 | 18 (radio cards of the members aside, 44→52) | 0 | 0 | 0 | 0 |
| app looser | 15,373, 4.10 / 12 px | 0 | 75 (48 views) | 0 | 23 (the proposal page `<header>` at 390, content, 224→232) | 0 | (informational) |
| app compact | 14,777, 3.84 / 8 px | 0 | 0 | 0 | 0 | 0 | (informational) |

`inset-flush` values set to 0 by rule are counted apart (kit 108 in New, app 40). The chrome checks pass trivially until
the app batches move the chrome to its roles; the looser "Developer portal" wrap in the connect-wallet dialog is app
code and is re-checked after batch A1.

## 5. Open

| ID | Question |
| --- | --- |
| OPEN-1 | The data list caption+list block (R-03 in full): the status line and the list share one container with the related gap; needs a DataList structure change (DataListRoot children order is chosen by consumers). |
| OPEN-2 | Gap pairs no role fits within the budget (24→40 page header, 24→48 landing / explore nav / wizard step, 40→64, 24→64, 12→0 and 4→0 footer and DAO item flips, 0→36, 2→16) and the inset outliers (emptyState stacked, landing 24→72, page 72→96 / 40→64 / 40→80): split roles or allowlist. |

## 6. Roles

Generated by `pnpm tokens:report` (px, phone→desktop; uses and files: a scan of the four scopes).

| Role | Kind | Today | New | Looser | Compact | Uses | Files |
| --- | --- | --- | --- | --- | --- | --- | --- |
| inset-tight | inset | x 2 · y 2 | x 4 · y 4 | x 6 · y 6 | x 2 · y 2 | 1 | 1 |
| inset-item | inset | x 16→24 · y 12→20 | x 16→24 · y 12→20 | x 16→32 · y 12→24 | x 12→20 · y 8→16 | 16 | 14 |
| inset-item-flat | inset | x 16 · y 12 | x 16 · y 12 | x 16→20 · y 12→16 | x 12 · y 8 | 2 | 1 |
| inset-surface | inset | x 16→24 · y 16→24 | x 16→24 · y 16→24 | x 20→32 · y 20→32 | x 12→20 · y 12→20 | 21 | 16 |
| inset-surface-flat | inset | x 16 · y 12 | x 16 · y 12 | x 20 · y 16 | x 12 · y 8 | 4 | 3 |
| inset-surface-wide | inset | x 24 · y 24 | x 24 · y 24 | x 32 · y 32 | x 20 · y 20 | 5 | 5 |
| inset-page | inset | x 16→24 · y 24→40 | x 16→24 · y 24→40 | x 16→32 · y 24→48 | x 16→20 · y 20→32 | 3 | 3 |
| inset-flush | inset | x 0 · y 0 | x 0 · y 0 | x 0 · y 0 | x 0 · y 0 | 0 | 0 |
| gap-tight | gap | 4 | 4 | 6 | 2 | 28 | 23 |
| gap-related | gap | 12 | 8→12 | 12→16 | 6→8 | 39 | 30 |
| gap-group | gap | 16 | 16 | 20 | 12 | 24 | 20 |
| gap-group-stepped | gap | 16→24 | 16→24 | 20→32 | 12→20 | 16 | 15 |
| gap-section | gap | 24 | 24 | 32 | 20 | 14 | 10 |
| gap-section-wide | gap | 40 | 40 | 48 | 32 | 1 | 1 |
| gap-layout | gap | 40→80 | 40→80 | 48→80 | 32→64 | 1 | 1 |
| inset-nav | inset (chrome) | x 12 · y 16 | x 12 · y 16 | x 16 · y 20 | x 8 · y 12 | 2 | 1 |
| inset-nav-item | inset (chrome) | x 16 · y 12 | x 16 · y 12 | x 20 · y 12 | x 12 · y 12 | 4 | 3 |
| inset-nav-bar | inset (chrome) | x 16→24 · y 12→20 | x 16→24 · y 12→20 | x 16→24 · y 12→20 | x 16→24 · y 12→20 | 0 | 0 |
| gap-nav-tight | gap (chrome) | 4 | 4 | 6 | 2 | 2 | 2 |
| gap-nav-related | gap (chrome) | 8 | 8 | 12 | 6 | 2 | 2 |
| gap-nav-group | gap (chrome) | 16 | 16 | 20 | 12 | 4 | 2 |
| gap-nav-section | gap (chrome) | 24 | 24 | 32 | 20 | 2 | 2 |

## 7. Component sizes

| Size | Today | New | Looser | Compact | Uses | Files |
| --- | --- | --- | --- | --- | --- | --- |
| control-sm | height 32 · pad-x 8 · gap 2 | height 32 · pad-x 8 · gap 2 | height 36 · pad-x 12 · gap 4 | height 28 · pad-x 6 · gap 2 | 30 | 6 |
| control-md | height 40 · pad-x 12 · gap 4 | height 40 · pad-x 12 · gap 4 | height 44 · pad-x 16 · gap 6 | height 36 · pad-x 8 · gap 4 | 30 | 5 |
| control-lg | height 48 · pad-x 16 · pad-y 12 · gap 4 | height 48 · pad-x 16 · pad-y 12 · gap 4 | height 52 · pad-x 20 · pad-y 12 · gap 6 | height 44 · pad-x 12 · pad-y 8 · gap 4 | 41 | 12 |
| tag | height 20→24 · pad-x 6→8 | height 20→24 · pad-x 6→8 | height 24 · pad-x 8 | height 20 · pad-x 6 | 4 | 2 |
| control-label | pad-x 4 | pad-x 4 | pad-x 4 | pad-x 4 | 1 | 1 |
| row | height 56 | height 56 | height 64 | height 48 | 0 | 0 |

Controls are at least 24 px in every mode and 28 px in compact; on coarse pointers compact control heights fall back to
New. Icons, avatars, choice indicators, content floors (`min-w-20/24/28`), borders and radii are not tokens.

## 8. Exceptions

Generated by `pnpm tokens:report`. The resolution column is empty on purpose: each exception is resolved by dropping it,
moving its places to another role, or promoting it, and recorded in its `resolution` extension. The generator fails
when an exception is missing here or moves over the O-00 budget (except `inset-flush`, P-06).

| Exception | Role | Families | Pattern | Today | Role Today | Role New | Uses | Places | Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| control-lg--fixed-16 | control-lg | py | unstepped (one value at every width) | 16 | pad-y 12 | pad-y 12 | 1 | `core/components/forms/textAreaRichText/textAreaRichText.tsx` |  |
| control-md--8-12 | control-md | pr | steps 8 → 12 at md | 8→12 | pad-x 12 | pad-x 12 | 1 | `core/components/dataList/dataListFilter/dataListFilter.tsx` |  |
| control-sm--8-12 | control-sm | pl, pr | steps 8 → 12 at md | 8→12 | pad-x 8 | pad-x 8 | 5 | `core/components/forms/checkbox/checkbox.tsx`, `core/components/forms/radio/radio.tsx`, `core/components/forms/switch/switch.tsx` |  |
| gap-group--12-16 | gap-group | gap, gap-x, space-y | steps 12 → 16 at md | 12→16 | 16 | 16 | 11 | `core/components/dataList/dataListActionItem/dataListActionItem.tsx`, `core/components/dialogs/dialog/dialogFooter/dialogFooter.tsx`, `core/components/dialogs/dialogAlert/dialogAlertFooter/dialogAlertFooter.tsx`, `core/components/forms/checkboxCard/checkboxCard.tsx`, `modules/components/proposal/proposalActions/proposalActionsRoot/proposalActionsRoot.tsx`, `modules/components/proposal/proposalVoting/proposalVotingContainer/proposalVotingContainer.tsx`, `shared/components/policyDataListItem/policyDataListItem.tsx`, `shared/components/processDataListItem/processDataListItem.tsx`, `core/components/forms/radioCard/radioCard.tsx`, `core/components/states/emptyState/emptyState.tsx` |  |
| gap-group--fixed-20 | gap-group | gap, ml | unstepped (one value at every width) | 20 | 16 | 16 | 1 | `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.tsx` |  |
| gap-group-stepped--16-20 | gap-group-stepped | gap | steps 16 → 20 at md | 16→20 | 16→24 | 16→24 | 1 | `core/components/cards/cardSummary/cardSummary.tsx` |  |
| gap-group-stepped--20-24 | gap-group-stepped | gap | steps 20 → 24 at md | 20→24 | 16→24 | 16→24 | 2 | `modules/components/proposal/proposalActions/proposalActionsDecoder/proposalActionsDecoder.tsx`, `modules/components/proposal/proposalActions/proposalActionsDecoder/proposalActionsDecoderField/proposalActionsDecoderField.tsx` |  |
| gap-related--12-16 | gap-related | gap, gap-x, gap-y, space-x | steps 12 → 16 at md | 12→16 | 12 | 8→12 | 13 | `modules/components/asset/assetDataListItem/assetDataListItemStructure/assetDataListItemStructure.tsx`, `modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemStructure/smartContractFunctionDataListItemStructure.tsx`, `modules/components/transaction/transactionDataListItem/transactionDataListItemSkeleton/transactionDataListItemSkeleton.tsx`, `modules/components/transaction/transactionDataListItem/transactionDataListItemStructure/transactionDataListItemStructure.tsx`, `modules/components/vote/voteDataListItem/voteDataListItemSkeleton/voteDataListItemSkeleton.tsx`, `modules/components/vote/voteDataListItem/voteDataListItemStructure/voteDataListItemStructure.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemStructure/voteProposalDataListItemStructure.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx`, `modules/components/member/memberDataListItem/memberDataListItemSkeleton/memberDataListItemSkeleton.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemSkeleton/proposalDataListItemSkeleton.tsx`, `modules/components/asset/assetTransfer/assetTransfer.tsx` |  |
| gap-related--12-8 | gap-related | gap | steps down 12 → 8 at md | 12→8 | 12 | 8→12 | 1 | `shared/components/forms/resourcesInput/resourcesInput.tsx` |  |
| gap-related--6-12 | gap-related | gap | steps 6 → 12 at md | 6→12 | 12 | 8→12 | 1 | `shared/components/wizards/wizardPage/wizardPageContainer/wizardPageContainerProgress.tsx` |  |
| gap-related--8-10 | gap-related | gap, gap-y | steps 8 → 10 at md | 8→10 | 12 | 8→12 | 1 | `modules/components/member/memberDataListItem/memberDataListItemSkeleton/memberDataListItemSkeleton.tsx` |  |
| gap-related--8-12 | gap-related | gap, gap-x, gap-y | steps 8 → 12 at md | 8→12 | 12 | 8→12 | 22 | `core/components/dataList/dataListFilter/dataListFilter.tsx`, `core/components/forms/checkboxGroup/checkboxGroup.tsx`, `core/components/forms/inputContainer/inputContainer.tsx`, `core/components/forms/textAreaRichText/textAreaRichTextActions.tsx`, `core/components/toggles/toggleGroup/toggleGroup.tsx`, `modules/components/action/actionSimulation/actionSimulation.tsx`, `shared/components/forms/resourcesInput/resourcesInput.tsx`, `shared/components/pluginFilterComponent/pluginFilterComponent.tsx`, `shared/components/transactionStatus/transactionStatusContainer/transactionStatusContainer.tsx`, `shared/components/transactionStatus/transactionStatusStep/transactionStatusStep.tsx`, `core/components/alerts/alertCard/alertCard.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemStatus/proposalDataListItemStatus.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemStructure/proposalDataListItemStructure.tsx`, `modules/components/proposal/proposalVoting/proposalVotingBodySummaryListItem/proposalVotingBodySummaryListItem.tsx`, `core/components/accordion/accordionContainer/accordionContainer.tsx`, `core/components/forms/radioGroup/radioGroup.tsx`, `modules/components/asset/assetTransfer/assetTransfer.tsx`, `modules/components/transaction/transactionDetail/transactionDetailRoot/transactionDetailRoot.tsx`, `shared/components/page/pageHeader/pageHeader.tsx` |  |
| gap-related--8-16 | gap-related | gap, mr | steps 8 → 16 at md | 8→16 | 12 | 8→12 | 1 | `core/components/dataList/dataListFilter/dataListFilter.tsx` |  |
| gap-related--fixed-10 | gap-related | gap, gap-y | unstepped (one value at every width) | 10 | 12 | 8→12 | 1 | `modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.tsx` |  |
| gap-related--fixed-8 | gap-related | gap, gap-x, gap-y | unstepped (one value at every width) | 8 | 12 | 8→12 | 34 | `core/components/dataList/dataListContainer/dataListContainer.tsx`, `modules/components/action/actionSimulation/actionSimulation.tsx`, `modules/components/addressInput/addressInput.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx`, `modules/components/proposal/proposalActions/proposalActionsDecoder/proposalActionsDecoderField/proposalActionsDecoderField.tsx`, `modules/components/proposal/proposalVoting/proposalVotingBodyContent/proposalVotingBodyContent.tsx`, `modules/components/proposal/proposalVoting/proposalVotingStatus/proposalVotingStatus.tsx`, `modules/components/proposal/proposalVoting/proposalVotingStatus/proposalVotingStatusAdvanceable.tsx`, `shared/components/daoTargetIndicator/daoTargetIndicator.tsx`, `shared/components/forms/advancedDateInput/advancedDateInput.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputItem.tsx`, `shared/components/forms/numberProgressInput/numberProgressInput.tsx`, `shared/components/forms/resourcesInput/resourcesInputItem.tsx`, `shared/components/governanceBodyInfo/governanceBodyInfo.tsx`, `shared/components/page/pageAsideCard/pageAsideCard.tsx`, `shared/components/page/pageMainSection/pageMainSection.tsx`, `shared/components/policyDataListItem/policyDataListItem.tsx`, `shared/components/processDataListItem/processDataListItem.tsx`, `shared/components/transactionStatus/transactionStatusStep/transactionStatusStep.tsx`, `shared/components/wizards/wizardPage/wizardPageStep/wizardPageStep.tsx`, `modules/components/asset/assetDataListItem/assetDataListItemStructure/assetDataListItemStructure.tsx`, `modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemSkeleton/smartContractFunctionDataListItemSkeleton.tsx`, `core/components/definitionList/definitionListItem/definitionListItem.tsx`, `core/components/dialogs/dialog/dialogHeader/dialogHeader.tsx`, `core/components/toggles/toggleGroup/toggleGroup.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.tsx`, `modules/components/member/memberDataListItem/memberDataListItemStructure/memberDataListItemStructure.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemSkeleton/proposalDataListItemSkeleton.tsx` |  |
| gap-section--24-28 | gap-section | gap, ml | steps 24 → 28 at md | 24→28 | 24 | 24 | 1 | `core/components/alerts/alertCard/alertCard.tsx` |  |
| gap-section--24-32 | gap-section | gap, gap-y | steps 24 → 32 at md | 24→32 | 24 | 24 | 1 | `modules/components/proposal/proposalActions/proposalActionsItem/proposalActionsItem.tsx` |  |
| gap-section-wide--fixed-48 | gap-section-wide | gap | unstepped (one value at every width) | 48 | 40 | 40 | 1 | `shared/components/page/pageMain/pageMain.tsx` |  |
| gap-tight--2-4 | gap-tight | gap, gap-x, gap-y, space-y | steps 2 → 4 at md | 2→4 | 4 | 4 | 9 | `core/components/forms/checkboxCard/checkboxCard.tsx`, `core/components/forms/inputContainer/inputContainer.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemStructure/proposalDataListItemStructure.tsx`, `core/components/definitionList/definitionListItem/definitionListItem.tsx`, `core/components/forms/radioCard/radioCard.tsx`, `core/components/link/link/link.tsx`, `modules/components/transaction/transactionDataListItem/transactionDataListItemStructure/transactionDataListItemStructure.tsx`, `core/components/states/emptyState/emptyState.tsx` |  |
| gap-tight--4-6 | gap-tight | gap, gap-x, gap-y | steps 4 → 6 at md | 4→6 | 4 | 4 | 8 | `core/components/link/link/link.tsx`, `modules/components/vote/voteDataListItem/voteDataListItemStructure/voteDataListItemStructure.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemStructure/voteProposalDataListItemStructure.tsx`, `modules/components/asset/assetDataListItem/assetDataListItemSkeleton/assetDataListItemSkeleton.tsx`, `modules/components/vote/voteDataListItem/voteDataListItemSkeleton/voteDataListItemSkeleton.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.tsx` |  |
| gap-tight--4-8 | gap-tight | gap, gap-x, space-y, mb | steps 4 → 8 at md | 4→8 | 4 | 4 | 5 | `modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx`, `modules/components/vote/voteDataListItem/voteDataListItemStructure/voteDataListItemStructure.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemStructure/voteProposalDataListItemStructure.tsx`, `core/components/states/emptyState/emptyState.tsx`, `shared/components/transactionStatus/transactionStatusContainer/transactionStatusContainer.tsx` |  |
| gap-tight--fixed-2 | gap-tight | gap, gap-x | unstepped (one value at every width) | 2 | 4 | 4 | 4 | `modules/components/proposal/proposalVoting/proposalVotingProgress/proposalVotingProgressItem.tsx`, `modules/components/proposal/proposalVoting/proposalVotingStatus/proposalVotingStatus.tsx`, `modules/components/proposal/proposalVoting/proposalVotingStatus/proposalVotingStatusAdvanceable.tsx`, `core/components/breadcrumbs/breadcrumbs.tsx` |  |
| gap-tight--fixed-6 | gap-tight | gap, gap-y | unstepped (one value at every width) | 6 | 4 | 4 | 4 | `core/components/dataList/dataListContainer/dataListContainerSkeletonLoader.tsx`, `core/components/dropdown/dropdownContainer/dropdownContainer.tsx`, `modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemStructure/smartContractFunctionDataListItemStructure.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx` |  |
| gap-tight--fixed-8 | gap-tight | gap, gap-x, ml | unstepped (one value at every width) | 8 | 4 | 4 | 5 | `core/components/clipboard/clipboard.tsx`, `core/components/alerts/alertInline/alertInline.tsx`, `core/components/breadcrumbs/breadcrumbs.tsx`, `core/components/cards/cardSummary/cardSummary.tsx`, `core/components/collapsible/collapsible.tsx` |  |
| inset-flush--0-24 | inset-flush | py | steps 0 → 24 at md | 0→24 | y 0 | y 0 | 1 | `modules/components/asset/assetTransfer/assetTransferAddress/assetTransferAddress.tsx` |  |
| inset-flush--12-16 | inset-flush | pb | steps 12 → 16 at md | 12→16 | y 0 | y 0 | 3 | `core/components/dialogs/dialog/dialogContent/dialogContent.tsx`, `core/components/dialogs/dialog/dialogHeader/dialogHeader.tsx`, `shared/components/transactionDialog/transactionDialogShell.tsx` |  |
| inset-flush--6-8 | inset-flush | pb | steps 6 → 8 at md | 6→8 | y 0 | y 0 | 1 | `core/components/dialogs/dialog/dialogHeader/dialogHeader.tsx` |  |
| inset-flush--fixed-10 | inset-flush | py | unstepped (one value at every width) | 10 | y 0 | y 0 | 1 | `core/components/dataList/dataListFilter/dataListFilterStatus.tsx` |  |
| inset-flush--fixed-12 | inset-flush | px, py | unstepped (one value at every width) | 12 | x 0 · y 0 | x 0 · y 0 | 2 | `shared/components/forms/autocompleteInput/autocompleteInputMenu.tsx`, `shared/components/page/pageHeader/pageHeader.tsx` |  |
| inset-item--12-16 | inset-item | py | steps 12 → 16 at md | 12→16 | y 12→20 | y 12→20 | 3 | `core/components/definitionList/definitionListItem/definitionListItem.tsx`, `core/components/forms/checkboxCard/checkboxCard.tsx`, `core/components/forms/radioCard/radioCard.tsx` |  |
| inset-item--12-24 | inset-item | py, pl | steps 12 → 24 at md | 12→24 | y 12→20 · x 16→24 | y 12→20 · x 16→24 | 3 | `shared/components/policyDataListItem/policyDataListItem.tsx`, `shared/components/processDataListItem/processDataListItem.tsx`, `core/components/dataList/dataListFilter/dataListFilter.tsx` |  |
| inset-item--16-24 | inset-item | py, pb | steps 16 → 24 at md | 16→24 | y 12→20 | y 12→20 | 8 | `core/components/dataList/dataListContainer/dataListContainerSkeletonLoader.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.tsx`, `modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx`, `modules/components/member/memberDataListItem/memberDataListItemSkeleton/memberDataListItemSkeleton.tsx`, `modules/components/member/memberDataListItem/memberDataListItemStructure/memberDataListItemStructure.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemSkeleton/proposalDataListItemSkeleton.tsx`, `modules/components/proposal/proposalDataListItem/proposalDataListItemStructure/proposalDataListItemStructure.tsx`, `core/components/accordion/accordionItemContent/accordionItemContent.tsx` |  |
| inset-item-flat--fixed-12 | inset-item-flat | px | unstepped (one value at every width) | 12 | x 16 | x 16 | 3 | `core/components/dataList/dataListFilter/dataListFilterStatus.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputGroup.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputItem.tsx` |  |
| inset-item-flat--fixed-16 | inset-item-flat | py, pb | unstepped (one value at every width) | 16 | y 12 | y 12 | 3 | `modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemSkeleton/smartContractFunctionDataListItemSkeleton.tsx`, `modules/components/transaction/transactionDataListItem/transactionDataListItemSkeleton/transactionDataListItemSkeleton.tsx`, `modules/components/action/actionSimulation/actionSimulation.tsx` |  |
| inset-item-flat--fixed-8 | inset-item-flat | py | unstepped (one value at every width) | 8 | y 12 | y 12 | 2 | `shared/components/forms/autocompleteInput/autocompleteInputGroup.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputItem.tsx` |  |
| inset-nav-bar--fixed-16 | inset-nav-bar | px | unstepped (one value at every width) | 16 | x 16→24 | 16 (chrome) | 3 | `shared/components/navigation/navigationDialog/navigationDialog.tsx` |  |
| inset-nav-item--fixed-4 | inset-nav-item | py | unstepped (one value at every width) | 4 | y 12 | 4 (chrome) | 1 | `shared/components/navigation/navigationLinks/navigationLinksGroup.tsx` |  |
| inset-surface--12-20 | inset-surface | py | steps 12 → 20 at md | 12→20 | y 16→24 | y 16→24 | 1 | `core/components/alerts/alertCard/alertCard.tsx` |  |
| inset-surface--12-24 | inset-surface | py | steps 12 → 24 at md | 12→24 | y 16→24 | y 16→24 | 1 | `modules/components/proposal/proposalVoting/proposalVotingProgress/proposalVotingProgressContainer.tsx` |  |
| inset-surface--16-20 | inset-surface | py | steps 16 → 20 at md | 16→20 | y 16→24 | y 16→24 | 2 | `core/components/cards/cardSummary/cardSummary.tsx`, `core/components/states/emptyState/emptyState.tsx` |  |
| inset-surface-flat--fixed-16 | inset-surface-flat | p, py | unstepped (one value at every width) | 16 | y 12 · x 16 | y 12 · x 16 | 4 | `modules/components/proposal/proposalActions/proposalActionsDecoder/proposalActionsDecoderField/proposalActionsDecoderField.tsx`, `shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx`, `shared/components/statCard/statCard.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputMenu.tsx` |  |
| inset-surface-flat--fixed-8 | inset-surface-flat | pb | unstepped (one value at every width) | 8 | y 12 | y 12 | 1 | `core/components/dialogs/dialogAlert/dialogAlertHeader/dialogAlertHeader.tsx` |  |
| inset-tight--4-2 | inset-tight | py | steps down 4 → 2 at md | 4→2 | y 2 | y 4 | 2 | `modules/components/vote/voteDataListItem/voteDataListItemSkeleton/voteDataListItemSkeleton.tsx`, `modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.tsx` |  |
| inset-tight--fixed-4 | inset-tight | pt, pb | unstepped (one value at every width) | 4 | y 2 | y 4 | 4 | `core/components/accordion/accordionItemContent/accordionItemContent.tsx`, `modules/components/action/actionSimulation/actionSimulation.tsx`, `shared/components/forms/autocompleteInput/autocompleteInputMenu.tsx` |  |
| inset-tight--fixed-6 | inset-tight | px | unstepped (one value at every width) | 6 | x 2 | x 4 | 1 | `core/components/tooltip/tooltip.tsx` |  |
| inset-tight--fixed-8 | inset-tight | p | unstepped (one value at every width) | 8 | y 2 · x 2 | y 4 · x 4 | 1 | `core/components/dropdown/dropdownContainer/dropdownContainer.tsx` |  |

Change in New (decision 0 budget): max 4px over roles and exceptions; exceptions mean 1.95px per side (weighted by places); 6 exempt sides (inset-flush).
