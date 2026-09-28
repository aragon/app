# Implementation handoff — prefilled member-management step in the existing create-DAO wizard

Compile-oriented. Every contract below is read from this project's bundle source or generated
context; anything not establishable here is marked **[UNESTABLISHED]** and must be resolved
against the App repo before merge.

## Revision baseline

| Input | Value |
|---|---|
| App source revision | `2b512b90d3093f1170a14f2ccf7eab41dcc7f036` (`guidelines/context/index.md`) |
| GovKit source revision | `64b517f5b90052797ecaced5f15ab616b5733f30` (= published `@aragon/gov-ui-kit` 2.11.4) |
| App package in bundle headers | `@aragon/app@1.39.1` |
| Registry | `.design-sync/component-registry/registry.json`, SHA-256 `3fba4472a73eff9e8090ca9004ab4e594663bc2341d18bb790d78f8791af0da8`, 418 records — **not copied into this bundle** |
| Status | candidate assembled from unmerged PRs (App #1400/#1410/#1411/#1412/#1413, GovKit #793); not an accepted baseline |

Source references used, all at the recorded App revision:

- `apps/app/src/shared/components/forms/addressesInput/addressesInputContainer/addressesInputContainer.tsx`
- `apps/app/src/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx`
- `apps/app/src/shared/components/forms/addressesInput/addressesInputContext/addressesInputContext.ts`
- `apps/app/src/shared/utils/addressesListUtils/addressesListUtils.ts`
- `apps/app/src/shared/components/wizards/wizardPage/index.ts`
- kit `src/modules/components/addressInput/addressInput.tsx:38-211` (+ its default story and callback/checksum/explorer tests)

The candidate's **compiled implementation is in this project**, so the quoted behavior below is read
directly, not inferred: `_ds_bundle.js` lines 108137–110423 (`addressesInputContext`,
`AddressesInputContainer` from 108205, `AddressesInputItem` from 110330, `AddressesInput` export map
at 110420), `AddressesListUtils` at 110306–110326, the kit `AddressInput` implementation at 101368,
and the App English locale at 107229–107247. Line numbers are valid for this bundle only
(`bundleSha12` `48449ece0c87` in `_ds_sync.json`).

In-project mirrors of the same contracts: `components/forms/AddressesInput/AddressesInput.d.ts`,
`components/general/AddressInput/AddressInput.d.ts`,
`components/wizards/WizardPage/WizardPage.d.ts`,
`guidelines/context/selection-guide.json` (`govkit:AddressInput` entry),
`guidelines/context/registry-report.md` (AddressInput adoption-cost section), bundle README
("Select and compose", "Interaction and domain contracts").

## 1. Supported composition

There is exactly one supported shape: the member step is a `WizardPage.Step` inside the
**already existing** `WizardPage.Container`, and its body is `AddressesInput.Container` with one
`AddressesInput.Item` per row.

```tsx
// inside the existing create-DAO WizardPage.Container — do NOT add a second container
<WizardPage.Step
    id="members"
    order={/* existing step order */ 2}
    meta={{ name: 'Members' }}
    title={t('…members.title')}
    description={t('…members.description')}
>
    <MembersField name="members" chainId={chainId} />
</WizardPage.Step>
```

```tsx
// membersField.tsx
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useWatch } from 'react-hook-form';

export interface IMembersFieldProps {
    name: string;
    fieldPrefix?: string;
    chainId?: number;
}

export const MembersField: React.FC<IMembersFieldProps> = ({ name, fieldPrefix, chainId }) => {
    const fieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;
    // Row COUNT must come from form state: the container renders only as many children
    // as its internal field array currently holds (see §3).
    const rows = useWatch({ name: fieldName, defaultValue: [] }) as Array<{ address?: string }>;

    return (
        <AddressesInput.Container
            fieldPrefix={fieldPrefix}
            name={name}
            label={t('…members.label')}
            helpText={t('…members.helpText')}
        >
            {rows.map((_, index) => (
                <AddressesInput.Item key={index} index={index} chainId={chainId} />
            ))}
        </AddressesInput.Container>
    );
};
```

`AddressesInputProps` is empty in `AddressesInput.d.ts`: there is **no** renderable
`<AddressesInput>` root and **no** `AddressesInput.Group`. The "containers like
`AddressesInput.Group` wrap multiple `<AddressesInput>`s" line in
`components/forms/AddressesInput/AddressesInput.prompt.md` is generated boilerplate and does not
describe this component — ignore it. Only `Container` and `Item` exist.

## 2. Prefill (initialize existing member addresses)

Rows hydrate from the owning form's `defaultValues`; the container's `useFieldArray` reads that
name. Seed through the **wizard container's** `defaultValues` prop
(`WizardPageContainerProps.defaultValues`), merged into the existing create-DAO default values:

```tsx
defaultValues={{
    …existingCreateDaoDefaults,
    members: initialMembers.map((address) => ({ address })), // [{ address: '0x17C6…1cDD' }, …]
}}
```

Row value shape is the whole object `{ address, name }` (`IAddressInputResolvedValue`), not a bare
string. An empty row is `{ address: '' }` — that is literally what the container appends.

Two consequences to design around:

- `defaultValues` is read at mount of the form. If member addresses arrive from an async query,
  the wizard must not mount before they resolve, or they must be applied with `reset`/`replace`
  from the owning form. **[UNESTABLISHED]** — this project contains no create-DAO data hook, so
  which of the two applies depends on where the existing wizard gets its data.
- A prefilled, never-touched row is *not* validated on mount: the re-validation effect in
  `addressesInputItem` only calls `trigger` when the row is a valid address **and**
  (`isDirty || isTouched`). Invalid prefilled addresses surface on submit (wizard validation gate),
  not on arrival. If they must surface immediately, trigger validation from the step — do not
  patch the item.

## 3. Row lifecycle — the contract that breaks naive code

`AddressesInputContainer` owns the array:

```ts
const membersFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;
const { fields: membersField, append, remove, replace } = useFieldArray({ name: membersFieldName });
…
Children.map(children, (child, index) =>
    isValidElement(child) && index < membersField.length
        ? cloneElement(child, { key: membersField[index].id, ...child.props })
        : null,
);
```

- Children are **clipped** to `membersField.length` and re-keyed with the field-array `id`. A
  hardcoded list of `<AddressesInput.Item index={0} />` (as in the generated prompt examples) will
  never grow when the user presses **Add** — the appended row exists in form state with no UI.
  Render one child per row from form state.
- Provide at least as many children as rows; extra children render `null` silently, so an
  off-by-one is invisible rather than loud.
- `key` on your children is overwritten by the container. Do not rely on it for row identity.
- Add: `handleAddMember` appends `{ address: '' }`. `onAddClick` **replaces** that behavior
  entirely — if you pass it, you own the append (e.g. an import-members dialog).
- Remove: `onRemoveMember(index)` comes from `AddressesInputContext`. The container's
  `handleRemoveMember` calls `remove(index)` when `allowEmptyList`, otherwise only while
  `membersField.length > 1`. Independently, the item computes `canRemove = membersField.length > 1`
  and passes `disabled: !canRemove` to **both** remove buttons — so even with `allowEmptyList` set,
  the row button cannot delete the last row; only the menu's "Clear all" empties the list. Do not
  ship a design whose empty state is reachable only through the row button.
- The overflow menu renders only when `membersField.length > 1`. "Reset fields" appears when
  `showResetAllAction` (default `true`) and (`dirty && some row non-empty`) or the subtree has
  errors; it replaces every row with `{ address: '' }`. "Clear all" replaces with `[]` when
  `allowEmptyList`, otherwise `[{ address: '' }]`.

## 4. Editable input vs accepted/resolved address

Per row (`addressesInputItem`):

- Local `useState(value.address)` holds the **editable string**; `AddressInput.onChange` writes
  only to that state. Raw typing never reaches form state.
- `AddressInput.onAccept` writes `{ address: value?.address, name: value?.name }` into the form
  field. The input debounces its value 300 ms before resolving (verified: `_ds_bundle.js:101369`,
  `Jn(n4, { delay: 300 })`), `onAccept` emits `undefined` for invalid input or a checksum
  failure, and **does not emit while an ENS request is loading**. So between keystroke and
  resolution the form holds the *previous* accepted value: never treat it as current while an edit
  is unresolved (README, "Interaction and domain contracts").
- The form field is the **row object** at `` `${fieldName}.[${index}]` `` — not `…[index].address`.
  Register/read/clear at the row level or RHF state and the container's array diverge.
- `label` is forced to `undefined` on the inner `AddressInput`; the label/help text belong to
  `AddressesInput.Container`. `sanitizeOnBlur: false` — the App does not re-sanitize the row.
- Visual distinction between "typing" and "accepted" is the kit input's own state (member avatar,
  ENS/address toggle, checksum feedback, loading). Do not add a parallel read-only
  `AddressOutput` row unless the design calls for a separate summary; if you do, set
  `hasInteractiveAncestor` so it stays passive and adds no competing tab stop.

## 5. Invalid and duplicate reporting — through the owning form

Do not implement address policy. `addressesInputItem` registers, per row:

```ts
rules: {
    required: true,
    validate: (member) => addressesListUtils.validateAddress(member.address, membersField, index, customValidator),
}
```

`AddressesListUtils.validateAddress` (verbatim behavior):

1. `!isAddress(address)` → `'app.shared.addressesInput.item.input.error.invalid'`
2. `checkIsAlreadyInList(members, index, address)` → `'app.shared.addressesInput.item.input.error.alreadyInList'`
   — compares with `isAddressEqual` against `members.slice(0, index)` only, so **the later row of a
   duplicate pair errors and the earlier row stays clean**. Any "N duplicates" summary you build
   must account for that asymmetry.
3. `customValidator(members[index])` → `string | true`. Signature:
   `(member: IAddressInputResolvedValue) => string | true`. Returned strings are treated as
   translation keys by the shared form-field alert path — return a key, not prose.
4. otherwise `true`.

Errors land in `formState.errors` under the member field name and are rendered by the item's own
input alert; the wizard's step gate and submit read the same form state. Do not add a step-level
error banner that recomputes validity — read `formState` if you need a summary.

Re-validation: `useEffect` calls `trigger(memberFieldName)` when the row address is a valid
address and the field is dirty or touched.

Aggregate/cross-row policy (e.g. "at least N members", "must include the connected wallet") is
**not** covered by `validateAddress`. Options: per-row `customValidator`, or a field-level rule
registered by the step on the array name. **[UNESTABLISHED]** — which the existing create-DAO
form already uses for its other array fields is not in this project.

Translation keys — **establishable here**: the App English locale is compiled into `_ds_bundle.js`
(`shared.addressesInput`, lines 107229–107247) and already contains every key this step consumes:

| Key (under `app.`) | English string |
|---|---|
| `shared.addressesInput.item.input.label` | Member |
| `shared.addressesInput.item.input.placeholder` | ENS or 0x… |
| `shared.addressesInput.item.input.error.invalid` | Address is not valid. |
| `shared.addressesInput.item.input.error.alreadyInList` | Address has already been added. |
| `shared.addressesInput.item.remove` | Remove member |
| `shared.addressesInput.container.{add,more,resetFields,clearAll}` | Add / More / Reset fields / Clear all |

The kit's own inline copy (`addressInput.checksum` = "Invalid checksum", `clear`, `paste`) ships
with GovKit and needs no locale entry. Only **your step's** title/description/label/helpText keys
and any `customValidator` error keys are new and must be added to the App locale —
**[UNESTABLISHED]** which namespace the existing create-DAO steps use.

## 6. Form ownership and navigation — leave them alone

- `Wizard.Root` calls `useForm` and renders `FormProvider`; `WizardPage.Container` composes
  `Wizard.Root` with `Wizard.Form`. The wizard owns form state, the step gate, Next/Back and
  submit.
- The step contributes fields only. No `<form>`, no submit button, no `handleSubmit` in the step.
- Final submit stays on the existing `WizardPage.Container.onSubmit`; `submitLabel`,
  `submitHelpText`, `finalStep` and `initialSteps` are container-level and already set — adding the
  member step means adding one `IWizardStepperStep` (`{ id, order, meta: { name } }`) to the
  existing `initialSteps` and keeping `order` contiguous with the surrounding steps.
- Use `WizardPage.Step.disableNext` if the step must block advance beyond form validity;
  `hidden` if it is conditional on governance type.

## 7. Providers

Required around the wizard (all already present in the App shell; verify, don't re-add):

- `GukModulesProvider` — wagmi + React Query. `AddressInput` calls wagmi context hooks and
  `useQueryClient` **even when a `wagmiConfig` prop is supplied**, so this is non-optional for the
  member step (selection-guide `govkit:AddressInput` constraints; registry report).
- The effective wagmi config must contain **chain id 1 with an `ensUniversalResolver` contract**.
  `AddressInput` enables both ENS queries only when
  `config.chains.find(c => c.id === mainnet.id)?.contracts?.ensUniversalResolver` is set
  (`_ds_bundle.js:101369`); otherwise ENS resolution is silently disabled and the row accepts
  raw addresses only. The kit's bundled default config does include mainnet
  (`_ds_bundle.js:101308`), but a create-DAO shell that supplies a network-scoped `wagmiConfig`
  can drop it. **[UNESTABLISHED]** which config the existing wizard's provider stack passes.
- `DebugContextProvider` + `TranslationsProvider translations={enTranslations}` — every label,
  placeholder, error and menu item in this step is a translation key.
- `BlockNavigationContextProvider` — only for the wizard's dirty-exit confirmation. Omitting it
  no-ops the guard rather than throwing, and `AddressesInput` does not require it.
- **No `FormWrapper`.** It is for standalone/story use only.

## 8. Address, checksum and network semantics

- `enforceChecksum` defaults to `true` on `AddressInput` (verified: `_ds_bundle.js:101369`,
  `enforceChecksum: o4 = true`, alongside `chainId: u4 = mainnet.id`): the checksum failure state is
  exactly `enforceChecksum && isAddress(v) && !isAddress(v, { strict: true })`, so mixed-case
  addresses failing strict EIP-55 are rejected and accepted output is checksum-formatted. `AddressesInput.Item` does not
  expose `enforceChecksum`, so the step **cannot** relax it — the default is the product behavior.
  (The `ChecksumError` example in `AddressesInput.prompt.md` is exactly this case.)
- `onChange` may itself normalize a valid or all-uppercase address to checksum form and trims
  surrounding whitespace on blur.
- `chainId` on `AddressesInput.Item` is forwarded to `AddressInput` and selects the
  **block-explorer** network only (`buildEntityUrl({ chainId })`). **ENS resolution always uses
  mainnet**: the ENS chain is pinned to `mainnet.id` internally, never to `chainId`, and both ENS
  queries are gated on the mainnet ENS-resolver check in §7. Pass the DAO's selected network chain id so
  explorer links are right; do not expect ENS to follow it.
- Duplicate comparison uses `isAddressEqual` (checksum-insensitive), so `0xABC…`/`0xabc…` are one
  member.
- Which field of the existing wizard holds the selected chain id is **[UNESTABLISHED]** here
  (`createDaoFormNetwork.tsx` is referenced in `source-index.md` but not included in this bundle).

## 9. Tempting but incorrect

| Tempting | Why it breaks |
|---|---|
| Wrap the step in `FormWrapper defaultValues={{ members }}` to prefill | Creates a second, separate form. The inputs write to a context the wizard never reads: its validation gate and submit payload silently lose `members`. Seed via the wizard container's `defaultValues`. |
| Add a `WizardPage.Container` (or `Wizard.Root`) for the member step | Nested form/stepper ownership; the outer wizard loses the step and its fields. One container per flow. |
| Hardcode `<AddressesInput.Item index={0} />` (as in the generated examples) | Container clips children to its field-array length; **Add** appends rows that never render. Map over form state. |
| Register/read `members[i].address` | The item registers the **row object** at `` `${fieldName}.[${index}]` ``. Writing the string path desynchronizes RHF state from the field array. |
| Handle `AddressInput.onChange`/`onAccept` in the step to collect members | Editable text is deliberately local to the item; `onAccept` is debounced and silent while ENS loads. The form field is the contract. |
| Re-implement required/invalid/duplicate checks in the step | The App already owns that policy in `addressesListUtils` + the item's rules. Duplicate policy would double-report and the earlier/later asymmetry would diverge. Extend via `customValidator`. |
| Own row add/remove state in the step with your own buttons | `Container` owns `append`/`remove`/`replace` and exposes removal through `AddressesInputContext`. Use `onAddClick` only when you genuinely replace the add behavior, and then append yourself. |
| Render a clickable `AddressOutput`/row link next to the input as-is | Competing tab stop inside an interactive row. Set `hasInteractiveAncestor`. |
| `defaultOpen` on a confirm/import `Dialog.Root` | Not a substitute in this bundle; dialogs are controlled via `open`, and `close(dialogId)` — not bare `close()` — returns from a child dialog. |
| `Page.Container` for step scaffolding | Requires the App query client; use a plain wrapper, or `Page.Main`/`Page.Aside`. |
| Styling rows with ad-hoc CSS | Row chrome is `Card` + `border border-neutral-100 p-4 shadow-neutral-sm` from the item itself; use token-backed utilities and component props (`variant`, `size`), not invented values. |

## 10. Not establishable from this project

- The existing create-DAO wizard's real step ids, `order` values, `initialSteps`, `defaultValues`
  shape, and the member field's actual name/`fieldPrefix` (`createDaoFormDefinitions.ts` and the
  `createDaoForm*` components are referenced in `source-index.md` but not included here).
- Where existing member addresses come from (API hook vs. route params vs. prior step) and
  therefore whether prefill is `defaultValues` or a `reset`/`replace`.
- ~~Presence and wording of every translation key listed in §5~~ — resolved: the keys are in the
  bundled App locale (§5). Still open: the namespace and wording of the step's own copy keys.
- `useFormField` (the App hook the item uses for registration, alert wiring and `sanitizeOnBlur`)
  is compiled into the bundle but not exported on `window.GovUiKit`. The step does not call it;
  if you need the same alert behavior for a sibling field, confirm its import path in the repo.
- Whether a second `useFieldArray` on the same name (instead of the `useWatch` in §1) is
  acceptable in the App's react-hook-form version — `useWatch` is the safe form here; confirm
  against the repo before choosing the alternative.
- Minimum/maximum member policy, and whether this step should pass `allowEmptyList`.
- Wizard `analytics` (`flow`, `props`) values for this step.
- Any deployment/transaction consequence of the member list (handled after submit, outside this
  step).
- Whether the candidate bundle's `AddressesInput`/`AddressInput` behavior matches what the App
  will ship: this is a candidate from unmerged PRs, and the registry it was generated from is not
  included. Re-verify against the recorded revisions before merge, and re-check on any
  `@aragon/gov-ui-kit` bump (the GovKit link above goes stale; the generated context does not).
