# Blind grade — APP-729 confirmation 20260929T094027Z

## Formal verdict

**FAIL — generated-output noncompliance.**

The artifact satisfies required criteria 0–5, commits none of incorrect criteria 0–3, and reaches the gated `selection-guide.json` context. Required criterion 6 and the independent citation-resolution threshold fail because two claim-bearing references are bare paths. Both targets exist and support the claims.

## Required criteria

| Criterion | Result | Artifact evidence | Payload resolution |
|---|---|---|---|
| 0 — App-owned compound list | PASS | “`AddressesInput.Container` holding one `AddressesInput.Item` per field-array entry” | `components/forms/AddressesInput/AddressesInput.d.ts` exports `Container` and `Item`. |
| 1 — Existing wizard ownership | PASS | Existing `WizardPage.Step`; “No new form wrapper” | `WizardPage.d.ts` exposes `Container`/`Step`; README states the wizard owns `FormProvider`. |
| 2 — Default-value initialization | PASS | `WizardPage.Container defaultValues={{ … members: existingMembers.map(...) }}` | `WizardPageContainerProps.defaultValues`; README directs consumers to wizard-owned defaults. |
| 3 — Editable vs accepted state | PASS | “Two channels, deliberately separate”; `onChange` raw text vs `onAccept` resolved value | `AddressInput.d.ts`, `selection-guide.json → govkit:AddressInput`, and `_ds_bundle.js` support the distinction. |
| 4 — App/form validation policy | PASS | Required, invalid, duplicate, and custom checks surface through the owning form | `_ds_bundle.js` `AddressesInputItem`, `AddressesListUtils.validateAddress`, and `useFormField`. |
| 5 — Providers and network semantics | PASS | App-shell provider ownership; checksum strictness; lenient validation; ENS mainnet; `chainId` explorer selection | `selection-guide.json → govkit:AddressInput` and `_ds_bundle.js`. |
| 6 — Exact contracts and resolvable references | **FAIL** | Props, defaults, revisions, and unknowns are correct; final references include bare `README.md` and `guidelines/index.md` | All symbol/range references resolve. The two bare paths do not resolve under the frozen grader rule. |

## Incorrect criteria

| Criterion | Result | Evidence |
|---|---|---|
| 0 — Nested standalone form wrapper | Not committed | Explicitly forbidden. |
| 1 — Accepted state treated as editable state | Not committed | Explicitly separated. |
| 2 — App validation delegated to primitive | Not committed | Assigned to App `AddressesInput` and owning form. |
| 3 — Invented props/providers/paths | Not committed | Checked props and source paths exist; unavailable application facts are marked unknown. |

## Citation resolution

Resolved path-plus-symbol/path-plus-range references include:

- `components/forms/AddressesInput/AddressesInput.d.ts` → `AddressesInputContainerProps`, `AddressesInputItemProps`
- `components/forms/AddressesInput/AddressesInput.prompt.md` → `Default`, `Filled`, `ChecksumError`
- `_preview/AddressesInput.js` → `AppForm`, `Filled`
- `_ds_bundle.js` → `AddressesInputContainer`, `AddressesInputItem`, `AddressesListUtils.validateAddress`, `addressUtils.isAddress`
- `components/wizards/WizardPage/WizardPage.d.ts` → `WizardPageContainerProps`, `WizardPageStepProps`
- `guidelines/context/selection-guide.json` → `govkit:AddressInput`
- `guidelines/context/source-index.md` → commit-addressed App source rows at `2b512b90…`

Unresolved under the frozen mechanical rule:

- `README.md` — path only; no symbol or line range
- `guidelines/index.md` — path only; no symbol or line range

The files exist and support the associated form-ownership/provider and authority-order claims. This is output-format noncompliance, not an invented or contradicted contract.

## Context reachability

**PASS.** The handoff explicitly attributes `AddressInput` props and constraints to `guidelines/context/selection-guide.json → govkit:AddressInput`, and correctly says the guide covers the GovKit layer rather than App-owned `AddressesInput`/`WizardPage` compounds. `registry-report.md` is not attributed, but the frozen rule requires either gated file.

## Classification

- Setup: valid.
- Payload delivery and provenance: valid.
- Bundle contract coverage: all substantive required criteria supported.
- Incorrect claims: none under the key.
- Context reachability: hit.
- Formal failures: generated-output citation noncompliance only.
