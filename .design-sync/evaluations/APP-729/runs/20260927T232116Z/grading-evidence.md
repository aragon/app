# Blind grading — raw report

Grader: fresh general-purpose subagent. Inputs: handoff.html (sha256 7d1e401a…b538), criteria.json (answer-key.json `required` + `incorrect` only; frozen interpretation/expectation fields withheld because they name arms), payload/ copy of the 575 delivered files. Not given: prep, ticket numbers, defaults exception, merge dependency.
Blinding limit: the handoff and payload themselves contain "candidate" / ticket ids.

## Verdicts (as returned)
- required[0] satisfied — "AddressesInput.Container/AddressesInput.Item (App, group forms), which internally compose the kit's AddressInput."
- required[1] satisfied — "The wizard owns the form. The step contributes a field array"
- required[2] satisfied — "Pass existing members through WizardPage.Container defaultValues."
- required[3] satisfied — "onChange(value?: string) — the editable string. The item routes it to local state only." / "onAccept(value?: IAddressInputResolvedValue) — the resolved result"
- required[4] satisfied — "The item registers the row with required: true and a validate that delegates to the App's addressesListUtils.validateAddress(...)"
- required[5] satisfied — "ENS resolution is always on mainnet ... chainId selects the block-explorer network only." / "enforceChecksum defaults to true"
- required[6] sub-claims: (1) props exist in d.ts — holds; (2) stated defaults supported — holds (enforceChecksum=true bundle L101369; showResetAllAction=true bundle L108214, not in d.ts; strict:false L98530; 300ms; 6+4; no-op nav context L102296); (3) in-project paths resolve — holds; (4) revision-matched — PARTIAL: cited 8a3ea8c8/e06fbb8d match guidelines/context/index.md + source-index.md, but README.md records App 3c9bb798 / GovKit 8d70bdf0 / audited 64b517f5 and registry-report.md records App 3c9bb798 / kit 64b517f5; handoff does not flag the discrepancy; handoff says selection guide records 300ms "against the candidate's GovKit revision" but selection-guide.json has 0 hits for e06fbb8 (refs unversioned, e.g. kit:src/modules/components/addressInput/addressInput.tsx:67); (5) unknowns marked — holds.
- incorrect[0..3] not committed. Loose attribution: "FormWrapper.d.ts (standalone-only usage)" — standalone guidance is in README.md L62–64, not in FormWrapper.d.ts.

## Citations
All 13 in-project paths exist. Attributed items found: Default/Filled/ChecksumError in AddressesInput.prompt.md; govkit:AddressInput/addressUtils/ensUtils/AddressOutput in selection-guide.json; all 8 compiled source names in _ds_bundle.js. External URLs listed in source-index.md L618/188/997 at same revisions.

## Context use
selection-guide.json: used; attributed facts present (300ms debounce; chainId explorer-only, ENS mainnet; GukModulesProvider; AddressesInputItem local raw text + accepted {address,name}). Guide has no AddressesInput entry — Container+Item choice rests on bundle/d.ts/README, not the guide. registry-report.md: not cited.

## Spot-checks
All confirmed: slice(0, currentIndex) duplicate check; null for index >= fields.length; useForm({mode:"onTouched", defaultValues}) + FormProvider; handleSubmit(hasNext ? nextStep : onSubmit, handleInvalidSubmit); item props index/disabled/customValidator/chainId; ENS chainId = mainnet.id; useFormField error keys + variant critical; [n]→.n; Page.Container queryClient.

## Evaluator-side external URL resolution (not grader)
- aragon/app@8a3ea8c8 addressesInputItem.tsx — exists (git cat-file)
- aragon/app@8a3ea8c8 createDaoFormDefinitions.ts — exists
- github.com/aragon/gov-ui-kit/blob/e06fbb8d/src/modules/components/addressInput/addressInput.tsx — WRONG REPO: file exists at aragon/app@e06fbb8d:packages/gov-ui-kit/src/…; commit reachable only from origin/app-594-migrate-ui-kit-to-monorepo. URL copied from payload guidelines/context/source-index.md:997 (emitted kit.repository defect).
