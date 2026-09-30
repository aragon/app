AutocompleteInput from @aragon/app. Source: `apps/app/src/shared/components/forms/autocompleteInput/autocompleteInput.tsx`. Use via `window.GovUiKit.AutocompleteInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AutocompleteInputProps {
  /** Items to be rendered. */
  items: IAutocompleteInputItem<undefined>[];
  /** Information about the item groups. */
  groups?: IAutocompleteInputGroup[];
  /** ID of the current selected item. */
  value?: string;
  /** Callback called with the ID of the item selected and the current input value. */
  onChange?: (value: string, inputValue: string) => void;
  /** Callback called on open property change. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Label displayed on the menu footer for selecting an item. */
  selectItemLabel: string;
  children?: React.ReactNode;
  id?: string;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Variant of the input. */
  variant?: "warning" | "default" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Displays an input length counter when set. */
  maxLength?: number;
  /** Classes for the component. */
  className?: string;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  /** Text to be rendered beside the input field. */
  addon?: string;
  /** Position of the addon element in relation to the input field. */
  addonPosition?: "left" | "right";
  /** Icon to be rendered on the left side of the input field. */
  iconLeft?: unknown;
  /** Icon to be rendered on the right side of the input field. */
  iconRight?: unknown;
  /** Classes for the input element. */
  inputClassName?: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
}
```

## Examples

### Default

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            helpText="Search for an action to add to the proposal."
            items={actionItems}
            label="Add action"
            placeholder="Search actions, contracts or addresses…"
            selectItemLabel="Select action"
        />
    </AppProviders>
)
```

### WithGroups

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            groups={actionGroups}
            items={actionItems.map((item, index) => ({
                ...item,
                groupId: index < 2 ? 'treasury' : 'governance',
            }))}
            label="Proposal action"
            placeholder="What should this proposal do?"
            selectItemLabel="Select action"
        />
    </AppProviders>
)
```

### Critical

```jsx
() => (
    <AppProviders>
        <AutocompleteInput
            alert={{
                message: 'No action matches this search.',
                variant: 'critical',
            }}
            items={actionItems}
            label="Add action"
            placeholder="Search actions…"
            selectItemLabel="Select action"
            variant="critical"
        />
    </AppProviders>
)
```
