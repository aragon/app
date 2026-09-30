Tooltip from @aragon/gov-ui-kit. Use via `window.GovUiKit.Tooltip` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TooltipProps {
  /** Content of the tooltip */
  content: React.ReactNode;
  /** Defines the variant of the tooltip */
  variant?: "warning" | "critical" | "info" | "success" | "neutral";
  /** The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state. */
  defaultOpen?: boolean;
  /** The controlled open state of the tooltip. Must be used in conjunction with `onOpenChange`. */
  open?: boolean;
  /** Event handler called when the open state of the tooltip changes. */
  onOpenChange?: (open: boolean) => void;
  /** The duration from when the mouse enters the trigger until the tooltip opens. */
  delayDuration?: number;
  /** When `true`, hovering the content will keep the tooltip open. */
  disableHoverableContent?: boolean;
  /** Additional class names for the tooltip content. */
  className?: string;
  /** Children elements to trigger the tooltip. */
  children?: React.ReactNode;
  /** When `true`, the tooltip will use children button as a trigger, to avoid a button inside a button. */
  triggerAsChild?: boolean;
}
```

## Examples

### Default

```jsx
() => (
    <div className="flex justify-center pt-16 pb-2">
        <Tooltip content="Voting ends July 19, 2026" defaultOpen={true}>
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">
                7 days left
            </p>
        </Tooltip>
    </div>
)
```

### Variants

```jsx
() => (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pt-16 pb-2">
        <Tooltip content="Informational" defaultOpen={true} variant="info">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">
                Info
            </p>
        </Tooltip>
        <Tooltip content="Proposal passed" defaultOpen={true} variant="success">
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">
                Success
            </p>
        </Tooltip>
        <Tooltip
            content="Low participation"
            defaultOpen={true}
            variant="warning"
        >
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">
                Warning
            </p>
        </Tooltip>
        <Tooltip
            content="Execution failed"
            defaultOpen={true}
            variant="critical"
        >
            <p className="rounded border border-neutral-200 px-3 py-2 text-neutral-500">
                Critical
            </p>
        </Tooltip>
    </div>
)
```
