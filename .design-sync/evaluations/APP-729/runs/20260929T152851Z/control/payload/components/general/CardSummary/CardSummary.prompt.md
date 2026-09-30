CardSummary from @aragon/gov-ui-kit. Use via `window.GovUiKit.CardSummary` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CardSummaryProps {
  /** Icon displayed on the card. */
  icon: unknown;
  /** Value of the summary. */
  value: string;
  /** Description of the summary. */
  description: string;
  /** Action of the summary. */
  action: ICardSummaryAction;
  /** Renders the action as stacked when set to true. */
  isStacked?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <CardSummary
        action={{ label: 'Create proposal' }}
        className="w-full"
        description="Proposals created"
        icon={IconType.APP_PROPOSALS}
        value="24"
    />
)
```

### Members

```jsx
() => (
    <CardSummary
        action={{ label: 'Delegate' }}
        className="w-full"
        description="Token holders"
        icon={IconType.APP_MEMBERS}
        value="1.2K"
    />
)
```

### HorizontalLayout

```jsx
() => (
    <CardSummary
        action={{ label: 'View treasury' }}
        className="w-full"
        description="Treasury value in USD"
        icon={IconType.APP_ASSETS}
        isStacked={false}
        value="$1.4M"
    />
)
```
