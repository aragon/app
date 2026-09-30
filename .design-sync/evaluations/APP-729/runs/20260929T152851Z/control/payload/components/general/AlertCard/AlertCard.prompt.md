AlertCard from @aragon/gov-ui-kit. Use via `window.GovUiKit.AlertCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AlertCardProps {
  /** The alert message. */
  message: string;
  /** Variant of the alert. */
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
    <AlertCard message="Proposal executed" variant="info">
        The proposal actions were executed on-chain on July 12, 2026.
    </AlertCard>
)
```

### Variants

```jsx
() => (
    <div className="flex w-full flex-col gap-3">
        <AlertCard message="Heads up" variant="info">
            Voting starts in 2 days.
        </AlertCard>
        <AlertCard message="Proposal passed" variant="success">
            The support threshold was reached.
        </AlertCard>
        <AlertCard message="Low participation" variant="warning">
            Minimum participation has not been reached yet.
        </AlertCard>
        <AlertCard message="Execution failed" variant="critical">
            The transaction reverted during execution.
        </AlertCard>
    </div>
)
```
