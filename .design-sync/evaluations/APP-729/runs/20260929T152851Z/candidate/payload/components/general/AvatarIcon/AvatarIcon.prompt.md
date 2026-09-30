AvatarIcon from @aragon/gov-ui-kit. Use via `window.GovUiKit.AvatarIcon` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AvatarIconProps {
  /** The icon type. */
  icon: unknown;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarIconSize>>;
  /** The size of the avatar icon. */
  size?: "sm" | "md" | "lg";
  /** The variant of the avatar. */
  variant?: "warning" | "critical" | "info" | "success" | "neutral" | "primary";
  /** Renders the icon on a white background. This property overrides the variant default background. */
  backgroundWhite?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => <AvatarIcon icon={IconType.APP_PROPOSALS} />
```

### Variants

```jsx
() => (
    <div className="flex items-center gap-4">
        <AvatarIcon icon={IconType.APP_PROPOSALS} variant="neutral" />
        <AvatarIcon icon={IconType.BLOCKCHAIN_WALLET} variant="primary" />
        <AvatarIcon icon={IconType.INFO} variant="info" />
        <AvatarIcon icon={IconType.CHECKMARK} variant="success" />
        <AvatarIcon icon={IconType.WARNING} variant="warning" />
        <AvatarIcon icon={IconType.CRITICAL} variant="critical" />
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex items-end gap-4">
        <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
        <AvatarIcon icon={IconType.APP_MEMBERS} size="md" variant="primary" />
        <AvatarIcon icon={IconType.APP_MEMBERS} size="lg" variant="primary" />
    </div>
)
```

### BackgroundWhite

```jsx
() => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-100 p-4">
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.APP_ASSETS}
            variant="primary"
        />
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.CHECKMARK}
            variant="success"
        />
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.WARNING}
            variant="warning"
        />
    </div>
)
```
