StateSkeletonCircular from @aragon/gov-ui-kit. Use via `window.GovUiKit.StateSkeletonCircular` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StateSkeletonCircularProps {
  /** Responsive size attribute for the skeleton. */
  responsiveSize?: Partial<Record<Breakpoint, StateSkeletonCircularSize>>;
  /** The size of the skeleton. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Sizes

```jsx
() => (
    <div className="flex items-end gap-6 rounded-xl bg-neutral-800 p-6">
        {sizes.map((size) => (
            <div className="flex flex-col items-center gap-2" key={size}>
                <StateSkeletonCircular size={size} />
                <span className="text-neutral-300 text-xs">{size}</span>
            </div>
        ))}
    </div>
)
```

### MemberRowLoading

```jsx
() => (
    <div className="flex w-96 flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
        {[0, 1, 2].map((row) => (
            <div className="flex items-center gap-3" key={row}>
                <StateSkeletonCircular size="lg" />
                <div className="flex grow flex-col gap-2">
                    <StateSkeletonBar size="md" width="50%" />
                    <StateSkeletonBar size="sm" width="30%" />
                </div>
            </div>
        ))}
    </div>
)
```

### DaoAvatarLoading

```jsx
() => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-800 p-6">
        <StateSkeletonCircular size="2xl" />
        <div className="flex flex-col gap-2">
            <StateSkeletonBar size="lg" width={180} />
            <StateSkeletonBar size="sm" width={120} />
        </div>
    </div>
)
```
