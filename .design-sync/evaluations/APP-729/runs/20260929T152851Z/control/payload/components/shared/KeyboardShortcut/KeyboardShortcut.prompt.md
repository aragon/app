KeyboardShortcut from @aragon/gov-ui-kit. Use via `window.GovUiKit.KeyboardShortcut` (bundle loaded from the root `_ds_bundle.js`).

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
