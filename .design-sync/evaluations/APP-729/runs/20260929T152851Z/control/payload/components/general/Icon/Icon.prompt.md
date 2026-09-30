Icon from @aragon/gov-ui-kit. Use via `window.GovUiKit.Icon` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface IconProps {
  /** Icon to be displayed. */
  icon: unknown;
  /** Size of the icon. */
  size?: "sm" | "md" | "lg";
  /** Size of the icon depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, IconSize>>;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => <Icon icon={IconType.PLUS} />
```

### Sizes

```jsx
() => (
    <div className="flex items-end gap-4">
        <Icon icon={IconType.APP_PROPOSALS} size="sm" />
        <Icon icon={IconType.APP_PROPOSALS} size="md" />
        <Icon icon={IconType.APP_PROPOSALS} size="lg" />
    </div>
)
```

### GovernanceIcons

```jsx
() => (
    <div className="flex flex-wrap items-center gap-4">
        <Icon icon={IconType.APP_DASHBOARD} size="lg" />
        <Icon icon={IconType.APP_PROPOSALS} size="lg" />
        <Icon icon={IconType.APP_MEMBERS} size="lg" />
        <Icon icon={IconType.APP_ASSETS} size="lg" />
        <Icon icon={IconType.APP_TRANSACTIONS} size="lg" />
        <Icon icon={IconType.BLOCKCHAIN_WALLET} size="lg" />
        <Icon icon={IconType.BLOCKCHAIN_SMARTCONTRACT} size="lg" />
        <Icon icon={IconType.CALENDAR} size="lg" />
        <Icon icon={IconType.SETTINGS} size="lg" />
        <Icon icon={IconType.DEPOSIT} size="lg" />
        <Icon icon={IconType.WITHDRAW} size="lg" />
        <Icon icon={IconType.LINK_EXTERNAL} size="lg" />
    </div>
)
```

### StatusColors

```jsx
() => (
    <div className="flex items-center gap-4">
        <Icon className="text-info-500" icon={IconType.INFO} size="lg" />
        <Icon className="text-success-500" icon={IconType.SUCCESS} size="lg" />
        <Icon className="text-warning-500" icon={IconType.WARNING} size="lg" />
        <Icon
            className="text-critical-500"
            icon={IconType.CRITICAL}
            size="lg"
        />
        <Icon
            className="text-primary-400"
            icon={IconType.CHECKMARK}
            size="lg"
        />
    </div>
)
```
