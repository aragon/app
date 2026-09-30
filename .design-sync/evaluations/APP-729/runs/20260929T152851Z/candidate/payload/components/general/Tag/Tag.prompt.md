Tag from @aragon/gov-ui-kit. Use via `window.GovUiKit.Tag` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TagProps {
  /** Defines the variant of the tag. */
  variant?: "warning" | "critical" | "info" | "success" | "neutral" | "primary";
  /** Label of the tag. */
  label: string;
  /** Classes for the component. */
  className?: string;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <Tag label="Active" variant="primary" />
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex flex-wrap items-center gap-3">
        <Tag label="Draft" variant="neutral" />
        <Tag label="Active" variant="primary" />
        <Tag label="Pending" variant="info" />
        <Tag label="Executed" variant="success" />
        <Tag label="Expiring soon" variant="warning" />
        <Tag label="Vetoed" variant="critical" />
    </div>
)
```
