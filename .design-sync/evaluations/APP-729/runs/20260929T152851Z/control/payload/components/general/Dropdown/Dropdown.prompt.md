Dropdown from @aragon/gov-ui-kit. Use via `window.GovUiKit.Dropdown` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `Dropdown.Container`, `Dropdown.Item`. See the DS docs for composition — e.g. items like `Dropdown.Item` go inside `<Dropdown>`; containers like `Dropdown.Group` wrap multiple `<Dropdown>`s.

## Examples

### OpenMenu

```jsx
() => (
    <div className="flex h-72 w-full items-start">
        <Dropdown.Container
            defaultOpen={true}
            label="Proposal actions"
            size="md"
        >
            <Dropdown.Item icon={IconType.PLUS} iconPosition="left">
                Create proposal
            </Dropdown.Item>
            <Dropdown.Item icon={IconType.COPY} iconPosition="left">
                Duplicate proposal
            </Dropdown.Item>
            <Dropdown.Item selected={true}>Sort by newest</Dropdown.Item>
            <Dropdown.Item
                disabled={true}
                icon={IconType.SETTINGS}
                iconPosition="left"
            >
                Edit settings
            </Dropdown.Item>
        </Dropdown.Container>
    </div>
)
```

### ClosedTriggers

```jsx
() => (
    <div className="flex items-center gap-4">
        <Dropdown.Container label="Filter proposals" size="md" />
        <Dropdown.Container size="md" />
        <Dropdown.Container disabled={true} label="Disabled" size="md" />
    </div>
)
```

## Related

`Dropdown.Container`, `Dropdown.Item`
