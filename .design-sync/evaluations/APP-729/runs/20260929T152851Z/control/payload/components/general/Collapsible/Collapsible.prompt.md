Collapsible from @aragon/gov-ui-kit. Use via `window.GovUiKit.Collapsible` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface CollapsibleProps {
  /** Number of text lines to show while collapsed. */
  collapsedLines?: number;
  /** Exact pixel height for the collapsible container that will override collapsedLines prop if defined. */
  collapsedPixels?: number;
  /** Number of text lines used for the gradient overlay height when collapsed. Has effect only when `showOverlay` is true and */
  overlayLines?: number;
  /** Controlled state of the collapsible container. */
  isOpen?: boolean;
  /** Default state of the collapsible container. */
  defaultOpen?: boolean;
  /** The label to display on the trigger button when the collapsible container is closed. */
  buttonLabelClosed?: string;
  /** The label to display on the trigger button when the collapsible container is open. */
  buttonLabelOpened?: string;
  /** Show overlay when the collapsible container is open. */
  showOverlay?: boolean;
  /** Callback function that is called when the collapsible container is toggled. */
  onToggle?: (isOpen: boolean) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
    <div className="w-full">
        <Collapsible
            buttonLabelClosed="Read more"
            buttonLabelOpened="Read less"
        >
            {proposalSummary}
        </Collapsible>
    </div>
)
```

### WithOverlay

```jsx
() => (
    <div className="w-full">
        <Collapsible
            buttonLabelClosed="Read more"
            buttonLabelOpened="Read less"
            overlayLines={2}
            showOverlay={true}
        >
            {proposalSummary}
        </Collapsible>
    </div>
)
```

### Expanded

```jsx
() => (
    <div className="w-full">
        <Collapsible
            buttonLabelClosed="Read more"
            buttonLabelOpened="Read less"
            defaultOpen={true}
        >
            {proposalSummary}
        </Collapsible>
    </div>
)
```

### CustomCollapsedLines

```jsx
() => (
    <div className="w-full">
        <Collapsible
            buttonLabelClosed="Show full description"
            buttonLabelOpened="Hide description"
            collapsedLines={5}
        >
            {proposalSummary}
        </Collapsible>
    </div>
)
```
