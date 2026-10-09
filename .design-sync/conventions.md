# Aragon Governance UI Kit — usage conventions

This design system is `@aragon/gov-ui-kit`, compiled from `packages/gov-ui-kit` in the
`aragon/app` repository. Previews are the kit's own Storybook stories. Font: **Manrope**
(bundled). How the Aragon App composes these components (forms, wizards, dialogs, copy) is
documented in the App, at `apps/app/docs/projectDocs/formsAndWizards.md`.

## Source of truth

When sources disagree, trust them in this order: the component's `.d.ts` and the compiled
bundle, then its preview (its Storybook story), then its **Usage notes**, then this guide.
Kit source, stories and tests live under `packages/gov-ui-kit/src/core` and
`packages/gov-ui-kit/src/modules`.

## Where the detail lives

- **Usage notes** at the end of a component's prompt come from the kit's Storybook docs
  page for that component. They hold contracts the props table doesn't show: render
  conditions, controlled state, required parents, layout defaults.
- `guidelines/selection-guide.md` says which export fits an intent, what to use instead,
  the key-prop contracts and how compounds compose. Its **Allowed values** section lists
  every enum and string-union value. A `.d.ts` prints `unknown` for a type too wide to
  inline (`IconType`, `IllustrationObjectType`, the `EmptyState` button configs); take the
  values from there instead of guessing.
- `guidelines/src/**` holds the kit's own Storybook pages for the providers, modules setup
  and tokens.

## Select and compose

- Prefer a kit primitive or compound component when its contract matches the interaction.
  Compound namespaces are aliases of their direct exports: compose
  `Dialog.Root/Header/Content/Footer`, `DataList.Root/Container/Filter/Pagination`,
  `Accordion.Container/Item/ItemHeader/ItemContent` and `Tabs.Root/List/Trigger/Content`
  rather than treating each member as a standalone alternative.
- Compound children can require their parent's context; follow the component's story.
- `modules` components that read chain data (`AddressInput`, `Wallet`, `MemberAvatar`) need
  `<GukModulesProvider>` for wagmi and query context. Components that only use module copy
  work without it. Check the component's story before choosing a provider stack.

## Accessibility

Preserve Radix labelling, focus order, keyboard interaction and visible focus rings. Don't
nest interactive controls: set `AddressOutput.hasInteractiveAncestor` inside clickable rows
or links so it renders passive. Kit copy lives in `src/core/assets/copy/coreCopy.ts` and
`src/modules/assets/copy/modulesCopy.ts`.

## Styling idiom

Component look comes from props, not classes: `variant` (Button
`primary|secondary|tertiary|ghost|success|warning|critical`; alerts
`info|success|warning|critical`), `size` (`sm|md|lg`) and state props (`disabled`,
`isLoading`). Selection state flows through group parents (`RadioGroup`/`ToggleGroup`
`defaultValue`), not a per-item `checked`.

For layout, use token-backed utilities. The stylesheet is the kit's compiled `build.css`,
which contains only utilities the kit's own source uses: a token existing does not mean its
utility does, and nothing compiles new Tailwind classes at design time. Present in this
build:

| Family | Utilities |
|---|---|
| Background | `bg-primary-{50,300,400,500}`, `bg-neutral-{0,50,100,200,300,400,800}`, `bg-info-{100,200,300,500}`, `bg-success-{100…500}`, `bg-warning-{100…500}`, `bg-critical-{100,200,300,500}` |
| Text | `text-primary-{300,400}`, `text-neutral-{0,50,200,300,400,500,600,800,900}`, `text-{info,success,warning,critical}-{500,600,800,900}` |
| Border | `border-primary-{100,300,400}`, `border-neutral-{0,100,200,300}`, `border-{info,success}-{300,400}`, `border-{warning,critical}-{300…600}` |
| Radius | `rounded-none/md/lg/xl/2xl/3xl/full`; `rounded-xl` is the 12px card radius. No `rounded-sm`. |
| Shadows | `shadow-none`, `shadow-neutral{,-sm,-md,-lg}`, `shadow-primary{,-sm,-lg,-xl}`, `shadow-info{,-md}`, `shadow-success{,-sm,-md}`, `shadow-warning{,-sm,-md}`, `shadow-critical{,-sm,-md}`. No `shadow-sm`. |
| Type | `text-xs/sm/base/lg/xl/2xl/3xl`, `font-normal/semibold`; headings via `Heading` |
| Spacing | Common `p-*`/`gap-*` steps; check `_ds_bundle.css` before relying on a less common one (`space-y-2` exists only as `md:space-y-2`). |

Token custom properties are `--color-*`, `--radius-*` and `--guk-*`; `styles.css` imports
`_ds_bundle.css`. For a colour with no utility above, use its token in `style`
(`style={{ color: 'var(--color-primary-600)' }}`). Token scales: primary 50–900; neutral
0, 50–600, 800, 900; info, success, warning and critical 100–600, 800, 900. There is no
`-700` outside primary. Icons: `<Icon icon={IconType.PLUS} />`; icons inherit
`currentColor`.

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
