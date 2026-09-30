DaoTargetIndicator from @aragon/app. Source: `apps/app/src/shared/components/daoTargetIndicator/daoTargetIndicator.tsx`. Use via `window.GovUiKit.DaoTargetIndicator` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface DaoTargetIndicatorProps {
  /** The root DAO used to determine if there are linked accounts. */
  dao?: IDao;
  /** The plugin whose target DAO should be displayed. When provided, targetDaoAddress will be derived from the plugin. */
  plugin?: IDaoPlugin<IPluginSettings>;
  /** Explicit target DAO address. Used when plugin is not available (e.g., for policies). Takes precedence over plugin if bot */
  targetDaoAddress?: string;
  /** Size variant affecting text size. - undefined: no text class (inherits from parent, use in DefinitionList) - 'sm': text- */
  size?: "sm" | "xs";
}
```

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
