AutocompleteInput from @aragon/gov-ui-kit. Use via `window.GovUiKit.AutocompleteInput` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            helpText="Search for an action to add to the proposal."
            items={actionItems}
            label="Add action"
            placeholder="Search actions, contracts or addresses…"
            selectItemLabel="Select action"
        />
    </AppProviders>
)
```

### WithGroups

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            groups={actionGroups}
            items={actionItems.map((item, index) => ({
                ...item,
                groupId: index < 2 ? 'treasury' : 'governance',
            }))}
            label="Proposal action"
            placeholder="What should this proposal do?"
            selectItemLabel="Select action"
        />
    </AppProviders>
)
```

### Critical

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            alert={{
                message: 'No action matches this search.',
                variant: 'critical',
            }}
            items={actionItems}
            label="Add action"
            placeholder="Search actions…"
            selectItemLabel="Select action"
            variant="critical"
        />
    </AppProviders>
)
```
