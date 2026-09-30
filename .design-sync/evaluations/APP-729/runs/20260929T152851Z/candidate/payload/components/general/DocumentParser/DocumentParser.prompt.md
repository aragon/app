DocumentParser from @aragon/gov-ui-kit. Use via `window.GovUiKit.DocumentParser` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface DocumentParserProps {
  /** The stringified document of Markdown or HTML to parse into a styled output. */
  document: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### ProposalBody

```jsx
() => (
    <DocumentParser document={proposalMarkdown} immediatelyRender={false} />
)
```

### HtmlSummary

```jsx
() => (
    <DocumentParser document={executionSummaryHtml} immediatelyRender={false} />
)
```
