SafeHtml from @aragon/gov-ui-kit. Use via `window.GovUiKit.SafeHtml` (bundle loaded from the root `_ds_bundle.js`).

Component that safely renders HTML content by sanitizing it before rendering.
Uses DOMPurify to prevent XSS attacks by removing dangerous HTML tags and attributes.

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
