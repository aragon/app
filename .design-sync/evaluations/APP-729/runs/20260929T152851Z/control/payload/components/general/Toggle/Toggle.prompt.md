Toggle from @aragon/gov-ui-kit. Use via `window.GovUiKit.Toggle` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ToggleProps {
  /** Value of the toggle. */
  value: string;
  /** Label of the toggle. */
  label: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <ToggleGroup isMultiSelect={false}>
        <Toggle label="All proposals" value="all" />
    </ToggleGroup>
)
```

### Selected

```jsx
() => (
    <ToggleGroup defaultValue="active" isMultiSelect={false}>
        <Toggle label="Active" value="active" />
    </ToggleGroup>
)
```

### Disabled

```jsx
() => (
    <ToggleGroup isMultiSelect={false}>
        <Toggle disabled={true} label="Executed" value="executed" />
    </ToggleGroup>
)
```

## Related

`ToggleGroup`
