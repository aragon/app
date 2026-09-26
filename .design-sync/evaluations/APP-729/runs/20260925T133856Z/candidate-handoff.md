# Handoff — prefilled member-management step in an existing full-page DAO wizard

Revision scope: `@aragon/app@1.39.1` + `@aragon/gov-ui-kit@2.11.4` as bundled in this project's `uploads/_ds_bundle.js` (header `/* @ds-bundle: {"namespace":"GovUiKit" …} */`). Every contract below is read from that bundle or from the shipped `.d.ts` / `.prompt.md` files; line numbers are into `uploads/_ds_bundle.js`. Items this project cannot establish are marked **[UNESTABLISHED]**.

## 1. Supported composition

```
DebugContextProvider
└ TranslationsProvider translations={enTranslations}
  └ GukModulesProvider                     // wagmi + react-query, required by AddressInput
    └ BlockNavigationContextProvider       // wizard exit confirmation
      └ WizardPage.Container
            initialSteps={…} submitLabel finalStep onSubmit
            defaultValues={{ members: [{ address: '0x…' }, …] }}   // the ONLY prefill channel
        └ WizardPage.Step id="members" order={n} meta={{ name: 'Members' }} title description
          └ AddressesInput.Container name="members" label helpText
            └ AddressesInput.Item index={0} …   // one per live field-array entry
```

`WizardPage.Container` = `Wizard.Root` + `Wizard.Form` + progress header (102784–102820). `Wizard.Root` calls `useForm({ mode: 'onTouched', defaultValues })` and renders `FormProvider` (102483–102557). The form is therefore already owned by the wizard; the step contributes fields only.

Sources in this project: `uploads/WizardPage.d.ts`, `uploads/WizardPage.prompt.md`, `uploads/Wizard.d.ts`, `uploads/AddressesInput.d.ts`, `uploads/AddressesInput.prompt.md`, `uploads/README.md` ("Select and compose", "Building screens and flows").

## 2. Exact contracts

### `AddressesInput.Container` (`AddressesInputContainerProps`)
| Prop | Type | Behaviour (bundle 108205–108310) |
|---|---|---|
| `name` | `string` (req.) | Field-array name. Resolved name = `fieldPrefix ? \`${fieldPrefix}.${name}\` : name`. |
| `fieldPrefix` | `string` | Prefix join above — do not hand-concatenate into `name`. |
| `allowEmptyList` | `boolean` | Permits `remove` at length 1 and `replace([])` for "remove all"; otherwise removal stops at one row and "remove all" resets to `[{ address: '' }]`. |
| `onAddClick` | `() => void` | Overrides the default append. Default append value is exactly `{ address: '' }`. |
| `showResetAllAction` | `boolean` (default `true`) | Shows "Reset all" in the actions menu; reset maps every row to `{ address: '' }`. |
| `label`, `helpText` | `ReactNode` / `string` | Forwarded to `InputContainer` (`useCustomWrapper`). |

Internals that constrain you: the container runs `useFieldArray({ name })`, `useWatch({ name })` and reads `formState.dirtyFields` / `formState.errors` at that path. It renders **`children`**, cloning each valid child with the field-array `id` as key, and returns `null` for any child at `index >= fields.length` (108276–108287). It does not render rows for you.

### `AddressesInput.Item` (`AddressesInputItemProps`)
| Prop | Type | Behaviour (bundle 110330–110415) |
|---|---|---|
| `index` | `number` (req.) | Row index; field name is `` `${fieldName}.[${index}]` `` (note the literal brackets in the RHF path). |
| `disabled` | `boolean` | Forwarded to `AddressInput`. |
| `customValidator` | `(member: IAddressInputResolvedValue) => string \| true` | Runs **after** the built-in `isAddress` and duplicate checks; return a translation key string to fail. |
| `chainId` | `number` | Explorer-link chain only (see §4). |

Registration is `useFormField(\`${fieldName}.[${index}]\`, { label, rules: { required: true, validate: member => addressesListUtils.validateAddress(member.address, members, index, customValidator) }, sanitizeOnBlur: false })`.

### `WizardPage.Step` (`WizardPageStepProps`)
`title`, `description`, `id`, `order`, `meta.name` required; `nextDropdownItems`, `disableNext`, `hidden`, `disableScrollToTop` optional. The step registers/unregisters itself with the wizard stepper and **renders `null` unless it is the active step** (102576–102598) — so its fields are unmounted (and their rules deregistered) on other steps.

## 3. Prefill, add/edit/remove, and the editable-vs-accepted split

**Prefill.** Seed `WizardPage.Container.defaultValues` with `{ <name>: IAddressesInputMember[] }` where each entry is at least `{ address: string }`. `useFieldArray` hydrates only from form default values (`uploads/README.md`: "array-backed lists hydrate only from `FormWrapper.defaultValues`"; the wizard container is the equivalent seam here). `AddressesInput.Item` copies the seeded address into local state **once**, via `useState(value.address)` — later programmatic `setValue` on that row updates form state but **not** the visible text.

**Add / remove.** Both come from the container's own controls (Add button, per-row remove button, actions menu). The step must render exactly one `AddressesInput.Item` per current field-array entry, so the row count must be derived from live form state (e.g. `useFieldArray`/`useWatch` on the same `name` inside the step), not from the initial prop array. A static `initialMembers.map(...)` compiles but the list can never grow: children past `fields.length` are dropped and new fields render nothing. **[UNESTABLISHED]** `useFieldArray` is not on `window.GovUiKit` (only `useFormContext` and `enTranslations` are, export map at 25029/25050) — in App source you import it from `react-hook-form` directly; the react-hook-form version is not declared anywhere in this project.

**Editable input vs accepted value.**
- `AddressInput.onChange(value?: string)` is the raw-text channel. `AddressesInput.Item` wires it to local `setAddressInput` only — it never writes form state.
- `AddressInput.onAccept(value?: IAddressInputResolvedValue)` is the resolved channel. The item writes `{ address: value?.address, name: value?.name }` into the row. A cleared/unresolved input yields `undefined` → `{ address: undefined, name: undefined }` → the row fails `required`/`invalid`.
- `onAccept` does not fire while ENS resolution is in flight, and resolution is debounced, so the last accepted value is **not** "the current input" (`uploads/README.md` "Interaction and domain contracts"; `uploads/registry-report.md` "AddressInput: reusable capability"). Any preview/summary UI must read the form value, and must tolerate a resolved value that lags the visible text.

## 4. Address resolution, checksum, network semantics

- Default `enforceChecksum` behaviour: EIP-55 is enforced by default (`AddressInput.d.ts`; `uploads/AddressesInput.prompt.md` → `ChecksumError` story shows a broken-checksum seed flagged on render).
- Validation policy lives in `AddressesListUtils` (110306–110326): `isAddress(address)` → else `app.shared.addressesInput.item.input.error.invalid`; then `checkIsAlreadyInList` → `…error.alreadyInList`; then `customValidator`; else `true`. Both helpers are viem (`isAddress`, `isAddressEqual`). **[UNESTABLISHED]** the bundled viem version — so the exact strictness of `isAddress` (strict-checksum default) is not pinned by this project.
- Duplicate detection is **first-wins**: `members.slice(0, currentIndex)` only, so the *later* row carries the error, compared with `isAddressEqual` (case-insensitive, checksum-independent).
- Re-validation: the item re-`trigger`s **its own** field when `isAddress(value.address)` and the field is dirty or touched. Removing one member of a duplicate pair does not re-trigger the surviving rows; if you need those errors cleared eagerly, the owning form must `trigger(name)` itself.
- ENS resolution runs on **mainnet regardless of `chainId`**; `chainId` only drives block-explorer links (`uploads/README.md`; `uploads/registry-report.md`). ENS resolution also requires configured mainnet support in the wagmi config, and the component calls query-client/Wagmi context hooks even when `wagmiConfig` is passed as a prop.

## 5. Error reporting through the owning form

- Per-row messages surface through `useFormField` (110248–110298): it maps `fieldState.error` into `{ message, variant: 'critical' }` and `variant: 'critical'` on the input, translating `error.message` when present, else `app.shared.formField.error.<error.type>` (so `required` → `app.shared.formField.error.required`). This is why validators return translation **keys**, not prose.
- The container mirrors aggregate state: `hasMemberErrors` from `formState.errors` at the field path, `hasDirtyMembers` from `dirtyFields`, `hasNonEmptyMembers` from watched values — used for its own affordances.
- Step gating: `Wizard.Form.onSubmit` runs `handleSubmit(hasNext ? nextStep : onSubmit, handleInvalidSubmit)` (102240–102264). "Next" is a real form submit; advancing is blocked by any error on currently registered fields. Footer state comes from `useWizardFooter`/`getValidationStatus` (102600–102637), which inspects only **top-level** error keys and their `.type`. A field-array error object at `errors.members` has no `.type`, so it classifies as `invalid` (not `required`) — expect the generic invalid copy, not the required copy, when member rows are empty. "Back" calls `clearErrors()` before `previousStep()`.
- `onSubmit(data)` receives the whole wizard payload, with `data[name]` as `Array<{ address, name }>`.

## 6. Provider assumptions

| Provider | Why | Failure mode if omitted |
|---|---|---|
| `GukModulesProvider` | wagmi + react-query for `AddressInput` resolution/explorer | resolution/context hooks unsatisfied (`uploads/README.md`, `uploads/AddressInput.prompt.md` stories all wrap it) |
| `TranslationsProvider translations={enTranslations}` (+ `DebugContextProvider`) | every label/error is a key resolved by `useTranslations` | keys render instead of copy |
| `BlockNavigationContextProvider` | `Wizard.Root` calls `useConfirmWizardExit(formState.isDirty)`; provider holds `isBlocked` | `blockNavigationContext` has a default value, so nothing throws — unsaved-changes blocking is simply inert |
| react-hook-form `FormProvider` | supplied by `Wizard.Root` | — do not add another (see §7) |

`enTranslations` is present in the bundle export map (25029). **[UNESTABLISHED]** whether that export is the App's full `en` locale (including the `app.shared.addressesInput.*` keys) or kit copy only — verify before relying on it outside the App.

## 7. Tempting but incorrect choices

1. **Nesting `FormWrapper` (or the docs' `AppForm`, or any local `useForm`) inside the wizard step.** It creates a second form context; the inputs write where the wizard never reads, so the wizard's gates and submit payload silently lose `members` (`uploads/README.md`, "Inside a wizard, do not add `FormWrapper`"). Note `AppForm` appears in `uploads/AddressesInput.prompt.md` examples but is **not** an export of this bundle — the exported standalone wrapper is `FormWrapper` (114533), for storybook-style isolation only.
2. **Owning the member array in step-local `useState`** (or lifting it to a parent and pushing via props). The list is a `useFieldArray` at `name`; local ownership desynchronises add/remove/reset and never reaches `onSubmit`.
3. **Rendering `AddressesInput.Item`s from the static prefill array.** Children beyond `fields.length` are dropped and appended fields get no row; the list looks add-broken.
4. **Using `AddressInput` directly per row** with your own duplicate/required checks. The App layer owns required + duplicate + form policy (`uploads/registry-report.md`; `uploads/README.md`: "do not replace that policy with a single-input callback").
5. **Re-implementing duplicate/required logic in `customValidator`.** It runs only after both built-ins pass; use it for domain rules (e.g. excluded addresses).
6. **Treating `onChange` as the form value, or the last `onAccept` as current input.** See §3.
7. **Expecting `chainId` to switch ENS resolution.** It only changes explorer links.
8. **Expecting the row's remove button to empty the list under `allowEmptyList`.** `AddressesInput.Item` computes `canRemove = members.length > 1` and ignores `allowEmptyList` (110340), so the last row's button stays disabled; only the container's "remove all" honours the empty case.
9. **Hand-prefixing the field name** (`name="settings.members"`) instead of `fieldPrefix="settings"` — the container joins them itself, and the Item derives its own path from the joined name.
10. **Wrapping step content in `Page.Container`** — it needs the App query client; use a plain wrapper (`uploads/README.md`).
11. **Assuming other steps' fields are validated on Next.** Inactive `WizardPage.Step`s render `null`, so their rules are not registered at that moment.

## 8. Reference material present in this project

- `uploads/AddressesInput.prompt.md` — Default / Filled / ChecksumError examples, including a three-address `memberAddresses` seed array (the closest thing here to a prefilled-step example).
- `uploads/AddressInput.prompt.md` — WithAddress / Empty / ChecksumError / Disabled.
- `uploads/WizardPage.prompt.md` — Default (create-DAO-style `WizardPage.Container` + `Step`), FinalStep, NextDropdown.
- `uploads/README.md` — composition, provider, interaction-contract and styling rules; `uploads/registry-report.md` — audited source references: `app:src/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx:60-109`, `app:src/shared/utils/addressesListUtils/addressesListUtils.ts`, `kit:src/modules/components/addressInput/addressInput.tsx:38-211`.
- Bundle source spans quoted above: container 108205–108310, item 110330–110415, utils 110306–110326, `useFormField` 110248–110298, wizard 102240–102264 / 102483–102557 / 102576–102637 / 102784–102844.

## 9. Not establishable from this project

- The actual create-DAO wizard route/step file, its existing `defaultValues` shape, field name/`fieldPrefix`, member type name, and step ordering: no App page source is included here, only the shared wizard/form components. Confirm against `apps/app` at App revision `3c9bb798f3679fb2eb8052a192847ab2274ed1d5`.
- `IAddressesInputMember` / `IAddressInputResolvedValue` definitions (referenced by the `.d.ts` files, not shipped). Fields used in code are `address` and `name`.
- `useFormField`, `addressesListUtils`, `useFieldArray`, `useWatch` are not exported on `window.GovUiKit`; in App code they come from their source paths / react-hook-form. Versions of react-hook-form and viem are undeclared here.
- Whether this bundle equals published/deployed code: `uploads/registry-report.md` records source-to-published equivalence for the kit package but states this is an **unmerged candidate** (App PRs #1400/#1410/#1411/#1412/#1413, GovKit PR #793) and not accepted code.
- Analytics: `analytics={{ flow, props }}` on the container emits `wizard_start` / `wizard_step` / `wizard_validation_blocked`; the App's approved flow name and prop vocabulary for this wizard are not in this project.
