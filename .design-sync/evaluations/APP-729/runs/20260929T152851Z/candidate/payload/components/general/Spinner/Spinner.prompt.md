Spinner from @aragon/gov-ui-kit. Use via `window.GovUiKit.Spinner` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface SpinnerProps {
  /** Size of the spinner. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Size of the spinner depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, SpinnerSize>>;
  /** Variant of the spinner. */
  variant?: "warning" | "critical" | "success" | "neutral" | "primary" | "primaryInverted";
  /** Defines if the spinner is in the loading state or not. */
  isLoading?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => <Spinner size="lg" variant="neutral" />
```

### Sizes

```jsx
() => (
    <div className="flex items-end gap-4">
        <Spinner size="sm" variant="primary" />
        <Spinner size="md" variant="primary" />
        <Spinner size="lg" variant="primary" />
        <Spinner size="xl" variant="primary" />
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex items-center gap-4">
        <Spinner size="lg" variant="neutral" />
        <Spinner size="lg" variant="primary" />
        <Spinner size="lg" variant="success" />
        <Spinner size="lg" variant="warning" />
        <Spinner size="lg" variant="critical" />
        <div className="rounded-lg bg-primary-400 p-2">
            <Spinner size="lg" variant="primaryInverted" />
        </div>
    </div>
)
```

### Static

```jsx
() => (
    <div className="flex items-center gap-4">
        <Spinner isLoading={false} size="lg" variant="primary" />
        <Spinner isLoading={false} size="lg" variant="neutral" />
    </div>
)
```
