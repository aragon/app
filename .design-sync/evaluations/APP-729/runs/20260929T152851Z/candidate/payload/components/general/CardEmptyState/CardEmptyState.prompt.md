CardEmptyState from @aragon/gov-ui-kit. Use via `window.GovUiKit.CardEmptyState` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CardEmptyStateProps {
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
    <CardEmptyState
        className="w-full"
        description="Create the first proposal to start making decisions together."
        heading="No proposals yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
    />
)
```

### WithActions

```jsx
() => (
    <CardEmptyState
        className="w-full"
        description="The DAO treasury is empty. Deposit assets to start funding proposals."
        heading="No assets found"
        objectIllustration={{ object: 'WALLET' }}
        primaryButton={{ label: 'Deposit assets' }}
        secondaryButton={{ label: 'Learn more' }}
    />
)
```

### Horizontal

```jsx
() => (
    <CardEmptyState
        className="w-full"
        description="Invite members or distribute the governance token to grow the community."
        heading="No members yet"
        isStacked={false}
        objectIllustration={{ object: 'USERS' }}
        secondaryButton={{ label: 'Add members' }}
    />
)
```
