InputNumber from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputNumber` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputNumberProps {
  /** Lower bound of the input. A committed value below it is raised to it, but partial input is not blocked (typing `5` on th */
  min?: number;
  /** Upper bound of the input. Values above it are clamped to it, so render an out-of-range error state through the `alert` p */
  max?: number;
  /** Optional string prepended to the input value. */
  prefix?: string;
  /** Specifies the granularity of the intervals for the input value. */
  step?: number;
  /** Optional string appended to the input value. */
  suffix?: string;
  onChange?: (value: string) => void;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: React.CSSProperties;
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
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <InputNumber
        className="w-full"
        helpText="How long members can vote on a proposal."
        label="Voting duration"
        min={1}
        suffix="days"
        value="7"
    />
)
```

### PrefixSuffix

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <InputNumber
            className="w-full"
            label="Support threshold"
            max={100}
            min={0}
            suffix="%"
            value="50"
        />
        <InputNumber
            className="w-full"
            label="Proposal deposit"
            prefix="ANT"
            value="250"
        />
        <InputNumber
            className="w-full"
            label="Amount to stake"
            suffix="aUSDC"
            value="250"
        />
    </div>
)
```

### Warning

```jsx
() => (
    <InputNumber
        alert={{
            message:
                'A participation below 5% can make proposals easy to pass.',
            variant: 'warning',
        }}
        className="w-full"
        label="Minimum participation"
        suffix="%"
        value="3"
        variant="warning"
    />
)
```

### Critical

```jsx
() => (
    <InputNumber
        alert={{
            message: 'The threshold cannot exceed 100%.',
            variant: 'critical',
        }}
        className="w-full"
        label="Approval threshold"
        suffix="%"
        value="120"
        variant="critical"
    />
)
```

### Disabled

```jsx
() => (
    <InputNumber
        className="w-full"
        disabled={true}
        helpText="Defined by the ERC-20 token contract."
        label="Token decimals"
        value="18"
    />
)
```

## Related

`InputNumberMax`
