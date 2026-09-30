Switch from @aragon/gov-ui-kit. Use via `window.GovUiKit.Switch` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface SwitchProps {
  /** Indicates whether the switch is checked */
  checked?: boolean;
  /** CSS class name */
  className?: string;
  /** The default checked state of the switch */
  defaultChecked?: boolean;
  /** Indicates whether the switch is disabled */
  disabled?: boolean;
  /** The ID of the switch */
  id?: string;
  /** The inline label of the switch */
  inlineLabel?: string;
  /** The name of the switch */
  name?: string;
  /** Event handler for when the checked state changes */
  onCheckedChanged?: (checked: boolean) => void;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
}
```

## Examples

### Default

```jsx
() => (
    <Switch defaultChecked={true} inlineLabel="Show testnets" name="testnets" />
)
```

### WithFieldLabel

```jsx
() => (
    <Switch
        defaultChecked={true}
        helpText="Voters can change their vote until the voting period ends."
        inlineLabel="Vote change enabled"
        label="Vote change"
        name="vote-change"
    />
)
```

### States

```jsx
() => (
    <div className="flex flex-col gap-3">
        <Switch inlineLabel="Early execution" name="early-execution" />
        <Switch
            defaultChecked={true}
            inlineLabel="Notifications"
            name="notifications"
        />
        <Switch
            disabled={true}
            inlineLabel="Gasless voting (unavailable)"
            name="gasless"
        />
        <Switch
            defaultChecked={true}
            disabled={true}
            inlineLabel="Token voting (locked)"
            name="token-voting"
        />
    </div>
)
```
