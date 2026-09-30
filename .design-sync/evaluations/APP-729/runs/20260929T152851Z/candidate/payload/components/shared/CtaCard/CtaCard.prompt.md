CtaCard from @aragon/app. Source: `apps/app/src/shared/components/ctaCard/ctaCard.tsx`. Use via `window.GovUiKit.CtaCard` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CtaCardProps {
  /** Illustration object type to render in the card header. */
  objectType: IllustrationObjectType;
  /** Title of the card. */
  title: string;
  /** Description text. */
  description: string;
  /** Whether to use primary variant styling (border + shadow). */
  isPrimary: boolean;
  /** Primary action button configuration. */
  primaryAction: { label: string; href?: string; onClick?: () => void; };
  /** Optional tag label displayed in the top-right corner. */
  tag?: string;
  /** Optional secondary action button (always opens external link). */
  secondaryAction?: { label: string; href: string; };
  /** Text size variant. `normal` uses h1-sized heading and responsive description; `smaller` uses h2-sized heading and base d */
  textSize?: "normal" | "smaller";
  /** Custom class name for the component. */
  className?: string;
}
```

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
