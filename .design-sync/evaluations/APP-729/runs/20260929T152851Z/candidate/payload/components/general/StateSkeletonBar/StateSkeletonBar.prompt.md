StateSkeletonBar from @aragon/gov-ui-kit. Use via `window.GovUiKit.StateSkeletonBar` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface StateSkeletonBarProps {
  /** Responsive size attribute for the skeleton. */
  responsiveSize?: Partial<Record<Breakpoint, StateSkeletonBarSize>>;
  /** The size of the skeleton. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Specifies the width of the skeleton element. Can be provided as a number (interpreted as pixels) or a string with explic */
  width?: string | number | string & {};
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
    <div className="flex w-80 flex-col gap-4 rounded-xl bg-neutral-800 p-6">
        {sizes.map((size) => (
            <div className="flex items-center gap-4" key={size}>
                <span className="w-8 text-neutral-300 text-xs">{size}</span>
                <StateSkeletonBar size={size} width="70%" />
            </div>
        ))}
    </div>
)
```

### Widths

```jsx
() => (
    <div className="flex w-80 flex-col gap-3 rounded-xl bg-neutral-800 p-6">
        <StateSkeletonBar size="md" width="100%" />
        <StateSkeletonBar size="md" width="75%" />
        <StateSkeletonBar size="md" width="50%" />
        <StateSkeletonBar size="md" width={120} />
    </div>
)
```

### ProposalCardLoading

```jsx
() => (
    <div className="flex w-96 flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
        <StateSkeletonBar size="xl" width="65%" />
        <StateSkeletonBar size="md" width="100%" />
        <StateSkeletonBar size="md" width="90%" />
        <div className="flex items-center justify-between pt-2">
            <StateSkeletonBar size="sm" width="30%" />
            <StateSkeletonBar size="sm" width="20%" />
        </div>
    </div>
)
```
