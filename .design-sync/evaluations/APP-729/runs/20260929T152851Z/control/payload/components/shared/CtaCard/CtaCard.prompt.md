CtaCard from @aragon/gov-ui-kit. Use via `window.GovUiKit.CtaCard` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### Primary

```jsx
() => (
    <div className="max-w-lg">
        <CtaCard
            description="Get hands-on support from the Aragon team to design and launch an onchain governance process tailored to your organization."
            isPrimary={true}
            objectType="USERS"
            primaryAction={{
                href: 'https://www.aragon.org/get-assistance-form',
                label: 'Get assistance',
            }}
            tag="Enterprise"
            title="Launch with expert help"
        />
    </div>
)
```

### Secondary

```jsx
() => (
    <div className="max-w-lg">
        <CtaCard
            description="Deploy a token voting or multisig process yourself in a few minutes. No code required."
            isPrimary={false}
            objectType="SMART_CONTRACT"
            primaryAction={{
                label: 'Add governance',
                onClick: () => undefined,
            }}
            secondaryAction={{
                href: 'https://docs.aragon.org',
                label: 'Read the docs',
            }}
            title="Do it yourself"
        />
    </div>
)
```

### SmallerText

```jsx
() => (
    <div className="max-w-md">
        <CtaCard
            description="Import an existing Safe and govern its assets with onchain proposals."
            isPrimary={false}
            objectType="WALLET"
            primaryAction={{
                label: 'Connect Safe',
                onClick: () => undefined,
            }}
            textSize="smaller"
            title="Bring your Safe"
        />
    </div>
)
```
