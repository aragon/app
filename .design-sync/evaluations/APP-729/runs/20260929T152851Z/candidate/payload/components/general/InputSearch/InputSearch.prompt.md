InputSearch from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputSearch` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputSearchProps {
  /** Displays a loading indicator when set to true. */
  isLoading?: boolean;
  /** Classes for the input element. */
  inputClassName?: string;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Classes for the component. */
  className?: string;
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
  /** Displays an input length counter when set. */
  maxLength?: number;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  style?: CSSProperties;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <InputSearch className="w-full" placeholder="Search proposals" />
)
```

### WithValue

```jsx
() => (
    <InputSearch
        className="w-full"
        defaultValue="0x47d8…9c1e"
        helpText="Search by address or ENS name."
        label="Members"
    />
)
```

### Loading

```jsx
() => (
    <InputSearch
        className="w-full"
        defaultValue="treasury diversification"
        isLoading={true}
    />
)
```

### Disabled

```jsx
() => (
    <InputSearch
        className="w-full"
        disabled={true}
        placeholder="Search delegates"
    />
)
```
