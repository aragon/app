SafeDocumentParser from @aragon/app. Source: `apps/app/src/shared/components/SafeDocumentParser.tsx`. Use via `window.GovUiKit.SafeDocumentParser` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface SafeDocumentParserProps {
  /** The stringified document of Markdown or HTML to parse into a styled output. */
  document: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
}
```

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
