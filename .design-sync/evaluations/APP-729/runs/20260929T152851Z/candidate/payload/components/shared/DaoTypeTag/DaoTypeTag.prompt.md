DaoTypeTag from @aragon/app. Source: `apps/app/src/shared/components/daoTypeTag/daoTypeTag.tsx`. Use via `window.GovUiKit.DaoTypeTag` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface DaoTypeTagProps {
  /** Type of DAO to display. */
  type: "main" | "sub";
}
```

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
