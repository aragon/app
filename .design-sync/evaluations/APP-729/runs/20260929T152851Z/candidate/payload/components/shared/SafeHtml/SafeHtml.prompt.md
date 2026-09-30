SafeHtml from @aragon/app. Source: `apps/app/src/shared/components/SafeHtml.tsx`. Use via `window.GovUiKit.SafeHtml` (bundle loaded from the root `_ds_bundle.js`).

Component that safely renders HTML content by sanitizing it before rendering.
Uses DOMPurify to prevent XSS attacks by removing dangerous HTML tags and attributes.

## Props

```ts
interface SafeHtmlProps {
  /** HTML string to be sanitized and rendered. */
  html: string;
  /** Sanitization variant to use. - `strict`: Removes all HTML tags and attributes, leaving only plain text. - `rich`: Allows */
  variant?: "rich" | "strict";
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}
```

## Examples

### RichVariant

```jsx
() => (
    <div className="max-w-lg rounded-xl border border-neutral-100 p-4 text-neutral-600 text-sm leading-normal">
        <SafeHtml html={richHtml} variant="rich" />
    </div>
)
```

### StrictVariant

```jsx
() => (
    <div className="max-w-lg rounded-xl border border-neutral-100 p-4 text-neutral-600 text-sm leading-normal">
        <SafeHtml html={untrustedHtml} />
    </div>
)
```
