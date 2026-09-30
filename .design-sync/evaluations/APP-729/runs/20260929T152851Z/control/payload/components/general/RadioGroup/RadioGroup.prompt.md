RadioGroup from @aragon/gov-ui-kit. Use via `window.GovUiKit.RadioGroup` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface RadioGroupProps {
  /** The value of the selected radio item. */
  value?: string;
  /** The default value of the selected radio item. */
  defaultValue?: string;
  /** Callback when the value changes. */
  onValueChange?: (value: string) => void;
  /** The name of the radio group. */
  name?: string;
  /** Callback when the radio group loses focus. */
  onBlur?: FocusEventHandler<HTMLDivElement>;
  /** Whether the radio group is disabled. */
  disabled?: boolean;
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
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <RadioGroup
        className="w-full"
        defaultValue="yes"
        helpText="Your vote is weighted by your token balance at the snapshot block."
        label="Cast your vote"
        name="vote"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
        <Radio label="Abstain" value="abstain" />
    </RadioGroup>
)
```

### CardVariant

```jsx
() => (
    <RadioGroup
        className="w-full"
        defaultValue="token-voting"
        helpText="Choose how members of your DAO make decisions."
        label="Governance model"
        name="governance-model"
    >
        <RadioCard
            description="One token equals one vote."
            label="Token voting"
            tag={{ label: 'Recommended', variant: 'primary' }}
            value="token-voting"
        />
        <RadioCard
            description="A fixed set of signers approves proposals."
            label="Multisig"
            tag={{ label: 'Popular', variant: 'info' }}
            value="multisig"
        />
        <RadioCard
            description="Offchain voting with onchain execution."
            label="Gasless voting"
            tag={{ label: 'New', variant: 'success' }}
            value="gasless"
        />
    </RadioGroup>
)
```

### DisabledGroup

```jsx
() => (
    <RadioGroup
        className="w-full"
        defaultValue="no"
        disabled={true}
        helpText="Voting closed on 12 July 2026."
        label="Cast your vote"
        name="vote-closed"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
        <Radio label="Abstain" value="abstain" />
    </RadioGroup>
)
```

### WithAlert

```jsx
() => (
    <RadioGroup
        alert={{
            message: 'You must select an option before submitting your vote.',
            variant: 'critical',
        }}
        className="w-full"
        label="Cast your vote"
        name="vote-alert"
    >
        <Radio label="Yes" value="yes" />
        <Radio label="No" value="no" />
    </RadioGroup>
)
```
