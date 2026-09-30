ToggleGroup from @aragon/gov-ui-kit. Use via `window.GovUiKit.ToggleGroup` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ToggleGroupProps {
  /** Variant of the component defining the spacing between the toggle items. */
  variant?: "fixed" | "space-between";
  /** Orientation of the toggle group. */
  orientation?: "horizontal" | "vertical";
  /** Allows multiple toggles to be selected at the same time when set to true. */
  isMultiSelect: boolean;
  /** Current value of the toggle selection. */
  value?: string | string[];
  /** Default toggle selection. */
  defaultValue?: string | string[];
  /** Callback called on toggle selection change. */
  onChange?: ((value: string[]) => void) | ((value: string) => void);
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
    <ToggleGroup defaultValue="multisig" isMultiSelect={false}>
        <Toggle label="Multisig" value="multisig" />
        <Toggle label="Token based" value="token-based" />
        <Toggle label="Admin" value="admin" />
    </ToggleGroup>
)
```

### MultiSelect

```jsx
() => (
    <ToggleGroup defaultValue={['all', 'member']} isMultiSelect={true}>
        <Toggle label="All DAOs" value="all" />
        <Toggle label="Member" value="member" />
        <Toggle disabled={true} label="Following" value="following" />
    </ToggleGroup>
)
```

### SpaceBetween

```jsx
() => (
    <ToggleGroup
        className="w-full"
        defaultValue="default"
        isMultiSelect={false}
        variant="space-between"
    >
        <Toggle label="Default" value="default" />
        <Toggle label="Optimistic" value="optimistic" />
        <Toggle label="Timelock" value="timelock" />
    </ToggleGroup>
)
```

### Vertical

```jsx
() => (
    <ToggleGroup
        defaultValue="active"
        isMultiSelect={false}
        orientation="vertical"
    >
        <Toggle label="Active" value="active" />
        <Toggle label="Pending" value="pending" />
        <Toggle label="Executed" value="executed" />
    </ToggleGroup>
)
```
