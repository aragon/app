# Member entry — implementation handoff

Prototype: `Multisig Members Step.html` (runs against this project's `_ds_bundle.js`, GovUiKit 2.11.4 candidate).

## What is reused vs. App-owned

**Reused as-is — App shared form input (not kit-general):**
`AddressesInput.Container` + `AddressesInput.Item`
Source in the bundle: `apps/app/src/shared/components/forms/addressesInput/…`
(`addressesInputContainer.tsx`, `addressesInputItem.tsx`, `addressesInputContext.ts`),
validator `apps/app/src/shared/utils/addressesListUtils/addressesListUtils.ts`.
Generated refs in this project: `components/forms/AddressesInput/AddressesInput.prompt.md`,
preview stories `_preview/AddressesInput.js` (`Default`, `Filled`, `ChecksumError`).

This component already owns everything the brief asks for, so nothing was rewritten:
- one `AddressInput` (kit, `components/general/AddressInput/`) per row, inside a `Card` with `border-neutral-100 p-4 shadow-neutral-sm`
- "Add" button (`iconLeft: PLUS`, `secondary`, `size sm`, `md` responsive)
- per-row remove (`tertiary` icon button desktop, labelled "Remove" button below `sm`)
- **at least one row**: `handleRemoveMember` only removes when `membersField.length > 1` unless `allowEmptyList` is set. Remove is `disabled` when `canRemove === false`.
- an overflow "More" dropdown (Reset fields / Clear all) that appears once there is more than one row.

**Kit primitives used directly:** `Card`, `Heading`, `Button`, `Tag`, `Icon`/`IconType`, `AlertInline`.

**App-owned composition written for this step** (the only new code):
- `MembersStep` — heading, description, the `AddressesInput.Container`, and the step footer.
- `MemberRows` — renders one `AddressesInput.Item index={i}` per entry in the watched array. Required, because `AddressesInput.Container` clones **only as many children as there are field-array entries**; if you render a fixed list, added rows never appear.
- `MemberCount` — a `Tag` summarising progress / error count. Optional; drop it if the wizard header already carries this.
- `ValidateOnMount` — prototype-only, see below.

## Prop contracts actually found in source

`AddressesInput.Container`: `name`, `fieldPrefix?`, `label?`, `helpText?`, `allowEmptyList?`, `onAddClick?`, `showResetAllAction?` (default `true`), `children`.
Field path is `fieldPrefix ? \`${fieldPrefix}.${name}\` : name`.

`AddressesInput.Item`: `index`, `disabled?`, `chainId?`, `customValidator?`.
Field value shape is `{ address, name }`; `defaultValues` must be `[{ address: '' }]`, not `['']`.

`AddressInput` (kit) props: see `components/general/AddressInput/AddressInput.d.ts` — `value`, `onChange`, `onAccept`, `enforceChecksum`, `chainId`, `variant`, `alert`, `hideControls`, `disabled`.

## Providers and form state

```
DebugContextProvider
  TranslationsProvider translations={enTranslations}
    GukModulesProvider            // wagmi + query context for AddressInput / ENS
      FormWrapper defaultValues={{ members: [{ address: '' }] }}
```
This is the stack the generated story uses (`_preview/AddressesInput.js`).
`FormWrapper` is `useForm({ defaultValues, mode: 'onTouched' })` + `FormProvider`.

In the real create-flow, **do not add `FormWrapper`**: `WizardPage.Container` already renders `Wizard.Root`/`Wizard.Form` and accepts `defaultValues`, so the step body drops straight in. Wizards additionally need `BlockNavigationContextProvider`. The array hydrates only from the form's `defaultValues` — seeding it later will not populate rows.

`useWatch` is **not** exported from this bundle; `useFormContext` is. The prototype watches with `useFormContext().watch(name)`.

## Validation responsibilities

Owned by `AddressesInput.Item` via `addressesListUtils.validateAddress`, with rule `required: true`:
1. `!isAddress(address)` → `app.shared.addressesInput.item.input.error.invalid` → "Address is not valid."
2. duplicate against **earlier** rows only (`members.slice(0, index).some(isAddressEqual)`) → `…error.alreadyInList` → "Address has already been added." So the *second* occurrence is flagged, not the first.
3. an optional `customValidator(member)` runs last — that is the hook for App-level rules (e.g. excluding the DAO address). Do not re-implement required/duplicate checks there.

`AddressInput` itself enforces EIP-55 checksums by default and resolves ENS on mainnet; `chainId` only controls explorer links. `onAccept` fires with `{ address, name }` after resolution and does not fire while an ENS lookup is in flight, so the last accepted value is not necessarily the current input.

## State transitions demonstrated in the prototype

| State | How it is produced |
|---|---|
| Initial | `defaultValues.members = [{ address: '' }]`; remove is disabled |
| Members added | three example addresses; ENS reverse lookup resolved `0xd8dA…6045` to `vitalik.eth` in the preview, so mainnet resolution did run there |
| Invalid | second row `0x1234abcd`; real validator returns `…error.invalid` |
| Duplicate | third row repeats the first; real validator returns `…error.alreadyInList` |
| Add / remove | live — "Add" appends `{ address: '' }`, remove deletes the row and is disabled at one row |

Errors surface on touch/blur (`mode: 'onTouched'`), plus `AddressesInputItem`'s own `useEffect` that re-triggers validation when a row already holds a valid address. For the preset error states the prototype calls `trigger('members')` on mount (`ValidateOnMount`) — that is scaffolding, not product behaviour; the messages themselves come from the shipped validator.

## Departures and gaps

- The state switcher row and the info alert at the bottom are prototype scaffolding, not part of the step.
- `MemberCount` is invented for this composition; there is no kit component for it. Remove it if the wizard header covers progress.
- Copy is hard-coded English in the prototype. In the App it must come from `TranslationsProvider` keys; the component's own strings already resolve from `app.shared.addressesInput.*`.
- Approval threshold, the rest of the create flow, on-chain membership checks and deployment are out of scope and absent.
- No wallet connection and no transaction: `GukModulesProvider` runs with its default config only.
- `components/forms/AddressesInput/AddressesInput.d.ts` is a `[key: string]: unknown` stub — the prop contract above was read from the bundled implementation, not from types. Upstream `AddressesInput` source/stories are not included in this bundle beyond that implementation; treat the App repo as authoritative.
- This bundle is a candidate assembled from unmerged PRs (App base `3c9bb798…`, GovKit `8d70bdf0…`). Source-to-published-package equivalence is unknown.
