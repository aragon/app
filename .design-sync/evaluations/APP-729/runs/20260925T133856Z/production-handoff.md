# Implementation handoff — prefilled member-management step in the DAO creation wizard

Target: add a member-management step to an **existing** full-page wizard. Everything below is read out of this project's synced sources (`@aragon/gov-ui-kit@2.10.0`, bundle `bundleSha12: 40afc3f4f52b`). Nothing here is invented; unverifiable items are collected in §11 and marked **[CANNOT ESTABLISH]**.

---

## 1. Supported composition

There is exactly one supported composition for this screen:

```
DebugContextProvider
└─ TranslationsProvider translations={enTranslations}
   └─ BlockNavigationContextProvider
      └─ GukModulesProvider
         └─ WizardPage.Container  (owns useForm + FormProvider + the <form> + footer nav)
            └─ WizardPage.Step id/order/meta
               └─ AddressesInput.Container name=… label=… helpText=…
                  ├─ AddressesInput.Item index={0}
                  ├─ AddressesInput.Item index={1}
                  └─ …one Item per entry in the field array
```

`AddressesInput.Container` does **not** render its own rows. It clones the children you pass and drops any child at `index >= fields.length` (`Children.map` → `null`). The caller owns the mapping; the Container owns append/remove/replace and the Add + More menu.

Verified in `_ds_bundle.js`:

| Piece | Lines | Upstream path |
|---|---|---|
| `AddressesInput = {Container, Item}` | 121974–121978 | `apps/app/src/shared/components/forms/addressesInput/index.ts` |
| `AddressesInputContainer` | 119835–119977 | `…/addressesInputContainer/addressesInputContainer.tsx` |
| `AddressesInputItem` | 121885–121972 | `…/addressesInputItem/addressesInputItem.tsx` |
| `addressesListUtils` (validate/dedupe) | 121860–121881 | `apps/app/src/shared/utils/addressesListUtils/addressesListUtils.ts` |
| `AddressInput` (kit) | 103854–103908 | gov-ui-kit `AddressInput` |
| `WizardPageContainer` / `WizardPageStep` | 105271–105307 / 105317–… | `…/wizards/wizardPage/*` |
| `WizardRoot` / `WizardForm` / `WizardStep` / `useWizardFooter` | 104970–105051 / 104727–104752 / 105057–105088 / 105102–105140 | `…/wizards/wizard/*` |
| `GukModulesProvider` + default wagmi config / QueryClient | 103764–103770 | gov-ui-kit modules provider |
| i18n keys for this feature | 109657–109677 | app `en` translations |

Revision-matched example, same sync: `components/forms/AddressesInput/AddressesInput.prompt.md` (Default / Filled / ChecksumError) and its compiled preview `_preview/AddressesInput.js:108–147`; wizard examples in `components/wizards/WizardPage/WizardPage.prompt.md` and `_preview/WizardPage.js:108–200`. Source hashes for those files are in `_ds_sync.json → sourceHashes`.

---

## 2. Exact contracts

### `AddressesInput.Container` props (read from the compiled component, 119836–119844)

| Prop | Type / behavior |
|---|---|
| `name` | field-array name (required) |
| `fieldPrefix` | optional; effective name is `` fieldPrefix ? `${fieldPrefix}.${name}` : name `` |
| `label` | label for the whole list (passed to the shared `InputContainer` with `useCustomWrapper`) |
| `helpText` | help text above the list |
| `allowEmptyList` | when false/omitted, remove is refused below 1 row and "Clear all" replaces with `[{address:''}]` |
| `onAddClick` | overrides the Add button handler **entirely** — if you pass it, you must append yourself |
| `showResetAllAction` | default `true`; gates only the "Reset fields" menu item |
| `children` | the `AddressesInput.Item` elements |

Container internals worth knowing: `useFieldArray({name})` for `fields/append/remove/replace`; `useWatch({name, defaultValue: []})` for emptiness; dirty/error detection walks `formState.dirtyFields` / `formState.errors` at that path. It re-keys each child with the field-array `id` — your own `key` is discarded, so do **not** key by address.

### `AddressesInput.Item` props (121886)

Only four are read: `index` (number, required), `disabled`, `customValidator`, `chainId`. **There is no pass-through to `AddressInput`** — the Item spreads its own `useFormField` result and forces `label: undefined`. `placeholder`, `enforceChecksum`, `hideControls`, `helpText` etc. are not configurable per row.

### Field shape

Item field name: `` `${fieldName}.[${index}]` ``. The stored value is an object:

```ts
{ address?: string; name?: string }   // name = resolved ENS, written from AddressInput onAccept
```

Append default is `{ address: '' }`. Rows are objects, never bare strings.

### Registered validation (121901–121915)

```
rules: { required: true, validate: (member) => addressesListUtils.validateAddress(member.address, members, index, customValidator) }
sanitizeOnBlur: false
```

`customValidator` signature: `(member: {address?, name?}) => true | string`. It runs **last**, only after `isAddress` and the duplicate check pass. Return an i18n key or a message string.

---

## 3. Initializing existing member addresses

Hydrate through the wizard's own form, not through props:

```jsx
<WizardPage.Container
  initialSteps={createDaoSteps}
  defaultValues={{ /* …other steps…, */ members: existingMembers }}
  submitLabel="Deploy your DAO"
  onSubmit={handleSubmit}
>
```

`WizardPage.Container` forwards `defaultValues` to `Wizard.Root`, which calls `useForm({ mode: 'onTouched', defaultValues })` (104982–104985). `useFieldArray` hydrates from those defaults only — an array supplied later via props or a re-render will not populate the list; changing it afterwards needs `reset`/`replace`.

`existingMembers` must already be `[{ address }, …]`. Prefer checksummed strings: a mixed-case address that fails EIP-55 renders the row in a critical checksum state on first paint (this is what the `ChecksumError` example in `AddressesInput.prompt.md` demonstrates).

Render one `Item` per row, driven by the live field-array length (extra children are silently dropped, missing children mean invisible rows that still validate):

```jsx
const members = useWatch({ name: 'members' }) ?? [];   // react-hook-form
…
<AddressesInput.Container name="members" label="Members" helpText="…">
  {members.map((_, index) => <AddressesInput.Item index={index} key={index} chainId={chainId} />)}
</AddressesInput.Container>
```

`useWatch` / `useFieldArray` come from the app's own `react-hook-form` dependency; this project's bundle re-exports only `useFormContext` (a thin assert wrapper, bundle 103800–103803).

---

## 4. Add / edit / remove — already implemented, do not rebuild

- **Add**: Container's secondary `PLUS` button appends `{address:''}` (119861–119867).
- **Remove**: per-row tertiary `CLOSE` button (desktop + mobile variants), `disabled` when `fields.length <= 1`; `handleRemoveMember` additionally refuses to drop the last row unless `allowEmptyList`.
- **More menu** (`DOTS_VERTICAL`) appears only when `fields.length > 1`: "Reset fields" (blanks every row; shown when `showResetAllAction && ((dirty && some non-empty) || hasErrors)`) and "Clear all".
- **Edit**: the Item keeps raw keystrokes in local state (`addressInput`) seeded from the field value at mount, and writes to the form **only** on `AddressInput`'s `onAccept` (121918–121922). Raw, not-yet-valid text is therefore not in form state — expect stale/empty form values while a user is mid-typing, and don't read the field to drive row UI.

Copy is fixed by i18n (bundle 109658–109676): `Add`, `More`, `Reset fields`, `Clear all`, row label `Member`, placeholder `ENS or 0x…`, remove aria-label `Remove member`.

---

## 5. Editable input vs accepted / resolved address

This distinction is `AddressInput` behavior; do not build a second read-only presentation and do not swap in `AddressOutput`.

- Not focused + value is a valid address → value renders **truncated** (`truncateAddress`, 6/4) with the blockies/ENS avatar, a block-explorer link button and a copy button.
- Focused → full raw text, plus a Clear button; empty → a Paste button.
- An `ENS` / `0x…` toggle button appears when the counterpart of the current value has resolved and the field isn't focused.
- While resolving, the avatar slot is replaced by a spinner.
- Blur trims the value.
- Row chrome: `Card` with `border border-neutral-100 p-4 shadow-neutral-sm`; the label lives on the Container, not the row.

---

## 6. Address resolution, checksum, and network semantics

From `AddressInput` (103854–103908):

- `enforceChecksum` defaults **true**. `onChange` normalizes input: strict-checksum-valid or all-uppercase hex is rewritten with `addressUtils.getChecksum`; anything else passes through raw.
- A value that `isAddress(...)` but fails `isAddress(..., {strict:true})` sets a **critical** alert with `coreCopy.addressInput.checksum` = "Invalid checksum" and calls `onAccept(undefined)` — so the form field is not updated and the wizard cannot advance.
- Input is debounced **300 ms** before resolution and before `onAccept`.
- `onAccept` payload: `{ address, name? }`. Address input → `address = getChecksum(input)`, `name = reverse-resolved ENS or undefined`. ENS input → `address = resolved address`, `name = normalize(input)`.
- **ENS always resolves on mainnet.** `useEnsAddress`/`useEnsName` are called with `chainId: mainnet.id` regardless of the `chainId` prop, and are enabled only when the resolved wagmi config contains a mainnet chain with `contracts.ensUniversalResolver`. The `chainId` prop is used **only** to build the block-explorer URL.
- The component primes the react-query cache in both directions (address↔name) so the toggle is instant.
- The Item re-runs `trigger(fieldName)` whenever the stored address changes and the field is dirty or touched (121925–121930).

---

## 7. Reporting invalid and duplicate entries through the owning form

Row-level, from `addressesListUtils` (121866–121879) — namespace `app.shared.addressesInput.item.input.error`:

- not an address → `…invalid` → "Address is not valid."
- already present → `…alreadyInList` → "Address has already been added."
- otherwise `customValidator(member)`.

Duplicate detection is **asymmetric**: `checkIsAlreadyInList` only scans `members.slice(0, currentIndex)` with `isAddressEqual`, so the later of a duplicate pair is flagged and the earlier stays clean. Symmetric highlighting is not available without a `customValidator` that does its own full-list scan.

Step-level, from `useWizardFooter` (105089–105140): `getValidationStatus` inspects `formState.errors` and yields `valid | required | invalid | invalid-required`; the step renders a critical `AlertCard` with `app.shared.wizardPage.step.error.<status>.{title,description}` — but only once `formState.isSubmitted`, i.e. after the user presses Next/Submit. Note that `getValidationStatus` reads `errors[key]?.type` at the **top level**; for an array field the top-level node is an array without a `type`, so blank rows classify as `invalid`, not `required`. Observed behavior of the synced revision — do not "fix" it inside the step.

Back navigation calls `clearErrors()` for the entire form (105129–105132).

---

## 8. Preserve existing form ownership and navigation

- `Wizard.Root` owns `useForm` and renders the single `FormProvider`; `mode: 'onTouched'`; `useDevTool: true` (a no-op shim in this bundle).
- `Wizard.Form` renders the only `<form>`. Its submit handler routes `hasNext ? nextStep : onSubmit` through `handleSubmit(…, onInvalid)`, and `preventDefault`/`stopPropagation` first. Adding fields to a step therefore automatically gates Next on their validity.
- On `isSubmitSuccessful`, `Wizard.Root` calls `reset(undefined, { keepDirty: true, keepValues: true })`.
- `Wizard.Step` registers/unregisters itself by `{id, order, meta}` in an effect and renders `null` unless it is the active step — inactive steps are unmounted but their values stay in form state. It scrolls to top on activation unless `disableScrollToTop`.
- `useConfirmWizardExit(formState.isDirty)` pushes history state and installs `beforeunload`/`popstate` guards; it needs `BlockNavigationContextProvider` above.
- The step's footer (Back / Next / Submit, help text, validation alert) is rendered by `WizardPage.Step`. Do not add buttons of your own; use `nextDropdownItems` if the step must branch.

---

## 9. Provider assumptions

Required, outermost → innermost: `DebugContextProvider` → `TranslationsProvider translations={enTranslations}` → `BlockNavigationContextProvider` → `GukModulesProvider`. The DS preview harness for `AddressesInput` uses exactly this stack (`_preview/AddressesInput.js:110`, with `FormWrapper` standing in for the wizard's form).

`GukModulesProvider` defaults (103764–103770): `WagmiProvider` with `createConfig({ chains: [arbitrum, arbitrumSepolia, base, baseSepolia, mainnet, polygon, polygonAmoy, sepolia], client: http() })` and a `QueryClient` with `staleTime: 120_000`, `gcTime: 300_000`. Both are overridable via `wagmiConfig` / `queryClient` props. Without this provider, `AddressInput` (and therefore every row) throws at render: it calls `useConfig()` and `useQueryClient()`.

In the real app the provider stack already exists at the route level — **[CANNOT ESTABLISH]** whether it passes an app-specific wagmi config/transports; if it does, ENS resolution depends on that config carrying a mainnet chain with `ensUniversalResolver`.

---

## 10. Tempting but incorrect

- **A second form context.** Do not put `FormWrapper`, `FormProvider`, `useForm`, or a nested `<form>` inside the step. `FormWrapper` (bundle 126088) exists for the DS previews. Nesting one detaches the members field from the wizard's `handleSubmit`, so Next stops gating on it and `onSubmit` never sees the rows.
- **Local `useState` for the list.** Ownership must stay in the wizard form; a local array breaks validation, the footer error summary, dirty-state exit blocking, and value retention across steps.
- **`AddressesInput.Item` outside a `Container`.** `useAddressesInputContext` asserts: "the hook must be used within AddressesInputContextProvider".
- **A self-managed Item count.** Children beyond `fields.length` are silently rendered as `null`; fewer children than rows means hidden rows that still block submit.
- **Keying Items by address.** The Container overwrites keys with field-array ids; keying by a value that changes on every accepted edit would remount the row and drop in-progress input.
- **Passing `onAddClick` "for analytics".** It replaces the append; the Add button becomes a no-op unless you append yourself.
- **`allowEmptyList` to be permissive.** It also removes the minimum-one guard, so "Clear all" can leave `[]` — only use it if the step and the downstream payload tolerate zero members.
- **Trying to relax the checksum.** `enforceChecksum` is not forwarded by `Item`; there is no per-row override. Fix the prefill data instead.
- **Expecting `chainId` to move ENS off mainnet.** It only changes the explorer link.
- **Building a "resolve" button, an accepted-address chip, a read-only `AddressOutput` row, or your own dedupe banner.** All four duplicate behavior the composition already provides.
- **Importing `useFormField`.** Internal; not exported from the bundle.
- **`Page.Container`.** Per the DS README it needs the app's QueryClient and is not in this bundle.

---

## 11. Not establishable from this project — decide with the app repo

1. The existing wizard's file path, step `id`/`order`/`meta`, `initialSteps` array, and whether it already passes `analytics`.
2. The current `defaultValues` shape and whether members live under a prefix (`fieldPrefix`, e.g. `membership`), plus the field name the rest of the flow expects.
3. Where the prefilled addresses come from (query, plugin settings, connected wallet) and whether they arrive checksummed.
4. How `chainId` for the rows is derived (presumably the network selected in an earlier step) and the app's production wagmi config/RPCs.
5. Whether downstream encoding requires checksummed vs lowercased addresses, and whether the resolved ENS `name` on each row must be persisted or stripped before submit.
6. Any minimum/maximum member count, or a required "must include the deployer" rule — these belong in `customValidator` or a step-level rule, both **[CANNOT ESTABLISH]** here.
7. Copy for the step title/description/help text and its translation keys.
8. Exact TypeScript prop interfaces: the shipped `AddressesInput.d.ts` and `WizardPage.d.ts` are `[key: string]: unknown` stubs. Every prop name in §2 was read from the compiled bundle, so treat the app repo's `.tsx` as the type authority.

---

## 12. Reference composition (verified props only)

```jsx
<WizardPage.Step
  id="members"
  order={2}
  meta={{ name: 'Members' }}
  title="Add your members"
  description="These wallets can create and vote on proposals."
>
  <AddressesInput.Container
    name="members"
    label="Members"
    helpText="Paste an address or an ENS name. Duplicates are rejected."
  >
    {members.map((_, index) => (
      <AddressesInput.Item index={index} key={index} chainId={chainId} />
    ))}
  </AddressesInput.Container>
</WizardPage.Step>
```

`members` from `useWatch({ name: 'members' })`; `chainId` from the wizard's network step. No other props are read by these components in `@aragon/gov-ui-kit@2.10.0`.
