Progress from @aragon/gov-ui-kit. Use via `window.GovUiKit.Progress` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProgressProps {
  /** Size of progress component. */
  size?: "sm" | "md";
  /** Size of the progress depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, ProgressSize>>;
  /** Current progress to be rendered. */
  value: number;
  /** Variant of the progress component. */
  variant?: "critical" | "success" | "neutral" | "primary";
  /** Threshold displayed with an indicator on the progress bar. */
  thresholdIndicator?: number;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="w-full">
        <Progress value={62} />
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <Progress value={75} variant="primary" />
        <Progress value={64} variant="success" />
        <Progress value={35} variant="neutral" />
        <Progress value={12} variant="critical" />
    </div>
)
```

### WithThresholdIndicator

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <Progress thresholdIndicator={50} value={72} variant="success" />
        <Progress thresholdIndicator={50} value={28} variant="critical" />
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex w-full flex-col gap-4">
        <Progress size="md" value={55} />
        <Progress size="sm" value={55} />
    </div>
)
```
