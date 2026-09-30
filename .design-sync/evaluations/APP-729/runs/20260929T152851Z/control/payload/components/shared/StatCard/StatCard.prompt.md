StatCard from @aragon/gov-ui-kit. Use via `window.GovUiKit.StatCard` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <div className="max-w-xs">
        <StatCard label="Active proposals" value={12} />
    </div>
)
```

### WithSuffix

```jsx
() => (
    <div className="max-w-xs">
        <StatCard label="Treasury value" suffix=" USD" value="4.2M" />
    </div>
)
```

### StatsGrid

```jsx
() => (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        <StatCard label="Proposals created" value={96} />
        <StatCard label="Participation" suffix="%" value={64} />
        <StatCard label="Token holders" suffix="k" value="3.4" />
        <StatCard label="Executed this quarter" value={14} />
    </div>
)
```
