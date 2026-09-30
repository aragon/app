Link from @aragon/gov-ui-kit. Use via `window.GovUiKit.Link` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface LinkProps {
  /** Variant of the link. */
  variant?: "neutral" | "primary";
  /** Whether the link is disabled. */
  disabled?: boolean;
  /** Optionally show URL as a description below the link text. */
  showUrl?: boolean;
  /** Classnames to be applied directly to the link text. */
  textClassName?: string;
  /** Whether the link is external. If true, the link will open in a new tab and will have external link icon. */
  isExternal?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <Link href="https://app.aragon.org" target="_blank">
            View proposal
        </Link>
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex items-center gap-6">
        <Link href="https://app.aragon.org" variant="primary">
            Primary link
        </Link>
        <Link href="https://app.aragon.org" variant="neutral">
            Neutral link
        </Link>
    </div>
)
```

### External

```jsx
() => (
    <div className="flex">
        <Link
            href="https://etherscan.io/tx/0xba9e"
            isExternal={true}
            showUrl={true}
        >
            View on block explorer
        </Link>
    </div>
)
```

### Disabled

```jsx
() => (
    <div className="flex items-center gap-6">
        <Link disabled={true} href="https://app.aragon.org" variant="primary">
            Disabled primary
        </Link>
        <Link disabled={true} href="https://app.aragon.org" variant="neutral">
            Disabled neutral
        </Link>
    </div>
)
```

## Related

`LinkBase`
