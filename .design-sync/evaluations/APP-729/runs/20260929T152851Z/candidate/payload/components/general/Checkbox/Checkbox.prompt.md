Checkbox from @aragon/gov-ui-kit. Use via `window.GovUiKit.Checkbox` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CheckboxProps {
  /** Label of the checkbox. */
  label: string;
  style?: CSSProperties;
  className?: string;
  /** Id of the checkbox. */
  id?: string;
  children?: React.ReactNode;
  /** Indicates if the checkbox is disabled. */
  disabled?: boolean;
  /** Position of the label. */
  labelPosition?: "right" | "left";
  /** The checked state of the checkbox. */
  checked?: boolean | "indeterminate";
  /** Callback when the checked state changes. */
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <Checkbox label="I have reviewed the proposal actions" />
)
```

### CheckedStates

```jsx
() => (
    <div className="flex flex-col gap-3">
        <Checkbox label="Transfer 5.0 ETH to grants multisig" />
        <Checkbox checked={true} label="Update voting settings" />
        <Checkbox checked="indeterminate" label="All treasury actions" />
    </div>
)
```

### Disabled

```jsx
() => (
    <div className="flex flex-col gap-3">
        <Checkbox disabled={true} label="Mint governance tokens" />
        <Checkbox
            checked={true}
            disabled={true}
            label="Verified smart contract"
        />
    </div>
)
```

### LabelPosition

```jsx
() => (
    <div className="flex flex-col gap-3">
        <Checkbox label="Notify members by email" labelPosition="right" />
        <Checkbox
            checked={true}
            label="Enable early execution"
            labelPosition="left"
        />
    </div>
)
```

## Related

`CheckboxCard`, `CheckboxGroup`
