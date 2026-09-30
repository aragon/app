AlertInline from @aragon/gov-ui-kit. Use via `window.GovUiKit.AlertInline` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AlertInlineProps {
  /** Alert text content. */
  message: string;
  /** Defines the variant of the alert. */
  variant?: "warning" | "critical" | "info" | "success";
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <AlertInline message="Voting ends in 2 days" variant="info" />
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex flex-col items-start gap-3">
        <AlertInline message="Proposal published on-chain" variant="info" />
        <AlertInline message="Support threshold reached" variant="success" />
        <AlertInline
            message="Minimum participation not reached yet"
            variant="warning"
        />
        <AlertInline message="Proposal execution failed" variant="critical" />
    </div>
)
```
