Clipboard from @aragon/gov-ui-kit. Use via `window.GovUiKit.Clipboard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ClipboardProps {
  /** Text value to be copied to the clipboard. */
  copyValue: string;
  /** Size of the button or avatar. */
  size?: "sm" | "md" | "lg";
  /** Variant of the button. */
  variant?: "button" | "avatar" | "avatar-neutral";
  /** Class name to be applied to the wrapper. */
  className?: string;
  /** Optional children to be rendered next to the clipboard. */
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <Clipboard copyValue="0x1a9C8182C09F50C8318d769245beA52c32BE35BC" />
    </div>
)
```

### WithAddress

```jsx
() => (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3">
        <span className="text-neutral-500 text-sm">0x1a9C…35BC</span>
        <Clipboard
            copyValue="0x1a9C8182C09F50C8318d769245beA52c32BE35BC"
            variant="avatar-white-bg"
        />
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex items-center gap-4">
        <Clipboard copyValue="dao.aragon.eth" size="sm" />
        <Clipboard copyValue="dao.aragon.eth" size="md" />
        <Clipboard copyValue="dao.aragon.eth" size="lg" />
    </div>
)
```

### AvatarVariants

```jsx
() => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
        <Clipboard copyValue="vitalik.eth" variant="avatar" />
        <Clipboard copyValue="vitalik.eth" variant="avatar-white-bg" />
        <Clipboard copyValue="vitalik.eth" variant="avatar-neutral-white-bg" />
    </div>
)
```
