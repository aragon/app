TextAreaRichText from @aragon/gov-ui-kit. Use via `window.GovUiKit.TextAreaRichText` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TextAreaRichTextProps {
  /** Current value of the input. */
  value?: string;
  /** Id of the input. */
  id?: string;
  /** Callback called on value change. */
  onChange?: (value: string) => void;
  /** Placeholder of the input. */
  placeholder?: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  /** Format of the input value, which determines how content is interpreted and returned. Can be serialized HTML, markdown, o */
  valueFormat?: "html" | "text" | "markdown";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: CSSProperties;
  /** Classes for the component. */
  className?: string;
  /** Children of the component. */
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
  /** Does not render the default input wrapper when set to true, to be used for using the base input container properties (la */
  useCustomWrapper?: boolean;
}
```

## Examples

### Default

```jsx
() => (
    <TextAreaRichText
        className="w-full"
        helpText="Formatting is stored as rich text and rendered on the proposal page."
        label="Proposal body"
        placeholder="Write the full proposal…"
    />
)
```

### WithContent

```jsx
() => (
    <TextAreaRichText
        className="w-full"
        label="Proposal body"
        value="<h2>Fund the Q3 grants program</h2><p>This proposal allocates <strong>25,000 USDC</strong> from the treasury to the grants multisig. Funds are released in three milestones, reviewed by the <em>grants committee</em>.</p><ul><li>Milestone 1: 10,000 USDC on approval</li><li>Milestone 2: 10,000 USDC after mid-term report</li><li>Milestone 3: 5,000 USDC on final delivery</li></ul><p>Full details in the <a href='https://aragon.org' target='_blank'>forum discussion</a>.</p>"
    />
)
```

### States

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <TextAreaRichText
            alert={{
                message: 'The proposal body cannot be empty.',
                variant: 'critical',
            }}
            label="Proposal body"
            placeholder="Write the full proposal…"
            variant="critical"
        />
        <TextAreaRichText
            disabled={true}
            helpText="Published proposals cannot be edited."
            label="Proposal body"
            value="<p>This proposal has been published on-chain and is now read-only.</p>"
        />
    </div>
)
```
