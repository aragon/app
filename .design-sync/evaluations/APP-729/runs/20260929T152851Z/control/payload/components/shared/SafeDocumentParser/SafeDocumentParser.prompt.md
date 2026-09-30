SafeDocumentParser from @aragon/gov-ui-kit. Use via `window.GovUiKit.SafeDocumentParser` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### ProposalBody

```jsx
() => (
    <SafeDocumentParser document={proposalMarkdown} immediatelyRender={false} />
)
```

### SanitizedHtmlSummary

```jsx
() => (
    <SafeDocumentParser
        document={`${executionSummaryHtml}<script>alert('xss')</script>`}
        immediatelyRender={false}
    />
)
```
