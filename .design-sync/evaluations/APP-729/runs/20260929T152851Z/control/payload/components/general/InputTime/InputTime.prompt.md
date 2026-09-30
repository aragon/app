InputTime from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputTime` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputTimeProps {
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
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <InputTime
        className="w-full"
        defaultValue="09:00"
        helpText="Times are shown in UTC."
        label="Voting start time"
    />
)
```

### Warning

```jsx
() => (
    <InputTime
        alert={{
            message: 'Voting ends less than one hour after it starts.',
            variant: 'warning',
        }}
        className="w-full"
        defaultValue="23:45"
        label="Voting end time"
        variant="warning"
    />
)
```

### Disabled

```jsx
() => (
    <InputTime
        className="w-full"
        defaultValue="12:00"
        disabled={true}
        helpText="Set automatically from the timelock settings."
        label="Execution time"
    />
)
```
