Banner from @aragon/gov-ui-kit. Use via `window.GovUiKit.Banner` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <Banner message="You are the admin of this DAO. Add a governance process to decentralize control." />
)
```

### WithAction

```jsx
() => (
    <Banner message="This DAO is controlled by an admin plugin. Add members to distribute permissions.">
        <div className="flex gap-3">
            <Button iconLeft={IconType.PLUS} size="sm" variant="secondary">
                Add members
            </Button>
        </div>
    </Banner>
)
```

### WithMultipleActions

```jsx
() => (
    <Banner message="A new version of the token voting plugin is available for Builders Collective.">
        <div className="flex gap-3">
            <Button size="sm" variant="secondary">
                Update plugin
            </Button>
            <Button size="sm" variant="tertiary">
                Learn more
            </Button>
        </div>
    </Banner>
)
```
