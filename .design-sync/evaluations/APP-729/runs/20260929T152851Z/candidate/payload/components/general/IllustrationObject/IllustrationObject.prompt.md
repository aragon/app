IllustrationObject from @aragon/gov-ui-kit. Use via `window.GovUiKit.IllustrationObject` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface IllustrationObjectProps {
  /** Illustration object to render. */
  object: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
    <IllustrationObject object="ACTION" style={{ width: 140 }} />
)
```

### GovernanceObjects

```jsx
() => (
    <div className="flex flex-wrap items-center gap-4">
        <IllustrationObject object="WALLET" style={{ width: 100 }} />
        <IllustrationObject object="USERS" style={{ width: 100 }} />
        <IllustrationObject object="SMART_CONTRACT" style={{ width: 100 }} />
        <IllustrationObject object="SETTINGS" style={{ width: 100 }} />
        <IllustrationObject object="TIMELOCK" style={{ width: 100 }} />
        <IllustrationObject object="GOAL" style={{ width: 100 }} />
    </div>
)
```

### FeedbackObjects

```jsx
() => (
    <div className="flex flex-wrap items-center gap-4">
        <IllustrationObject object="SUCCESS" style={{ width: 100 }} />
        <IllustrationObject object="WARNING" style={{ width: 100 }} />
        <IllustrationObject object="ERROR" style={{ width: 100 }} />
        <IllustrationObject object="NOT_FOUND" style={{ width: 100 }} />
        <IllustrationObject object="MAGNIFYING_GLASS" style={{ width: 100 }} />
    </div>
)
```
