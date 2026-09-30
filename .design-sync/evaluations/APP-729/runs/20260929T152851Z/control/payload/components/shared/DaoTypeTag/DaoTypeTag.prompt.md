DaoTypeTag from @aragon/gov-ui-kit. Use via `window.GovUiKit.DaoTypeTag` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Main

```jsx
() => (
    <AppProviders>
        <div className="flex">
            <DaoTypeTag type="main" />
        </div>
    </AppProviders>
)
```

### Sub

```jsx
() => (
    <AppProviders>
        <div className="flex">
            <DaoTypeTag type="sub" />
        </div>
    </AppProviders>
)
```

### BothTypes

```jsx
() => (
    <AppProviders>
        <div className="flex items-center gap-2">
            <DaoTypeTag type="main" />
            <DaoTypeTag type="sub" />
        </div>
    </AppProviders>
)
```
