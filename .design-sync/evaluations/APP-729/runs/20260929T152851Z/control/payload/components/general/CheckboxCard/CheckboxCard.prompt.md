CheckboxCard from @aragon/gov-ui-kit. Use via `window.GovUiKit.CheckboxCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CheckboxCardProps {
  /** Label of the checkbox. */
  label: string;
  style?: CSSProperties;
  className?: string;
  /** Id of the checkbox. */
  id?: string;
  /** Additional children to render when the checkbox is checked. */
  children?: React.ReactNode;
  /** Indicates if the checkbox is disabled. */
  disabled?: boolean;
  /** The checked state of the checkbox. */
  checked?: boolean | "indeterminate";
  /** Callback when the checked state changes. */
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Avatar of the checkbox card. */
  avatar?: string;
  /** Description of the checkbox. */
  description?: string;
  /** Optional tag for the checkbox. */
  tag?: ITagProps;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <CheckboxCard
        className="w-full"
        label="Token voting"
        tag={{ label: 'Governance', variant: 'info' }}
    />
)
```

### WithDescription

```jsx
() => (
    <CheckboxCard
        className="w-full"
        description="Members vote with the voting power of their governance tokens."
        label="Token voting"
        tag={{ label: 'Active', variant: 'success' }}
    />
)
```

### CheckedWithChildren

```jsx
() => (
    <CheckboxCard
        checked={true}
        className="w-full"
        description="Any wallet holding an Aragon DAO membership NFT can vote."
        label="Multisig approval"
        tag={{ label: 'Selected', variant: 'primary' }}
    >
        <p className="text-neutral-500">
            3 of 5 signers required to execute proposals.
        </p>
    </CheckboxCard>
)
```

### Indeterminate

```jsx
() => (
    <CheckboxCard
        checked="indeterminate"
        className="w-full"
        description="Some permissions in this group are granted."
        label="Treasury permissions"
        tag={{ label: 'Partial', variant: 'warning' }}
    />
)
```

### Disabled

```jsx
() => (
    <CheckboxCard
        className="w-full"
        description="Available after the DAO upgrade to v1.4 is executed."
        disabled={true}
        label="Gasless voting"
        tag={{ label: 'Locked', variant: 'neutral' }}
    />
)
```
