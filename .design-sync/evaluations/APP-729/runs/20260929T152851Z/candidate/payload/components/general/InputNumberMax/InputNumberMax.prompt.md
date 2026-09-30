InputNumberMax from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputNumberMax` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputNumberMaxProps {
  /** Maximum number set on max button click. It is also the ceiling the input accepts: values above it are clamped to it, so  */
  max: number;
  onChange?: (value: string) => void;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: CSSProperties;
  /** Classes for the component. */
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Classes for the input element. */
  inputClassName?: string;
}
```

## Examples

### Default

```jsx
() => (
    <InputNumberMax
        className="w-full"
        helpText="Treasury balance: 12,500 ANT"
        label="Amount to withdraw"
        max={12_500}
        placeholder="0"
    />
)
```

### WithValue

```jsx
() => (
    <InputNumberMax
        className="w-full"
        helpText="Your balance: 54,120 ANT"
        label="Tokens to delegate"
        max={54_120}
        value="1500"
    />
)
```

### Critical

```jsx
() => (
    <InputNumberMax
        alert={{
            message:
                'Amount exceeds the 1,000 ANT spending cap of this plugin.',
            variant: 'critical',
        }}
        className="w-full"
        label="Amount to send"
        max={12_500}
        value="1200"
        variant="critical"
    />
)
```

### Disabled

```jsx
() => (
    <InputNumberMax
        className="w-full"
        disabled={true}
        helpText="Tokens are locked until the voting period ends."
        label="Locked tokens"
        max={10_000}
        value="10000"
    />
)
```
