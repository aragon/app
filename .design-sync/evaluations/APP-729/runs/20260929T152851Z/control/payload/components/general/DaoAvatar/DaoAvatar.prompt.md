DaoAvatar from @aragon/gov-ui-kit. Use via `window.GovUiKit.DaoAvatar` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface DaoAvatarProps {
  /** Name of the DAO */
  name?: string;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
}
```

## Examples

### Default

```jsx
() => (
    <GukModulesProvider>
        <DaoAvatar name="Patito DAO" />
    </GukModulesProvider>
)
```

### Sizes

```jsx
() => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <DaoAvatar name="Aragon DAO" size="xs" />
            <DaoAvatar name="Aragon DAO" size="sm" />
            <DaoAvatar name="Aragon DAO" size="md" />
            <DaoAvatar name="Aragon DAO" size="lg" />
            <DaoAvatar name="Aragon DAO" size="xl" />
            <DaoAvatar name="Aragon DAO" size="2xl" />
        </div>
    </GukModulesProvider>
)
```

### WithLogo

```jsx
() => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <DaoAvatar name="Builder DAO" size="lg" src={daoLogo} />
            <DaoAvatar name="Builder DAO" size="2xl" src={daoLogo} />
        </div>
    </GukModulesProvider>
)
```
