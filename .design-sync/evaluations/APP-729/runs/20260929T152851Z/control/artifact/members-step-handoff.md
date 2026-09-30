# Prefilled member-management step — implementation handoff

Target: an existing full-page DAO creation wizard (`WizardPage.Container`), adding one step that arrives pre-populated with existing member addresses and supports add / edit / remove.

Everything below is read off this project's synced sources at **@aragon/gov-ui-kit@2.10.0**, bundle `_ds_bundle.js` (`bundleSha12: 40afc3f4f52b`, `_ds_sync.json` renderHashes `AddressesInput: 2eaaf9b088e51cee`, `AddressInput: ab8c9fdc00581bac`, `WizardPage: 8ca5c5d8cb186c61`). Items this project cannot establish are marked **[UNESTABLISHED]**.

---

## 1. Supported composition

```
DebugContextProvider
└ TranslationsProvider (translations={enTranslations})
  └ BlockNavigationContextProvider
    └ GukModulesProvider
      └ WizardPage.Container   ← owns the form (useForm + FormProvider)
        └ WizardPage.Step id="members"
          └ AddressesInput.Container name="members" label helpText
            └ AddressesInput.Item index={i}   (one per field-array entry)
```

There is no other supported composition for this requirement. `AddressesInput.Item` throws outside `AddressesInput.Container` (`useAddressesInputContext: the hook must be used within AddressesInputContextProvider`), and both read `useFormContext()`, which the wizard supplies.

**Form ownership stays with the wizard.** `WizardPage.Container` → `Wizard.Root` calls `useForm({ mode: 'onTouched', defaultValues })` and renders `FormProvider`; `Wizard.Form` renders the single `<form>` and, on submit, calls `handleSubmit(hasNext ? nextStep : onSubmit, handleInvalidSubmit)`. The step contributes fields only — it creates no form, no `<form>`, and no submit handler.

---

## 2. Exact prop contracts

`AddressesInput.d.ts` ships as `[key: string]: unknown` — there is **no published type**. The following is destructured verbatim from the compiled implementation (`_ds_bundle.js:119835` and `:121885`).

### `AddressesInput.Container`

| Prop | Type | Behaviour in source |
|---|---|---|
| `name` | `string` | Field-array name. |
| `fieldPrefix` | `string?` | `membersFieldName = fieldPrefix ? \`${fieldPrefix}.${name}\` : name`. |
| `label` | `ReactNode` | Passed to the shared input container. |
| `helpText` | `string?` | Same. |
| `allowEmptyList` | `boolean?` | Permits `remove()` down to 0 and makes "Clear all" `replace([])`; otherwise the floor is one `{ address: '' }` row. |
| `onAddClick` | `() => void` | Overrides the default `append({ address: '' })`. Supply this only if a member row needs extra fields. |
| `showResetAllAction` | `boolean = true` | Gates the "Reset fields" menu item. |
| `children` | `ReactNode` | Must be `AddressesInput.Item` elements — see §5, gotcha 5. |

Internals: `useFieldArray({ name: membersFieldName })` (`fields/append/remove/replace`). The overflow "More" dropdown renders only when `fields.length > 1`; "Reset fields" additionally requires `showResetAllAction && ((dirtyMembers && someNonEmptyAddress) || memberErrors)`.

### `AddressesInput.Item`

| Prop | Type | Notes |
|---|---|---|
| `index` | `number` | Required; positional into the field array. |
| `disabled` | `boolean?` | Forwarded to `AddressInput`. |
| `chainId` | `number?` | Forwarded to `AddressInput`. Explorer links only — see §4. |
| `customValidator` | `(member) => string \| true` | Receives `members[index]` (the whole object), runs **after** the built-in format and duplicate checks pass. |

Item internals that constrain the integration:

- Registered field name is **`` `${fieldName}.[${index}]` ``** and the registered **value is the member object**, not a string.
- Rules: `{ required: true, validate: member => validateAddress(member.address, members, index, customValidator) }`, `sanitizeOnBlur: false`.
- Stored value shape on accept: `{ address, name }` — `onAccept` maps to `onChange({ address: value?.address, name: value?.name })`. The ENS name is persisted alongside the address.
- Remove button: `canRemove = members.length > 1` — disabled at one row **regardless of `allowEmptyList`**.
- Re-validation: `useEffect` runs `trigger(memberFieldName)` when `addressUtils.isAddress(value.address)` and the field is dirty or touched. This is what makes a duplicate appear once the conflicting row is edited.

### Editable input vs. accepted address — the mechanism

Inside `Item`, the visible text is **local component state** (`const [addressInput, setAddressInput] = useState(value.address)`), wired to `AddressInput.onChange`. Form state is written **only** from `AddressInput.onAccept`. So:

- typing → local only; the form value keeps the last accepted `{ address, name }`;
- accepted → form value is a checksummed address (or an ENS-resolved address plus normalized name);
- unresolvable/invalid → `onAccept(undefined)` → form value cleared → `required` fires.

`useState(value.address)` is an **initial value only**: writing the field with `setValue` after mount will not update the visible input.

---

## 3. Initialization of existing members

Array-backed inputs hydrate from the owning form's `defaultValues` (README, "App form inputs"). Pass them at the wizard container:

```jsx
<WizardPage.Container
  initialSteps={steps}
  defaultValues={{ members: existingAddresses.map((address) => ({ address })) }}
  submitLabel="Deploy your DAO"
  onSubmit={handleSubmit}
>
```

`WizardPage.Container` destructures `defaultValues` and forwards it to `Wizard.Root` → `useForm`. Requirements on the seed data:

- Each entry must be an **object** `{ address }` (optionally `{ address, name }`), never a bare string.
- Addresses must be **EIP-55 checksummed** before seeding — use the exported `addressUtils.getChecksum`. `AddressInput` defaults `enforceChecksum: true`, and `AddressesInput.Item` does not override it, so a mixed-case non-checksummed seed renders `variant: "critical"` and emits `onAccept(undefined)`. (Note the asymmetry: the field-array `validate` uses non-strict `isAddress`, so the row can look accepted to RHF while `AddressInput` visually rejects it. Checksum on the way in.)
- `AddressesInput.prompt.md` ships a live checksum-failure example: `0x2a1E345b4A1eB6cD8194Cd75f7C2B34aE2a08cF3`.

Post-mount programmatic reset paths that *are* established: the container's own `replace()` via "Reset fields" / "Clear all". Any other externally driven re-hydration (e.g. address list arriving async after mount) is **[UNESTABLISHED]** — no source in this project demonstrates it, and the `useState` seeding above means it will not be reflected in the inputs.

---

## 4. Address resolution, checksum and network semantics

From the `AddressInput` implementation (`_ds_bundle.js:103854`):

- Defaults: `enforceChecksum = true`, `hideControls = false`, `chainId = mainnet.id`.
- Input is debounced **300 ms** before resolution.
- **ENS is pinned to mainnet.** Both `useEnsAddress` and `useEnsName` are called with `chainId: mainnet.id`, independent of the `chainId` prop. The `chainId` prop is used for block-explorer URL building only.
- ENS queries are enabled only when the active wagmi config's mainnet chain exposes `contracts.ensUniversalResolver`; otherwise no forward or reverse resolution occurs.
- `onAccept` emission:
  - ENS name resolves → `{ address: resolvedAddress, name: normalize(input) }`
  - input is an address and not (`enforceChecksum` && failing strict checksum) → `{ address: getChecksum(input), name: reverseEnsName ?? undefined }`
  - otherwise → `undefined`
- `onChange` normalization: with `enforceChecksum`, strict-valid or all-uppercase hex input is rewritten through `getChecksum` before reaching the consumer.
- `AddressesInput.Item` forwards only `chainId` and `disabled`; `enforceChecksum` and `hideControls` are therefore always at their defaults. Changing that requires an upstream prop — do not attempt it in the app.

---

## 5. Validation and error reporting through the owning form

Validation lives in the bundle's `AddressesListUtils.validateAddress`:

1. `!addressUtils.isAddress(address)` → `app.shared.addressesInput.item.input.error.invalid` → **"Address is not valid."**
2. `checkIsAlreadyInList(members, index, address)` — `isAddressEqual` against **`members.slice(0, index)`** only → `…error.alreadyInList` → **"Address has already been added."** Only the *later* occurrence is flagged; the first stays clean.
3. `customValidator(members[index])` if supplied.

Plus `required: true` on the member object.

Shipped strings (`en` translations in-bundle): container `Add` / `More` / `Reset fields` / `Clear all`; item label `Member`, placeholder `ENS or 0x…`, remove aria-label `Remove member`.

Reporting path — nothing extra to build:

- Errors land at `members.N` in the wizard's RHF `formState.errors`; `AddressInput` renders the per-row alert with `variant: "critical"` via `useFormField`.
- `Wizard.Form`'s submit handler gates navigation: invalid → `handleInvalidSubmit` (analytics only), `nextStep` is not called, so **Next is blocked automatically**.
- `WizardPage.Step` renders a footer `AlertCard` from `useWizardFooter()` using `app.shared.wizardPage.step.error.{status}.title|description`, where `status = getValidationStatus(errors)` ∈ `valid | required | invalid | invalid-required`.
- Caveat: `getValidationStatus` inspects **top-level** error keys (`errors[key]?.type`). A nested field-array error is `errors.members` with no `.type`, so it classifies as `invalid`, never `required`. Copy for the members step should read correctly under the "invalid" heading.

`mode: 'onTouched'` — rows validate on blur, then live via the `trigger` effect.

---

## 6. Provider assumptions

| Provider | Why | Failure mode without it |
|---|---|---|
| `GukModulesProvider` | `AddressInput` calls `useConfig`, `useQueryClient`, `useEnsAddress`, `useEnsName` | throws at render |
| `TranslationsProvider translations={enTranslations}` | every label/error is a translation key | keys render raw / `useTranslations` unavailable |
| `DebugContextProvider` | app shared-component stack | as documented in README |
| `BlockNavigationContextProvider` | `Wizard.Root` → `useConfirmWizardExit` → `useBlockNavigationContext` | context has a no-op default, so no throw, but the unsaved-changes exit guard is silently inert |

`GukModulesProvider` takes no required props and bundles its own react-query + wagmi defaults. A custom wagmi config can be injected per-input via `AddressInput.wagmiConfig`, but `AddressesInput.Item` does **not** forward it — app-level config must come from the provider.

Provider **order** beyond "all four present, wizard inside them" is **[UNESTABLISHED]** here: the shipped preview harness only demonstrates `DebugContextProvider > TranslationsProvider > FormWrapper`, and no preview composes the wizard with `GukModulesProvider`. Confirm against the app's real root layout.

---

## 7. Tempting but incorrect choices

1. **Wrapping the step in `FormWrapper` (or any nested `<form>`).** `FormWrapper` calls its own `useForm` + `FormProvider`; the step's fields would register in that inner form and be invisible to the wizard's `handleSubmit`, so Next would navigate past invalid members and the values would never reach `onSubmit`. `FormWrapper` exists for isolated component previews. A nested `<form>` is additionally invalid inside `Wizard.Form`'s `<form>`.
2. **Owning the member list in `useState` and mirroring it with `setValue`.** Two writers against one field array; and because `Item` seeds its visible input from `value.address` at mount only, `setValue` edits will not appear in the inputs.
3. **Using bare `AddressInput` + hand-rolled rows.** Loses `required`, the duplicate check, the checksum normalization path, the re-validation trigger, and the wizard's navigation gate. The duplicate rule in particular is asymmetric (earlier-entries-only) and easy to reimplement wrongly.
4. **Registering `members.N.address` as a string field.** `Item` registers the object at `` `members.[N]` `` and `validate` reads `member.address`; a string field makes `member.address` `undefined` → permanent "Address is not valid."
5. **Rendering a fixed number of `Item` children.** `Container` maps `Children.map(children, …)` and returns `null` for any child at `index >= fields.length` — and never renders more children than you passed. Clicking **Add** appends to form state but shows nothing unless the step's child count follows the array. The step must derive its children from the same field name, e.g. `useWatch({ name: 'members' })` (or its own `useFieldArray` on the same control) and map over it; keys are re-applied by the container from `fields[index].id`, so index keys in the step are harmless.
6. **Setting `allowEmptyList` and expecting the last row to be removable.** The container allows it; the `Item` remove button is disabled whenever `members.length <= 1`.
7. **Passing `chainId` expecting ENS to resolve on that chain.** ENS is mainnet-pinned (§4).
8. **Implementing duplicate detection in `customValidator`.** Already built in, and `customValidator` only runs after it passes — yours can never fire for duplicates.
9. **Importing `addressesListUtils` / `useFormField`.** Not exported. `window.GovUiKit` exposes `addressUtils` (`isAddress`, `getChecksum`, `truncateAddress`), `ensUtils`, `enTranslations`, `FormWrapper` — not the internals above. Re-derive with viem if you need the same predicates outside the component.

---

## 8. Revision-matched references in this project

| Concern | File / location |
|---|---|
| Container implementation | `_ds_bundle.js:119796–119978` |
| Item implementation + `AddressesListUtils` | `_ds_bundle.js:121856–121973` |
| `AddressInput` resolution/checksum core | `_ds_bundle.js:103854–103905` |
| Shipped en strings | `_ds_bundle.js:109657–109677` |
| `Wizard.Root` (`useForm`, `FormProvider`) | `_ds_bundle.js:104969–105046` |
| `Wizard.Form` submit/navigation gate | `_ds_bundle.js:104726–104750` |
| `WizardPage.Container` / `.Step`, footer alert | `_ds_bundle.js:105271–105422` |
| `getValidationStatus` | `_ds_bundle.js:105088–105101` |
| Usage examples (default / filled / checksum error) | `components/forms/AddressesInput/AddressesInput.prompt.md`, compiled `_preview/AddressesInput.js:108–150` |
| `AddressInput` prop docs | `components/general/AddressInput/AddressInput.prompt.md`, `.d.ts` |
| Wizard usage examples | `components/wizards/WizardPage/WizardPage.prompt.md` |
| Provider rules, styling idiom | `README.md` |

---

## 9. Reference composition

```jsx
const { WizardPage, AddressesInput } = window.GovUiKit;

const MembersStep = () => {
  const members = useWatch({ name: 'members', defaultValue: [] });
  return (
    <WizardPage.Step
      id="members"
      order={2}
      meta={{ name: 'Members' }}
      title="Add the members"
      description="These wallets can create and vote on proposals."
    >
      <AddressesInput.Container
        name="members"
        label="Members"
        helpText="Paste a wallet address or an ENS name."
      >
        {members.map((_, index) => (
          <AddressesInput.Item index={index} key={index} chainId={chainId} />
        ))}
      </AddressesInput.Container>
    </WizardPage.Step>
  );
};
```

`chainId` here is the DAO's target network, used for explorer links only.

---

## 10. Open items this project cannot answer

- The real wizard's step ids, `order` values, and the canonical field path for members (plain `members` vs. a `fieldPrefix`-scoped path such as `body.members`). No app route or create-DAO flow source is present in this project. **[UNESTABLISHED]**
- Whether the existing members arrive synchronously (route loader / server data) or async after mount. This decides whether `defaultValues` seeding is sufficient — §3 shows it is the only established path. **[UNESTABLISHED]**
- Whether any member row needs extra fields beyond `{ address, name }` (which would require `onAddClick` plus a `customValidator`). **[UNESTABLISHED]**
- The app's actual provider root order. **[UNESTABLISHED]**
- Any app-side minimum/maximum member count rule; the component only enforces "at least one row" and offers no maximum. **[UNESTABLISHED]**
