TextArea from @aragon/gov-ui-kit. Use via `window.GovUiKit.TextArea` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TextAreaProps {
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
    <TextArea
        className="w-full"
        helpText="Briefly explain what this proposal changes and why."
        label="Proposal summary"
        placeholder="Describe your proposal…"
    />
)
```

### WithValueAndCounter

```jsx
() => (
    <TextArea
        className="w-full"
        label="Description"
        maxLength={280}
        value="Allocate 25,000 USDC from the treasury to fund the Q3 developer grants program, distributed across three milestones."
    />
)
```

### Variants

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <TextArea
            alert={{
                message: 'Consider adding more context for voters.',
                variant: 'warning',
            }}
            defaultValue="Transfer funds to the grants multisig."
            label="Rationale"
            variant="warning"
        />
        <TextArea
            alert={{
                message: 'A description is required to publish the proposal.',
                variant: 'critical',
            }}
            label="Rationale"
            placeholder="Describe your proposal…"
            variant="critical"
        />
    </div>
)
```

### States

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <TextArea
            defaultValue="Proposal metadata is locked after publication."
            disabled={true}
            helpText="This field cannot be edited once the proposal is live."
            label="On-chain description"
        />
        <TextArea
            isOptional={true}
            label="Additional resources"
            placeholder="Links to forum discussions, audits…"
        />
    </div>
)
```

## Related

`TextAreaRichText`
