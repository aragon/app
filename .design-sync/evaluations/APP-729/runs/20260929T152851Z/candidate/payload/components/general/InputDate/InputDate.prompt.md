InputDate from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputDate` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputDateProps {
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
    <InputDate
        className="w-full"
        defaultValue="2026-07-20"
        helpText="The proposal becomes active on this date."
        label="Voting start date"
    />
)
```

### Critical

```jsx
() => (
    <InputDate
        alert={{
            message: 'End date must be after the start date.',
            variant: 'critical',
        }}
        className="w-full"
        defaultValue="2026-07-18"
        label="Voting end date"
        variant="critical"
    />
)
```

### Disabled

```jsx
() => (
    <InputDate
        className="w-full"
        defaultValue="2026-07-27"
        disabled={true}
        helpText="Set automatically from the voting period."
        label="Execution date"
    />
)
```
