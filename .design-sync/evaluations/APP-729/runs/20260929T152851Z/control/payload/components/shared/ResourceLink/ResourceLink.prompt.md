ResourceLink from @aragon/gov-ui-kit. Use via `window.GovUiKit.ResourceLink` (bundle loaded from the root `_ds_bundle.js`).

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
