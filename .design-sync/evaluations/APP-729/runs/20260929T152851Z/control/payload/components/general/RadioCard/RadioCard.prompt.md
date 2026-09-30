RadioCard from @aragon/gov-ui-kit. Use via `window.GovUiKit.RadioCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface RadioCardProps {
  /** Radio label */
  label: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  /** Additional children to render when the radio is selected. */
  children?: React.ReactNode;
  /** The value of the radio item. */
  value: string;
  /** Indicates if the radio is disabled. */
  disabled?: boolean;
  /** Radio card avatar image source */
  avatar?: string;
  /** Description */
  description?: string;
  /** Radio card tag */
  tag?: ITagProps;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <RadioGroup className="w-full" name="governance-default">
        <RadioCard
            label="Token voting"
            tag={{ label: 'Governance', variant: 'info' }}
            value="token-voting"
        />
    </RadioGroup>
)
```

### WithDescription

```jsx
() => (
    <RadioGroup className="w-full" name="governance-description">
        <RadioCard
            description="One token equals one vote. Voting power scales with holdings."
            label="Token voting"
            tag={{ label: 'Recommended', variant: 'primary' }}
            value="token-voting"
        />
    </RadioGroup>
)
```

### SelectedWithChildren

```jsx
() => (
    <RadioGroup
        className="w-full"
        defaultValue="multisig"
        name="governance-selected"
    >
        <RadioCard
            description="A fixed set of signers approves proposals before execution."
            label="Multisig"
            tag={{ label: 'Selected', variant: 'success' }}
            value="multisig"
        >
            <p className="text-neutral-500">
                Requires 3 of 5 signer approvals to execute.
            </p>
        </RadioCard>
    </RadioGroup>
)
```

### Disabled

```jsx
() => (
    <RadioGroup className="w-full" name="governance-disabled">
        <RadioCard
            description="Available after the DAO upgrade to v1.4 is executed."
            disabled={true}
            label="Gasless voting"
            tag={{ label: 'Locked', variant: 'neutral' }}
            value="gasless"
        />
    </RadioGroup>
)
```
