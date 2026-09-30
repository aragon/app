# Implementation handoff — prefilled member-management step in the DAO creation wizard

Scope: add a members step to an **existing** full-page wizard. Compile-oriented: contracts, ownership, and failure modes only. No new prototype, no invented APIs.

Bundle revisions this is written against: `@aragon/app@1.39.1`, `@aragon/gov-ui-kit@2.11.4`; App `2b512b90d3093f1170a14f2ccf7eab41dcc7f036`, GovKit `64b517f5b90052797ecaced5f15ab616b5733f30` (`guidelines/context/index.md → Design-sync context`). This is a **candidate** bundle assembled from unmerged PRs, not accepted code (`README.md → Find the right source`).

---

## 1. Supported composition

```
AppProviders                                  (see §5)
└─ WizardPage.Container  defaultValues={{ members: [...] }}   ← owns the form
   └─ WizardPage.Step  id/order/meta/title/description
      └─ AddressesInput.Container  name="members" label helpText
         ├─ AddressesInput.Item index={0}
         ├─ AddressesInput.Item index={1}
         └─ …                                  (flat siblings, one per row)
```

Only `AddressesInput.Container` and `AddressesInput.Item` exist; `AddressesInput` is a namespace, not a callable root (`components/forms/AddressesInput/AddressesInput.d.ts → AddressesInput`).

**Row children are positional and flat.** `AddressesInputContainer` runs `Children.map` over its children and returns `null` for any child at an index `>= membersField.length`, cloning valid elements with the field-array `id` as key (`_ds_bundle.js → AddressesInput`, `Container`). Consequences:

- The container does **not** render rows for you. You must render exactly one `AddressesInput.Item` per field-array entry, in order, `index` matching position.
- Wrapping the items in a `<div>` or mapping into a nested array collapses them into one child: only row 0 renders, every later row disappears.
- The parent must therefore know the current row count. Read it from the same form control (`useFieldArray`/`useWatch` on the same `name` — react-hook-form context is shared with the wizard form; the container calls `useFieldArray({ name })` with no explicit control). **Not established by this project:** no example in this bundle shows the parent-side read; the previews hardcode the child list (`_preview/AddressesInput.js → Filled`).

## 2. Initializing existing members

Seed through the wizard's own `defaultValues` (`components/wizards/WizardPage/WizardPage.d.ts → WizardPageContainerProps.defaultValues`):

```tsx
<WizardPage.Container
  defaultValues={{ members: existingMembers.map((address) => ({ address })) }}
  initialSteps={createDaoSteps}
  submitLabel="Deploy your DAO"
  finalStep="Deploy your DAO"
  onSubmit={handleSubmit}
>
```

- Row value shape is an **object**, `{ address, name? }` — not a bare string. `AddressesInput.Container`'s add action appends `{ address: '' }`; reset replaces every row with `{ address: '' }`; clear-all replaces with `[]` when `allowEmptyList`, otherwise `[{ address: '' }]` (`_ds_bundle.js → AddressesInput`).
- `fieldPrefix` prepends to `name` (`${fieldPrefix}.${name}`) for nested form shapes (`AddressesInput.d.ts → AddressesInputContainerProps.fieldPrefix`).
- Prefilled rows hydrate from form defaults only (`README.md → Select and compose`). There is no `value`/`items` prop.
- Seeded rows are **not** validated on mount: the re-validate effect in the item only fires when the field is dirty or touched (`_ds_bundle.js → AddressesInput`, `Item`). A prefilled bad-checksum address surfaces through `AddressInput`'s own render-time state, and through the wizard's submit-time validation.

## 3. Add / edit / remove

| Action | Owner | Contract |
|---|---|---|
| Add row | `Container` | renders the Add button; appends `{ address: '' }` unless `onAddClick` overrides it — **an override replaces the append entirely**, you then own the mutation |
| Remove row | `Item` | close button calls the container's `onRemoveMember(index)`; button is `disabled` when there is exactly one row (`canRemove = membersField.length > 1`) — this is true even with `allowEmptyList`, though the container's own handler would allow the removal |
| Empty list | `Container` | `allowEmptyList` permits removing the last row via the handler and lets clear-all produce `[]` |
| Reset fields / Clear all | `Container` | "More" menu renders only when there is more than one row; "Reset fields" shows only when `showResetAllAction` (default `true`) **and** (members are dirty with at least one non-empty address, or the field has errors) |

Copy comes from `app.shared.addressesInput.container.{add,more,resetFields,clearAll}` and `app.shared.addressesInput.item.{remove,input.label,input.placeholder}` (`_ds_bundle.js → enTranslations`). Reuse those keys; do not hardcode strings.

## 4. Editable input vs accepted/resolved address

Two distinct channels inside `AddressesInput.Item` (`_ds_bundle.js → AddressesInput`, `Item`; `components/general/AddressInput/AddressInput.d.ts → AddressInputProps`):

- `onChange(value?: string)` → **local component state only** (`addressInput`). This is the editable string. It is not the form value. It can be rewritten by the component: the input debounces 300 ms, and on successful reverse resolution it swaps the displayed string to the ENS name and calls `onChange` with it.
- `onAccept(value?: IAddressInputResolvedValue)` → **the form value**, written as `{ address, name }`. It emits `undefined` when the input is not resolvable, and the emitting effect returns early while an ENS query is fetching, so no value is emitted mid-flight (`README.md → Interaction and domain contracts`).

Rules that follow:
- Read submitted members from the form (`members[i].address`), never from the editable string.
- Never treat the last accepted value as current while an edit is unresolved.
- `name` is the ENS name when resolution produced one, otherwise `undefined`. Do not rely on it as an identifier.
- **Do not** replace this with your own `AddressInput` + `onAccept` wiring: the App component owns required/duplicate/form-level policy (`README.md → Interaction and domain contracts`).

### Address / network semantics

- **Checksum:** `AddressInput.enforceChecksum` defaults to `true` (`components/general/AddressInput/AddressInput.d.ts → AddressInputProps.enforceChecksum`); `AddressesInput.Item` does not pass it, so the default applies. A mixed-case address failing EIP-55 does not resolve → `onAccept(undefined)` → the row fails validation as invalid. Accepted plain addresses are emitted checksummed.
- **ENS:** resolution (`useEnsAddress`/`useEnsName`) is pinned to **mainnet**, independent of the row's `chainId`, and is enabled only when the wagmi config's mainnet chain exposes `contracts.ensUniversalResolver` (`_ds_bundle.js → AddressInput`). Without that, ENS input silently never resolves.
- **`chainId` (Item prop) only builds the block-explorer link** (`components/forms/AddressesInput/AddressesInput.d.ts → AddressesInputItemProps.chainId`; `README.md → Interaction and domain contracts`). Pass the DAO's target network chain id here; it does not change resolution or validation.

### Invalid and duplicate reporting

Validation is registered by the item on the row field through `useFormField`, with `rules: { required: true, validate: … }` calling `addressesListUtils.validateAddress` (`_ds_bundle.js → AddressesInput`, `Item`):

1. `!addressUtils.isAddress(address)` → returns key `app.shared.addressesInput.item.input.error.invalid` ("Address is not valid.")
2. duplicate → `…error.alreadyInList` ("Address has already been added.")
3. otherwise `customValidator(member)` where `member` is the row's resolved value; return `true` or a message/translation key (`AddressesInput.d.ts → AddressesInputItemProps.customValidator`).

Duplicate detection semantics: `checkIsAlreadyInList` compares against `members.slice(0, currentIndex)` only, using a case-insensitive equality that returns `false` unless **both** values are valid addresses. So the **later** row of a duplicate pair is the one flagged; the first stays clean, and a duplicate of an invalid entry is reported as invalid, not duplicate. Rows re-validate via `trigger(memberFieldName)` in an effect when the row holds a valid address and is dirty or touched.

Errors surface (a) inline on the row through `useFormField`'s `alert` with `variant: 'critical'`, and (b) at the step footer: `useWizardFooter` derives `validationStatus` from the form's top-level `errors` keys and renders a critical `AlertCard` with `app.shared.wizardPage.step.error.{required|invalid|invalid-required}.{title,description}` once the form has been submitted (`_ds_bundle.js → WizardPage`, `Step`). Note `getValidationStatus` inspects `errors[key].type` at the **top level** — for a `members` array the top-level entry is the array error node; whether nested row errors classify as `required` vs `invalid` there is **not established by this project's sources** and should be checked against the App's own tests before relying on the footer wording.

## 5. Providers and form ownership

Required stack, matching the delivered preview harness (`_preview/AddressesInput.js → AppForm`, `_preview/WizardPage.js → AppProviders`):

```
DebugContextProvider
└─ TranslationsProvider translations={enTranslations}
   └─ GukModulesProvider            ← wagmi + query context for AddressInput
      └─ WizardPage.Container …     ← the form owner in the real flow
```

- `GukModulesProvider` is required here because the row renders a web3 consumer (`README.md → Select and compose`).
- `TranslationsProvider` is required: every label, placeholder and error string is a translation key.
- `BlockNavigationContextProvider` is optional — it enables the wizard's dirty-exit guard and is not required by `AddressesInput`; omitting it no-ops rather than throwing.
- **The wizard owns the form.** `WizardPage.Container` renders `Wizard.Root` (which calls `useForm({ mode: 'onTouched', defaultValues })` and provides `FormProvider`) wrapped in `Wizard.Form` (`_ds_bundle.js → WizardPage`, `Wizard`). `mode: 'onTouched'` is what makes rows validate on blur.
- The previews' `AppForm`/`FormWrapper` harness exists **only** because previews have no wizard. Inside the wizard it is the primary defect: a nested `FormWrapper` creates a second form context, the inputs write to a context the wizard never reads, and the step gate and submit payload silently lose `members` (`README.md → Select and compose`; `components/design-sync/FormWrapper/FormWrapper.d.ts → FormWrapper`). Note also that `AppForm` in `AddressesInput.prompt.md` is a preview-local wrapper, not an exported symbol.

## 6. Tempting but incorrect

1. Nesting `FormWrapper` (or a second `useForm`) inside the wizard step. See above.
2. Holding members in `useState` in the step and syncing to the form. The container's `useFieldArray` is the source of truth; local state desynchronizes indices from `validate`'s `members` snapshot and breaks duplicate detection.
3. Wrapping the `AddressesInput.Item` list in a container element, fragment array, or conditional wrapper — only direct element children at index `< rowCount` render.
4. Rendering more `Item` children than field-array entries (silently dropped) or fewer (rows exist in the payload with no UI).
5. Passing an `index` that doesn't match the child's position — `index` drives both the field path and the duplicate window.
6. Overriding `onAddClick` "just to add a default row" — it fully replaces the append; you must then append the `{ address: '' }` shape yourself.
7. Using `AddressesInput.Item` outside `AddressesInput.Container` — `useAddressesInputContext` asserts ("the hook must be used within AddressesInputContextProvider").
8. Re-implementing invalid/duplicate checks in `customValidator`, or replacing the compound with a raw `AddressInput` per row.
9. Treating the item's `chainId` as the ENS network, or expecting ENS to resolve on a non-mainnet config.
10. Setting `enforceChecksum={false}` expectations — the item does not expose that prop at all.
11. Adding `disableNext` to gate on address validity: gating is already the form's job via `mode: 'onTouched'` + submit; `disableNext` would also block the footer's error surfacing.

## 7. Not established by this project — resolve before compiling

- Exact declaration of `IAddressInputResolvedValue`: referenced only as an import in `AddressInput.d.ts`/`AddressesInput.d.ts`; the `{ address, name }` shape above is read off the bundle implementation, not a typed contract in this bundle.
- No example anywhere in this bundle composes `AddressesInput` inside `WizardPage`; the two are documented separately.
- The real create-DAO flow's step id/order/meta and its members field path (assumed `members` here) are product composition and are not in this bundle.
- The App's actual `GukModulesProvider` wagmi config (chains, transports, whether mainnet carries `ensUniversalResolver`) is App wiring, not shipped here.
- Registration of any `customValidator` message key in the App locale.
- Footer `validationStatus` classification for nested array errors (§4).
- Accepted-code status: candidate bundle; verify against the App branch at the revisions in §0 before merge (`guidelines/context/registry-report.md`).
