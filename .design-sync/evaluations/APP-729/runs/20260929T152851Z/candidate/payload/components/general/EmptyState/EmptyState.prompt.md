EmptyState from @aragon/gov-ui-kit. Use via `window.GovUiKit.EmptyState` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface EmptyStateProps {
  humanIllustration?: IIllustrationHumanProps;
  objectIllustration?: IIllustrationObjectProps;
  /** Title of the empty state. */
  heading: string;
  /** Description of the empty state. */
  description?: string;
  /** Renders the state as horitontal when set to false. */
  isStacked?: boolean;
  /** Primary button of the empty state. The primary button is only rendered on the stacked variant. */
  primaryButton?: unknown | Omit<IButtonBaseProps, "children" | "variant" | "size"> & IButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; } & { label: string; };
  /** Secondary button of the empty state. */
  secondaryButton?: unknown | Omit<IButtonBaseProps, "children" | "variant" | "size"> & IButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; } & { label: string; };
  /** Additional class names to be added to the empty state. */
  className?: string;
}
```

## Examples

### Default

```jsx
() => (
    <EmptyState
        description="Once the DAO receives assets, they will show up here."
        heading="No transactions yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
    />
)
```

### StackedWithActions

```jsx
() => (
    <EmptyState
        description="Create the first proposal so members can vote on it."
        heading="No proposals yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
        primaryButton={{ label: 'Create proposal' }}
        secondaryButton={{ label: 'Learn more' }}
    />
)
```

### HorizontalWithObject

```jsx
() => (
    <EmptyState
        description="Deposit tokens into the treasury to start funding community initiatives."
        heading="Treasury is empty"
        isStacked={false}
        objectIllustration={{ object: 'WALLET' }}
        secondaryButton={{ label: 'Deposit assets' }}
    />
)
```

### WithHumanIllustration

```jsx
() => (
    <EmptyState
        description="You have not delegated your voting power yet. Delegate to an active member to keep the DAO moving."
        heading="No delegation set"
        humanIllustration={{
            accessory: 'BUDDHA',
            body: 'VOTING',
            expression: 'SMILE',
            hairs: 'MIDDLE',
            sunglasses: 'BIG_ROUNDED',
        }}
        primaryButton={{ label: 'Delegate votes' }}
    />
)
```
