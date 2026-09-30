Banner from @aragon/app. Source: `apps/app/src/shared/components/banner/banner.tsx`. Use via `window.GovUiKit.Banner` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface BannerProps {
  /** Message of the banner. */
  message: string;
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
    <Banner message="You are the admin of this DAO. Add a governance process to decentralize control." />
)
```

### WithAction

```jsx
() => (
    <Banner message="This DAO is controlled by an admin plugin. Add members to distribute permissions.">
        <div className="flex gap-3">
            <Button iconLeft={IconType.PLUS} size="sm" variant="secondary">
                Add members
            </Button>
        </div>
    </Banner>
)
```

### WithMultipleActions

```jsx
() => (
    <Banner message="A new version of the token voting plugin is available for Builders Collective.">
        <div className="flex gap-3">
            <Button size="sm" variant="secondary">
                Update plugin
            </Button>
            <Button size="sm" variant="tertiary">
                Learn more
            </Button>
        </div>
    </Banner>
)
```
