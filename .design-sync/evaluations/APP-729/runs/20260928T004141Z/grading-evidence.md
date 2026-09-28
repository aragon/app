# Blind grading — run 2 raw findings (no verdict)

Grader: fresh general-purpose subagent. Inputs: handoff.html (sha256 69ff4e85…1121, 22135 B), criteria.json (answer-key required+incorrect only, as run 1), payload/ copy of the 575 files at manifest f1219a8b. Not given: prep, ticket numbers, run-1 failure, defaults exception, audit-provenance rule, the lint complaint.
Blinding limit (as run 1): handoff and payload themselves say "candidate" and name PR numbers.

## A. Criteria
- required[0..5]: satisfied (quoted spans in grader report). required[5] caveats in E.
- incorrect[0] not committed; incorrect[1] not committed; incorrect[2] not committed.
- incorrect[3] COMMITTED, narrowly: "<BlockNavigationContextProvider> // required: Wizard.Root calls useConfirmWizardExit(isDirty)" — bundle 102297 gives the context a no-op default and useBlockNavigationContext (102310–102313) does not throw, so "required" overstates. Same stack attributed to "the generated preview for AddressesInput", which does not contain it. No invented props or source paths.

## B. required[6] sub-claims
1. props exist in d.ts — holds (none missing).
2. stated defaults — partial: none stated in d.ts; all supported by bundle (enforceChecksum=true 101368; AddressInput.chainId default mainnet.id 101368; showResetAllAction=true 108214; mode onTouched 102494).
3. paths + line ranges — partial: all in-project paths exist; all 8 _ds_bundle.js ranges confirm; `_preview/AddressesInput.js L110–120` mismatch (shows Debug>Translations>GukModules>FormWrapper; no BlockNavigationContextProvider, no WizardPage.Container — that comes from _preview/WizardPage.js:110, which lacks GukModulesProvider).
4. revision-matched — holds: cited App 2b512b90, GovKit 64b517f5, registry 3fba4472 all agree with payload. Payload also records audit-time App 3c9bb798 at registry-report.md:7, labelled there as not the bundle's revision; handoff does not cite it.
5. unknowns marked — holds (5 unknown + 1 not-present). Note: "not present" stories/tests are true of the bundle, but source-index.md:995–996, :688 link upstream stories/tests; handoff doesn't mention them.

## C. Citations
Exists: AddressesInput.d.ts/.prompt.md, WizardPage.d.ts, AddressInput.d.ts, _preview/AddressesInput.js, _ds_bundle.js, fonts/fonts.css. Not in payload (upstream only): .design-sync/previews/AddressesInput.tsx (bundle comment), addressesListUtils.ts (bundle comment + source-index.md:689), createDao/… (marked unknown). `createDaoSteps` fixture (_preview/WizardPage.js:111) has network/metadata/governance ids, no "members".

## D. Context use
selection-guide.json / registry-report.md: NOT used or cited; no fact attributed to them. Only overlap: registry SHA in header (present in selection-guide.json:8, index.md:5).

## E. Spot-checks
Confirmed: slice(0,currentIndex) duplicate; null beyond fields.length; mode onTouched; item props index/disabled/customValidator/chainId and wagmiConfig/enforceChecksum/hideControls not forwarded; ENS pinned to mainnet (chainId prop explorer-only; AddressInput.d.ts:38 comment says RPC — bundle matches handoff); ensUniversalResolver gating; remove disabled at one row; onAccept behaviour; GukModulesProvider needed; TranslationsProvider throws; Step renders only when active; re-validation (plus isAddress condition).
Contradicted: "last row is only clearable via the Clear all menu action" and acceptance check 3 — More menu renders only when membersField.length > 1 (~108318), so no Clear all at one row. BlockNavigationContextProvider "required" (see incorrect[3]).

## Evaluator-side external URL resolution (not grader)
All 7 aragon/app@2b512b90 blob paths exist (git cat-file); .design-sync/previews/AddressesInput.tsx exists @2b512b90; createDao/ dir exists; gov-ui-kit@64b517f5:src is a tree, commit on origin/main.
