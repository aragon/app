# Aragon App Design System — usage conventions

This is the maintained usage guide for the App design-sync surface. It connects
the generated GovKit selection view to the source contracts, Storybook stories,
tests and App examples. It is not a second component catalog.

## Find the right source

- Start component selection with APP-726's generated GovKit selection view when
  that dependency is present. It is derived from the APP-726 registry; use
  that registry for curated intent, provenance and authoritative source
  references. This guide does not duplicate the catalog while APP-726 is under
  review. Do not infer support from a preview or component name alone.
- The APP-726 artifact used here is revision
  `03b3beda1518f6dd94973c2e6759268c22257dcc`. Its audited baseline is App
  `3c9bb798f3679fb2eb8052a192847ab2274ed1d5` plus GovKit
  `64b517f5b90052797ecaced5f15ab616b5733f30` (`@aragon/gov-ui-kit` 2.11.4).
  APP-1208 must refresh this identity before consuming the guide in a bundle.
- The kit owns public component props, stories, tests and reusable governance
  semantics. The App owns product composition, provider wiring, form policy,
  translations and application/domain side effects. The registry records these
  source references; it does not invent named team ownership.

Two layers are exposed in one bundle: **`@aragon/gov-ui-kit`** (groups `general`,
all kit components) and **the Aragon App's shared components** (groups `shared`,
`wizards`, `forms` — Wizard, WizardPage, WizardDialog, Page, StatCard, CtaCard,
Banner and App form inputs). Font: **Manrope** (bundled).

## Select and compose

- Prefer a kit primitive or compound component when its contract matches the
  interaction. Compound namespaces and their direct exports are aliases of the
  same implementation: compose `Dialog.Root/Header/Content/Footer`,
  `DataList.Root/Container/Filter/Pagination`,
  `Accordion.Container/Item/ItemHeader/ItemContent` and
  `Tabs.Root/List/Trigger/Content` rather than treating every member as a
  standalone alternative.
- Kit core components need no provider — Button, Card, DataList, Dialog and
  core forms work bare.
- Module components (`ProposalDataListItem`, `ProposalVoting`, `ProposalActions`,
  `VoteDataListItem`, `DaoDataListItem`, `MemberDataListItem`,
  `AssetDataListItem`, `TransactionDataListItem`, `Wallet`, `AddressInput` and
  `ActionSimulation`) read web3 context. Wrap them in
  `<GukModulesProvider>`; without it they throw at render.
- App components that show text need
  `<DebugContextProvider><TranslationsProvider translations={enTranslations}>…`.
  Wizards additionally need `<BlockNavigationContextProvider>`.
- App form inputs (`AddressesInput`, `ResourcesInput`, `AdvancedDateInput`,
  `AvatarInput`, `NumberProgressInput`, `AutocompleteInput`) read react-hook-form
  context. Wrap them in the exported `<FormWrapper defaultValues={{…}}>`;
  array-backed lists hydrate only from `FormWrapper.defaultValues`.
- Dialogs open through the controlled `open` prop on `Dialog.Root` or
  `DialogAlert.Root`; `defaultOpen` is not a substitute in this bundle. Nested
  App dialogs close their own location when returning to a parent flow.

## Interaction and domain contracts

- `AddressInput.onChange` is the raw text channel. `onAccept` is the resolved
  `{ address, name }` channel and reports `undefined` until the value is valid.
  The default enforces EIP-55 checksums; ENS resolution is on mainnet, while
  `chainId` controls explorer links. The App's `AddressesInput` owns required,
  duplicate and form-level validation — do not replace that policy with a
  single-input callback.
- `Button` renders a native button unless `href` is supplied, then renders a
  link. `isLoading` disables interaction and replaces icons with a spinner;
  `disabled` on a link uses `aria-disabled` and prevents navigation.
- `ActionSimulation` displays caller-supplied simulation state and calls
  `onSimulate`; it does not execute a simulation. Keep execution and transaction
  lifecycle handling in the App.
- Use the exported proposal status vocabulary and its mapping deliberately:
  `ACTIVE`, `ADVANCEABLE` and `EXECUTABLE` are actionable/info states;
  `ACCEPTED` and `EXECUTED` are success states; `FAILED`, `EXPIRED`,
  `REJECTED` and `VETOED` are critical states; `DRAFT`, `PENDING` and
  `UNREACHED` are neutral. Do not collapse these into a generic “complete”.
- Full-page flows use `WizardPage.Container` and `WizardPage.Step`; short
  in-context flows use `WizardDialog.Container` and `WizardDialog.Step` inside
  the kit dialog/provider stack. Page scaffolding uses `Page.Main` and
  `Page.Aside`; `Page.Container` requires the App query client and is not a
  standalone bundle primitive.

## Styling, accessibility and copy

- Tailwind v4 utilities are backed by the kit tokens. Read `styles.css` and the
  source token files before adding a value. Use token utilities, not raw hex/rgb,
  custom CSS files, arbitrary spacing or invented class names. The emitted
  utility set is source-scan dependent; a token existing in CSS does not prove
  that an unreferenced utility is available.
- Current emitted families include colors
  (`primary`, `neutral`, `info`, `success`, `warning`, `critical`), the standard
  spacing scale, `rounded-none/sm/md/lg/xl/full`, and the documented shadow
  families. `rounded-2xl`, `rounded-3xl` and `shadow-neutral-lg` are not emitted
  in this baseline. Recheck the emitted set after a kit or token change; APP-1208
  must reconcile these references with APP-727's accepted token baseline.
- Preserve Radix labeling, focus order, keyboard interaction and visible focus
  rings when composing. Do not nest interactive controls: set
  `AddressOutput.hasInteractiveAncestor` for clickable rows/links so it becomes
  passive and does not add a competing tab stop. Test through roles, labels and
  visible text, not classes or internal DOM structure.
- App copy comes from `TranslationsProvider`/`useTranslations`; GovKit shared
  copy lives in `src/core/assets/copy` and `src/modules/assets/copy`. Reuse
  translation keys and existing domain terms for labels, loading, empty, error
  and transaction states. Keep protocol facts and action consequences explicit;
  do not turn a discussion question or a preview example into product policy.

## Building screens and flows

- Full-page wizard (create-DAO-style flows):
  `WizardPage.Container` with `initialSteps`, `submitLabel`, `finalStep` and
  `onSubmit`, containing `WizardPage.Step`.
- Dialog wizard: `WizardDialog.Container`/`WizardDialog.Step` inside the kit
  `Dialog.Root` and `DialogProvider`.
- Page scaffolding: `Page.Main` + `Page.Aside` with `Page.Header`,
  `Page.Content`, `Page.MainSection` and `Page.AsideCard`. Do not use
  `Page.Container` without the App query client; use a plain wrapper.
- Stat/CTA surfaces: `StatCard`, `CtaCard`, `Banner` and `Carousel`.
  Transaction step progress uses `AppTransactionStatus.Container`/`.Step`.

## Styling idiom

| Family | Real values |
|---|---|
| Colors | `primary-{50…900}`, `neutral-{0,50,100,200,300,400,500,600,800,900}`, `info/success/warning/critical-{100…900}` as `bg-*`, `text-*` or `border-*` |
| Radius | `rounded-none/sm/md/lg/xl/full` plus side/corner variants; `rounded-xl` is the 12px card radius |
| Spacing | Standard Tailwind scale (`p-4`, `gap-3`, `space-y-2`…) |
| Type | `text-xs/sm/base/lg/xl/2xl/3xl`, `font-normal/semibold`; headings via `Heading` |
| Shadows | `shadow-none`, `shadow-sm`, `shadow-neutral{,-sm,-md}`, `shadow-primary{,-sm,-lg,-xl}`, `shadow-info{,-md}`, `shadow-success{,-sm,-md}`, `shadow-warning{,-sm,-md}`, `shadow-critical{,-sm,-md}` |

Component look is controlled by props, not classes: `variant` (for example
Button `primary|secondary|tertiary|ghost|success|warning|critical`; alerts
`info|success|warning|critical`), `size` (`sm|md|lg`) and state props
(`disabled`, `isLoading`). Selection state flows through group parents
(`RadioGroup`/`ToggleGroup` `defaultValue`), not per-item `checked`.

## Detailed source references

- `styles.css` imports `_ds_bundle.css`: token custom properties are
  `--color-*`, `--radius-*` and `--guk-*`.
- In the generated bundle, per-component contracts are under
  `components/general/<Name>/<Name>.d.ts` and `<Name>.prompt.md`. In source,
  follow the registry's `kit:`/`app:` references to the implementation,
  co-located story and test.
- Icons use `<Icon icon={IconType.PLUS} />`; `IconType` is exported and icons
  inherit `currentColor`.

## Example

```tsx
import { Button, Card, Heading, IconType, Progress, Tag } from '@aragon/gov-ui-kit';

const ProposalCard = () => (
    <Card className="flex w-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
            <Heading size="h3">Increase treasury allocation</Heading>
            <Tag label="Active" variant="info" />
        </div>
        <p className="text-neutral-500">Allocate 50,000 USDC to the grants program for Q3.</p>
        <Progress value={64} variant="primary" />
        <div className="flex gap-3">
            <Button variant="primary" size="md">Vote now</Button>
            <Button variant="tertiary" size="md" iconRight={IconType.LINK_EXTERNAL}>View details</Button>
        </div>
    </Card>
);
```
