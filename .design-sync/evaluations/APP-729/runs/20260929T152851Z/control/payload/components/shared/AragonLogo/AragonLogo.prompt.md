AragonLogo from @aragon/gov-ui-kit. Use via `window.GovUiKit.AragonLogo` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <AragonLogo />
    </div>
)
```

### Sizes

```jsx
() => (
    <div className="flex flex-col items-start gap-4">
        <AragonLogo size="sm" />
        <AragonLogo size="md" />
        <AragonLogo size="lg" />
    </div>
)
```

### IconOnly

```jsx
() => (
    <div className="flex items-center gap-4">
        <AragonLogo iconOnly={true} size="sm" />
        <AragonLogo iconOnly={true} size="md" />
        <AragonLogo iconOnly={true} size="lg" />
    </div>
)
```

### WhiteVariant

```jsx
() => (
    <div className="flex items-center gap-6 rounded-xl bg-neutral-800 p-6">
        <AragonLogo variant="white" />
        <AragonLogo iconOnly={true} variant="white" />
    </div>
)
```
