# Handoff — prefilled member-management step in the DAO creation wizard

Compile-oriented. Every contract below is read from this project's compiled bundle and typings. Anything not establishable here is marked **[NOT ESTABLISHED]**.

## 0. Revision anchors

- App `1.39.1` @ `2b512b90d3093f1170a14f2ccf7eab41dcc7f036`; GovKit `2.11.4` @ `64b517f5b90052797ecaced5f15ab616b5733f30` (`guidelines/context/source-index.md → Recorded revisions`; both dirty-input lists empty).
- Candidate bundle, not an accepted baseline (`README.md → Find the right source`).
- Precedence when sources disagree: `.d.ts` + `_ds_bundle.js`, then `_preview/*.js`, then generated context, then prose (`guidelines/index.md → Authority`).

## 1. Supported composition

```tsx
<WizardPage.Container
    submitLabel="Deploy your DAO"
    finalStep="Deploy your DAO"
    initialSteps={createDaoSteps}
    defaultValues={{ members: existingMembers.map((address) => ({ address })) }}
    onSubmit={handleSubmit}
>
    {/* …other steps… */}
    <WizardPage.Step id="members" order={2} meta={{ name: 'Members' }} title="…" description="…">
        <MembersField />
    </WizardPage.Step>
</WizardPage.Container>

// MembersField — a plain child of the step; NO form wrapper of its own.
const MembersField = () => {
    const members = useWatch({ name: 'members' }) ?? [];
    return (
        <AddressesInput.Container name="members" label="Members" helpText="…">
            {members.map((_, index) => (
                <AddressesInput.Item key={index} index={index} chainId={daoChainId} />
            ))}
        </AddressesInput.Container>
    );
};
```

Contracts: `components/wizards/WizardPage/WizardPage.d.ts → WizardPageContainerProps`, `→ WizardPageStepProps`, `components/forms/AddressesInput/AddressesInput.d.ts → AddressesInputContainerProps`, `→ AddressesInputItemProps`.

## 2. Form ownership and navigation

- `WizardPage.Container` composes `Wizard.Root` + `Wizard.Form` (`_ds_bundle.js:102796-102820`). `Wizard.Root` calls `useForm({ mode: 'onTouched', defaultValues })` and renders `FormProvider` (`_ds_bundle.js:102493-102496`, `:102550-102558`). The step content is inside that provider — **add nothing**.
- Next/submit is a real form submit: `Wizard.Form` runs `handleSubmit(hasNext ? nextStep : onSubmit, handleInvalidSubmit)` (`_ds_bundle.js:102258-102262`). Invalid fields therefore block advancing; no extra gating code is needed for the happy path.
- `disableNext` on `WizardPage.Step` is caller-supplied; the wizard does not derive it from field errors (`WizardPage.d.ts → WizardPageStepProps`). Use it only for non-form preconditions.
- The footer's error banner shows only after a submit attempt: `displayValidationError = isSubmitted && status !== 'valid'`, status derived from **top-level** `errors` keys (`_ds_bundle.js:102603-102621`). Member errors live under `errors.members`, so a top-level key exists and the banner reads `invalid` / `required` accordingly.
- Seeding: pass initial addresses through `WizardPage.Container.defaultValues` only. Items hydrate from form default values (`README.md → Select and compose`).
- **[NOT ESTABLISHED]** whether fields on inactive steps (a `Wizard.Step` returns `null` when not active, `_ds_bundle.js:102566-102594`) participate in that whole-form validation. Confirm against the App's wizard tests before relying on either behaviour.

## 3. Row model — the part that is easy to get wrong

`AddressesInput.Container` owns the field array (`useFieldArray({ name: fieldPrefix ? \`${fieldPrefix}.${name}\` : name })`, `_ds_bundle.js:108218-108226`), but it **renders only the children you pass**, truncated to the array length, and returns `null` for any child past it (`_ds_bundle.js:108278-108287`).

Consequences, all load-bearing:

- The consumer must render exactly one `AddressesInput.Item` per live field-array entry, derived from a **live watch** of the same field name. A static prefill array makes the container's Add button look broken (row appended to state, no child to render) and Remove leaves a stale extra row.
- Do **not** call `useFieldArray` for the same name in the step to render rows and also let the container manage it — two field arrays over one name double-manage `id`s. Watching (`useWatch`) is the supported read path; mutation stays in the container.
- The container re-keys children with its own field ids via `cloneElement` (`_ds_bundle.js:108278-108284`); your `key` is replaced, so don't key on the address value expecting stability.
- `index` must equal the array position; the item derives its field name as `` `${fieldName}.[${index}]` `` (`_ds_bundle.js:110342`) and duplicate detection depends on ordering.

## 4. Add / remove / reset semantics (container-owned)

| Action | Behaviour | Source |
|---|---|---|
| Add | `append({ address: '' })` unless `onAddClick` is supplied, which fully replaces it (no append happens) | `_ds_bundle.js:108234-108240` |
| Remove row | Removes only if `allowEmptyList` or `length > 1`; item's remove button is disabled when `length <= 1` | `:108227-108233`, `:110332-110334` |
| More menu | Rendered only when `length > 1` | `:108297-108300` |
| Reset fields | Visible when `showResetAllAction` (default `true`) and (`dirty && some non-empty`) or errors exist; replaces every row with `{ address: '' }` | `:108241-108250`, `:108328-108338` |
| Clear all | `replace([])` when `allowEmptyList`, else `replace([{ address: '' }])` | `:108251-108259` |

`allowEmptyList` is the only switch for "zero members allowed". A minimum-member rule (e.g. ≥1 signer) is **not** provided by the container — enforce it in the step via `customValidator` or a step-level rule. **[NOT ESTABLISHED]**: the product's actual minimum-members policy for this wizard.

## 5. Editable input vs accepted/resolved address

- The raw editable string is **component-local state** inside the item (`useState(value.address)` fed to `AddressInput.value` / `onChange`, `_ds_bundle.js:110360-110390`). It is never written to the form.
- The form value is written only from `onAccept`: `onChange({ address: value?.address, name: value?.name })` (`_ds_bundle.js:110363-110366`). So the stored shape is `{ address, name? }` (`IAddressInputResolvedValue`), not a string — prefill and submit payload must use objects.
- `onAccept` does not fire while ENS resolution is in flight (loading guard, `_ds_bundle.js:101374-101383`); the last accepted value is stale during an unresolved edit. Do not treat form value as "what the user sees" (`README.md → Interaction and domain contracts`).
- Presentation of an accepted row is already handled by `AddressInput`: resolved address is truncated, an avatar/ENS toggle, explorer link, copy and clear controls appear (`_ds_bundle.js:101417-101420`). Do **not** swap in `AddressOutput` for accepted rows — that puts a second interactive control inside a row that is already an input; if you ever render `AddressOutput` inside a clickable ancestor, set `hasInteractiveAncestor` (`README.md → Accessibility and copy`).

## 6. Address semantics: checksum, ENS, network

- `AddressInput` defaults: `enforceChecksum = true`, `chainId = mainnet.id` (`_ds_bundle.js:101369`). With `enforceChecksum` on, typing re-checksums a strict-valid or all-uppercase hex string before `onChange` (`:101412-101416`); blur trims whitespace (`:101406-101408`). A failed checksum renders a critical alert from the input itself (`:101405`).
- `AddressesInput.Item` passes only `chainId` through; it does not expose `enforceChecksum` (`AddressesInput.d.ts → AddressesInputItemProps`). Checksum enforcement is therefore always on for member rows.
- ENS resolution is mainnet; `chainId` governs explorer links (`README.md → Interaction and domain contracts`). Pass the DAO's chain id to `Item.chainId` so explorer links match the deployment network — **[NOT ESTABLISHED]**: the App hook/selector that yields that chain id.
- Form-level validity uses `addressUtils.isAddress(value, { strict: false })` (`_ds_bundle.js:98531`) — non-checksum-strict. Net effect: checksum errors surface at the input layer, not as a form error, and a bad-checksum string never reaches the form because `onAccept` never fires for it.

## 7. Invalid and duplicate reporting

Registered by the item through `useFormField` (`_ds_bundle.js:110344-110358`):

```
rules: { required: true, validate: (member) => addressesListUtils.validateAddress(member.address, members, index, customValidator) }
```

- `!isAddress(address)` → `app.shared.addressesInput.item.input.error.invalid` ("Address is not valid.").
- Duplicate → `app.shared.addressesInput.item.input.error.alreadyInList` ("Address has already been added."). Copy at `_ds_bundle.js:107237-107241`.
- Duplicate detection is **prior-rows-only** and case-insensitive: `members.slice(0, currentIndex).some(m => isAddressEqual(m.address, address))` (`_ds_bundle.js:110308-110318`). The earlier occurrence stays clean; only later ones error. Do not build a UI that assumes both rows in a duplicate pair are flagged.
- `customValidator: (member: IAddressInputResolvedValue) => string | true` runs last and only when the address is valid and not a duplicate. Return a **translation key**, not a literal sentence — `useFormField` runs the message through `t()` (`_ds_bundle.js:110286-110288`). Adding a new key requires an App locale entry: **[NOT ESTABLISHED]** in this bundle (copy is compiled in; the locale file lives in the App repo, `README.md → Accessibility and copy`).
- Error rendering is automatic: `useFormField` maps `fieldState.error` to `variant: 'critical'` + an `alert` passed to the input (`_ds_bundle.js:110277-110293`). Do not render your own per-row error text.
- The item re-triggers its own validation when a valid address lands on a dirty/touched field (`_ds_bundle.js:110368-110373`), so duplicates created by editing an earlier row are re-evaluated for that row only. Cross-row re-validation on removal is not built in — **[NOT ESTABLISHED]** whether the App compensates elsewhere; if a stale `alreadyInList` after a removal is unacceptable, call `trigger(name)` from the step after remove (requires overriding removal, see §8).

## 8. Providers

Around the wizard (App components rendering copy + a web3 input):

```
<DebugContextProvider>
  <TranslationsProvider translations={enTranslations}>
    <GukModulesProvider>            {/* wagmi + query, required by AddressInput */}
      <WizardPage.Container …>
```

Per `README.md → Select and compose` and the shipped preview stack (`_preview/AddressesInput.js:106-108`). `BlockNavigationContextProvider` is needed only for the wizard's dirty-exit confirmation (`useConfirmWizardExit(formState.isDirty)`, `_ds_bundle.js:102550-102554`); omitting it no-ops the guard rather than throwing, and `AddressesInput` does not need it.

## 9. Tempting but incorrect

1. **Nesting `FormWrapper` (or any `useForm`/`FormProvider`) inside the wizard step.** It creates a second form; the inputs write to a context the wizard never reads, so gating and the submit payload silently lose `members` (`README.md → Select and compose`; `FormWrapper` is itself `useForm({ mode: 'onTouched' })`, `_ds_bundle.js:114534-114537`). `FormWrapper` is for standalone/story use only.
2. **Rendering `<AddressesInput.Item>` from the static prefill array.** Add/remove appear dead — see §3.
3. **Storing the member as a string.** The field value is `{ address, name? }`; a string breaks `validateAddress(member.address, …)` and the prefill hydration.
4. **Replacing validation with `AddressInput.onAccept` / `onChange` handlers in the step.** Required, invalid and duplicate policy is owned by `AddressesInput` (`README.md → Interaction and domain contracts`); a single-input callback bypasses form state and the wizard's submit gate.
5. **Using `onAddClick` to "also" append.** It replaces the default append entirely; supply it only if the step opens a picker dialog and performs its own `append`.
6. **Adding a second `AddressesInput.Container` on the same step.** The container hard-codes `id="addresses"` on its `InputContainer` (`_ds_bundle.js:108289-108296`) — two on one page produce a duplicate DOM id and ambiguous label association.
7. **Using `defaultOpen` for any member-picker dialog.** Dialogs are controlled through `open`; use the App dialog provider's `close(dialogId)` to return from a child without collapsing the stack (`README.md → Select and compose`).
8. **Styling the rows with bespoke CSS.** Row card, spacing and error styling are internal (`Card` + `border-neutral-100 p-4 shadow-neutral-sm`, `_ds_bundle.js:110375`); layout belongs to the step wrapper only.

## 10. Reference material in this project

- Prefilled example (three addresses) and checksum-error example: `components/forms/AddressesInput/AddressesInput.prompt.md → Filled`, `→ ChecksumError`; compiled equivalents `_preview/AddressesInput.js:110-152`.
- Wizard page example with `initialSteps` / `finalStep` / `submitLabel`: `components/wizards/WizardPage/WizardPage.prompt.md → Default`.
- Upstream sources at the recorded App revision: `guidelines/context/source-index.md:616-618` (`addressesInputContainer.tsx`, `addressesInputContext.ts`, `addressesInputItem.tsx`).
- **[NOT ESTABLISHED]**: the existing create-DAO member step's own file path and field name. This bundle lists `src/modules/createDao/dialogs/setupBodyDialog/*` (`guidelines/context/source-index.md:209-214`) but does not ship that source. Confirm the real field name (`members` vs a `fieldPrefix`-scoped path) in the App repo before wiring `defaultValues`.
