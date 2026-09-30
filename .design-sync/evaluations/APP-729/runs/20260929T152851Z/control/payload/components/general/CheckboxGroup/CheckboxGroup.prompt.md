CheckboxGroup from @aragon/gov-ui-kit. Use via `window.GovUiKit.CheckboxGroup` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CheckboxGroupProps {
  /** Additional classes for the component. */
  className?: string;
  /** Children of the component. */
  children?: React.ReactNode;
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
    <CheckboxGroup
        className="w-full"
        helpText="Choose the actions this proposal will execute on-chain."
        label="Proposal actions"
    >
        <Checkbox checked={true} label="Transfer funds from treasury" />
        <Checkbox label="Update DAO metadata" />
        <Checkbox label="Grant permissions to new plugin" />
    </CheckboxGroup>
)
```

### WithCards

```jsx
() => (
    <CheckboxGroup
        className="w-full"
        helpText="Select the plugins to install in your DAO."
        label="Plugins"
    >
        <CheckboxCard
            checked={true}
            description="Token-weighted voting for ERC-20 holders."
            label="Token voting"
            tag={{ label: 'Recommended', variant: 'primary' }}
        />
        <CheckboxCard
            description="A fixed set of signers approves proposals."
            label="Multisig"
            tag={{ label: 'Popular', variant: 'info' }}
        />
        <CheckboxCard
            description="Offchain voting with onchain execution."
            label="Gasless voting"
            tag={{ label: 'New', variant: 'success' }}
        />
    </CheckboxGroup>
)
```

### Optional

```jsx
() => (
    <CheckboxGroup
        className="w-full"
        helpText="Optionally subscribe to governance notifications."
        isOptional={true}
        label="Notifications"
    >
        <Checkbox label="New proposals" />
        <Checkbox checked={true} label="Voting reminders" />
        <Checkbox label="Execution results" />
    </CheckboxGroup>
)
```

### WithAlert

```jsx
() => (
    <CheckboxGroup
        alert={{
            message: 'Select at least one action to continue.',
            variant: 'critical',
        }}
        className="w-full"
        label="Proposal actions"
    >
        <Checkbox label="Transfer funds from treasury" />
        <Checkbox label="Update DAO metadata" />
    </CheckboxGroup>
)
```
