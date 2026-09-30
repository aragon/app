Radio from @aragon/gov-ui-kit. Use via `window.GovUiKit.Radio` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface RadioProps {
  /** Radio label */
  label: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** The value of the radio item. */
  value: string;
  /** Indicates if the radio is disabled. */
  disabled?: boolean;
  /** Indicates the position of the label */
  labelPosition?: "right" | "left";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <RadioGroup name="vote-default">
        <Radio label="Approve proposal" value="approve" />
    </RadioGroup>
)
```

### Selected

```jsx
() => (
    <RadioGroup defaultValue="yes" name="vote-selected">
        <Radio label="Yes, execute immediately" value="yes" />
        <Radio label="No, wait for timelock" value="no" />
    </RadioGroup>
)
```

### Disabled

```jsx
() => (
    <RadioGroup defaultValue="abstain" name="vote-disabled">
        <Radio disabled={true} label="Vote yes" value="yes" />
        <Radio
            disabled={true}
            label="Abstain (voting closed)"
            value="abstain"
        />
    </RadioGroup>
)
```

### LabelPosition

```jsx
() => (
    <RadioGroup defaultValue="left" name="vote-label-position">
        <Radio label="Label on the right" labelPosition="right" value="right" />
        <Radio label="Label on the left" labelPosition="left" value="left" />
    </RadioGroup>
)
```

## Related

`RadioCard`, `RadioGroup`
