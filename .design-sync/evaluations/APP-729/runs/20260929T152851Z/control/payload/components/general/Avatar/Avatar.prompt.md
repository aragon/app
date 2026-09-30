Avatar from @aragon/gov-ui-kit. Use via `window.GovUiKit.Avatar` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AvatarProps {
  /** Fallback content to display when the image fails to load or no image is provided. */
  fallback?: React.ReactNode;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => <Avatar size="md" src={memberImage} />
```

### Sizes

```jsx
() => (
    <div className="flex items-end gap-4">
        <Avatar size="xs" src={memberImage} />
        <Avatar size="sm" src={memberImage} />
        <Avatar size="md" src={memberImage} />
        <Avatar size="lg" src={memberImage} />
        <Avatar size="xl" src={memberImage} />
        <Avatar size="2xl" src={memberImage} />
    </div>
)
```

### DefaultFallback

```jsx
() => (
    <div className="flex items-center gap-4">
        <Avatar size="sm" />
        <Avatar size="md" />
        <Avatar size="lg" />
    </div>
)
```

### CustomFallback

```jsx
() => (
    <div className="flex items-center gap-4">
        <Avatar
            fallback={initialsFallback('AD')}
            size="md"
            src="broken-image"
        />
        <Avatar
            fallback={initialsFallback('SO')}
            size="lg"
            src="broken-image"
        />
        <Avatar
            fallback={initialsFallback('GV')}
            size="xl"
            src="broken-image"
        />
    </div>
)
```

## Related

`AvatarBase`, `AvatarIcon`, `AvatarInput`
