StatePingAnimation from @aragon/gov-ui-kit. Use via `window.GovUiKit.StatePingAnimation` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StatePingAnimationProps {
  /** Variant of the ping animation */
  variant?: "warning" | "critical" | "info" | "success" | "primary";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### Variants

```jsx
() => (
    <div className="flex items-center gap-6">
        {variants.map((variant) => (
            <div className="flex flex-col items-center gap-2" key={variant}>
                <StatePingAnimation variant={variant} />
                <span className="text-neutral-500 text-xs">{variant}</span>
            </div>
        ))}
    </div>
)
```

### LiveProposalIndicator

```jsx
() => (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3">
        <StatePingAnimation variant="info" />
        <div className="flex flex-col">
            <span className="text-base text-neutral-800 leading-tight">
                Voting is live
            </span>
            <span className="text-neutral-500 text-sm">
                Ends in 2 days · 64% support
            </span>
        </div>
    </div>
)
```

### ExecutionPending

```jsx
() => (
    <div className="flex items-center gap-3">
        <StatePingAnimation variant="warning" />
        <span className="text-neutral-800 text-sm">
            Awaiting onchain execution
        </span>
    </div>
)
```
