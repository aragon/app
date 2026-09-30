ResourceLink from @aragon/app. Source: `apps/app/src/shared/components/resourceLink/resourceLink.tsx`. Use via `window.GovUiKit.ResourceLink` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ResourceLinkProps {
  /** Optional custom text for the resource link. */
  name?: string;
  /** Resource URL. */
  url: string;
  id?: string;
  /** Variant of the link. */
  variant?: "primary" | "neutral";
  /** Whether the link is disabled. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  /** Classnames to be applied directly to the link text. */
  textClassName?: string;
  /** Whether the link is external. If true, the link will open in a new tab and will have external link icon. */
  isExternal?: boolean;
}
```

## Examples

### WithName

```jsx
() => (
    <div className="flex">
        <ResourceLink
            isExternal={true}
            name="Governance forum"
            url="https://forum.aragon.org/t/aip-42-grants-program"
        />
    </div>
)
```

### UrlOnly

```jsx
() => (
    <div className="flex">
        <ResourceLink
            isExternal={true}
            url="https://docs.aragon.org/token-voting"
        />
    </div>
)
```

### ResourceList

```jsx
() => (
    <div className="flex max-w-md flex-col gap-3 rounded-xl border border-neutral-100 p-4">
        <p className="font-semibold text-neutral-800 text-sm">Resources</p>
        <ResourceLink
            isExternal={true}
            name="Discussion thread"
            url="https://forum.aragon.org/t/aip-42"
        />
        <ResourceLink
            isExternal={true}
            name="Audit report"
            url="https://example.org/audits/aip-42.pdf"
        />
        <ResourceLink
            isExternal={true}
            url="https://snapshot.org/#/aragondao.eth"
        />
    </div>
)
```
