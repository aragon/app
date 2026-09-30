KeyboardShortcut from @aragon/app. Source: `apps/app/src/shared/components/keyboardShortcut/keyboardShortcut.tsx`. Use via `window.GovUiKit.KeyboardShortcut` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface KeyboardShortcutProps {
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
    <div className="flex">
        <KeyboardShortcut>/</KeyboardShortcut>
    </div>
)
```

### Combination

```jsx
() => (
    <div className="flex items-center gap-1">
        <KeyboardShortcut>⌘</KeyboardShortcut>
        <KeyboardShortcut>K</KeyboardShortcut>
    </div>
)
```

### InSearchHint

```jsx
() => (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-2">
        <span className="text-neutral-400 text-sm">
            Search DAOs, proposals, members…
        </span>
        <KeyboardShortcut>/</KeyboardShortcut>
    </div>
)
```
