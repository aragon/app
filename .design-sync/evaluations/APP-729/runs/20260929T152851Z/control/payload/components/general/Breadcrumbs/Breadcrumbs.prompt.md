Breadcrumbs from @aragon/gov-ui-kit. Use via `window.GovUiKit.Breadcrumbs` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface BreadcrumbsProps {
  /** Array of BreadcrumbsLink objects (@see IBreadcrumbsLink). The array indicates depth from the current position to be disp */
  links: IBreadcrumbsLink[];
  /** Optional tag pill to be displayed at the end of the Breadcrumbs for extra info. */
  tag?: ITagProps;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Proposals', href: '/proposals' },
                {
                    label: 'PIP-23: Treasury diversification',
                    href: '/proposals/pip-23',
                },
            ]}
        />
    </div>
)
```

### MultipleLinks

```jsx
() => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Aragon DAO', href: '/' },
                { label: 'Governance', href: '/governance' },
                { label: 'Proposals', href: '/governance/proposals' },
                { label: 'PIP-23', href: '/governance/proposals/pip-23' },
            ]}
        />
    </div>
)
```

### WithTag

```jsx
() => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Members', href: '/members' },
                { label: '0xba9E...aF27', href: '/members/0xba9E' },
            ]}
            tag={{ label: 'Delegate', variant: 'info' }}
        />
    </div>
)
```
