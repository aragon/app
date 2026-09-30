Button from @aragon/gov-ui-kit. Use via `window.GovUiKit.Button` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ButtonProps {
  /** Variant of the button. */
  variant?: "warning" | "critical" | "success" | "primary" | "secondary" | "tertiary" | "ghost";
  /** Size of the button. */
  size?: "sm" | "md" | "lg";
  /** Applies responsiveness to the size of the button. */
  responsiveSize?: Partial<Record<Breakpoint, ButtonSize>>;
  /** Icon displayed on the right side of the button. This icon is hidden in case the button has no children element set (only */
  iconRight?: unknown;
  /** Icon displayed on the left side of the button. This icon is displayed in case the button has no children element set (on */
  iconLeft?: unknown;
  /** A boolean indicating whether the button is loading. */
  isLoading?: boolean;
  /** A boolean indicating whether the button is disabled. */
  disabled?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  href?: string;
  target?: string & {} | "_self" | "_blank" | "_parent" | "_top";
  download?: any;
  hrefLang?: string;
  media?: string;
  ping?: string;
  referrerPolicy?: "" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => <Button variant="primary">Button label</Button>
```

### Variants

```jsx
() => (
    <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="critical">Critical</Button>
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex items-center gap-3">
        <Button size="lg">Large</Button>
        <Button size="md">Medium</Button>
        <Button size="sm">Small</Button>
    </div>
)
```

### WithIcons

```jsx
() => (
    <div className="flex items-center gap-3">
        <Button iconLeft={IconType.PLUS}>Create proposal</Button>
        <Button iconRight={IconType.LINK_EXTERNAL} variant="secondary">
            View on explorer
        </Button>
        <Button iconLeft={IconType.PLUS} variant="tertiary" />
    </div>
)
```

### States

```jsx
() => (
    <div className="flex items-center gap-3">
        <Button disabled={true}>Disabled</Button>
        <Button isLoading={true}>Loading</Button>
        <Button href="https://aragon.org" target="_blank" variant="secondary">
            Link button
        </Button>
    </div>
)
```
