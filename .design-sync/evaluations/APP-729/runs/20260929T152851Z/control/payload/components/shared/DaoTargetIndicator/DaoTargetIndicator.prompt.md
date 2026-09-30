DaoTargetIndicator from @aragon/gov-ui-kit. Use via `window.GovUiKit.DaoTargetIndicator` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### MainDaoTarget

```jsx
() => (
    <div className="flex">
        <DaoTargetIndicator dao={dao} size="sm" />
    </div>
)
```

### LinkedAccountTarget

```jsx
() => (
    <div className="flex">
        <DaoTargetIndicator
            dao={dao}
            size="sm"
            targetDaoAddress="0x7f268357A8c2552623316e2562D90e642bB538E5"
        />
    </div>
)
```

### ExtraSmall

```jsx
() => (
    <div className="flex">
        <DaoTargetIndicator
            dao={dao}
            size="xs"
            targetDaoAddress="0x7f268357A8c2552623316e2562D90e642bB538E5"
        />
    </div>
)
```
