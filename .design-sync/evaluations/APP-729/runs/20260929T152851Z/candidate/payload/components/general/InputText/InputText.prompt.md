InputText from @aragon/gov-ui-kit. Use via `window.GovUiKit.InputText` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface InputTextProps {
  /** Text to be rendered beside the input field. */
  addon?: string;
  /** Position of the addon element in relation to the input field. */
  addonPosition?: "right" | "left";
  /** Icon to be rendered on the left side of the input field. */
  iconLeft?: unknown;
  /** Icon to be rendered on the right side of the input field. */
  iconRight?: unknown;
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
    <InputText
        className="w-full"
        helpText="Shown in the proposal list and voting page."
        label="Proposal title"
        maxLength={100}
        placeholder="Give your proposal a title"
    />
)
```

### WithAddon

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <InputText
            addon="aragon.eth"
            addonPosition="right"
            className="w-full"
            label="ENS subdomain"
            placeholder="mydao"
        />
        <InputText
            addon="https://"
            addonPosition="left"
            className="w-full"
            label="Forum link"
            placeholder="forum.aragon.org/t/aip-42"
        />
    </div>
)
```

### OptionalWithValue

```jsx
() => (
    <InputText
        className="w-full"
        defaultValue="https://forum.aragon.org/t/aip-42-treasury-diversification"
        helpText="Link to the forum thread where this proposal was discussed."
        isOptional={true}
        label="Discussion URL"
    />
)
```

### Warning

```jsx
() => (
    <InputText
        alert={{
            message: 'Token name cannot be changed after the DAO is launched.',
            variant: 'warning',
        }}
        className="w-full"
        defaultValue="Aragon Network Token"
        label="Governance token name"
        variant="warning"
    />
)
```

### Critical

```jsx
() => (
    <InputText
        alert={{
            message: 'This is not a valid Ethereum address.',
            variant: 'critical',
        }}
        className="w-full"
        defaultValue="0x1234"
        label="Multisig address"
        variant="critical"
    />
)
```

### Disabled

```jsx
() => (
    <InputText
        className="w-full"
        defaultValue="Aragon DAO"
        disabled={true}
        helpText="The DAO name is managed by the governance settings."
        label="DAO name"
    />
)
```
