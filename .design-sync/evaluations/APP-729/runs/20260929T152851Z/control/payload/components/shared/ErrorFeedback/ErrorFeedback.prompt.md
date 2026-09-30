ErrorFeedback from @aragon/gov-ui-kit. Use via `window.GovUiKit.ErrorFeedback` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <ErrorFeedback />
    </AppProviders>
)
```

### CustomAction

```jsx
() => (
    <AppProviders>
        <ErrorFeedback
            hideReportButton={true}
            illustration="NOT_FOUND"
            primaryButton={{ label: 'Back to proposals', href: '/' }}
        />
    </AppProviders>
)
```
