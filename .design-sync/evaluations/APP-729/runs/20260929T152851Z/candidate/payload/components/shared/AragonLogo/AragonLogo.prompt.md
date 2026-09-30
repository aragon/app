AragonLogo from @aragon/app. Source: `apps/app/src/shared/components/aragonLogo/aragonLogo.tsx`. Use via `window.GovUiKit.AragonLogo` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AragonLogoProps {
  /** Logo color variant */
  variant?: "primary" | "white";
  /** Logo size */
  size?: "sm" | "md" | "lg";
  /** Only the icon will be displayed regardless of breakpoint. */
  iconOnly?: boolean;
  /** Only the icon will be displayed on mobile devices, full logo otherwise. */
  responsiveIconOnly?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <AragonLogo />
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex flex-col items-start gap-4">
        <AragonLogo size="sm" />
        <AragonLogo size="md" />
        <AragonLogo size="lg" />
    </div>
)
```

### IconOnly

```jsx
() => (
    <div className="flex items-center gap-4">
        <AragonLogo iconOnly={true} size="sm" />
        <AragonLogo iconOnly={true} size="md" />
        <AragonLogo iconOnly={true} size="lg" />
    </div>
)
```

### WhiteVariant

```jsx
() => (
    <div className="flex items-center gap-6 rounded-xl bg-neutral-800 p-6">
        <AragonLogo variant="white" />
        <AragonLogo iconOnly={true} variant="white" />
    </div>
)
```
