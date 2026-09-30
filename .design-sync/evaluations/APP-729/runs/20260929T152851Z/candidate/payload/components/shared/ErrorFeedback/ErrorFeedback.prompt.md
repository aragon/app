ErrorFeedback from @aragon/app. Source: `apps/app/src/shared/components/errorFeedback/errorFeedback.tsx`. Use via `window.GovUiKit.ErrorFeedback` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ErrorFeedbackProps {
  /** Translation key for the error title. */
  titleKey?: string;
  /** Translation key for the error description. */
  descriptionKey?: string;
  /** Custom object illustration. */
  illustration?: unknown;
  /** Custom primary button. */
  primaryButton?: unknown;
  /** Hides the report issue button when set to true. */
  hideReportButton?: boolean;
}
```

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
