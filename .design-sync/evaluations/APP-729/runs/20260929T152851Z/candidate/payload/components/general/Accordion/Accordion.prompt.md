Accordion from @aragon/gov-ui-kit. Use via `window.GovUiKit.Accordion` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `Accordion.Container`, `Accordion.Item`, `Accordion.ItemHeader`, `Accordion.ItemContent`. Compose only these listed members, following the examples below. The `<Accordion>` root is callable; no unlisted `Item` or `Group` member is implied.

## Examples

### Default

```jsx
() => (
    <Accordion.Container
        className="w-full"
        defaultValue="item-0"
        isMulti={false}
    >
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Voting settings</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">
                    Proposals pass when the support threshold and minimum
                    participation are both met.
                </p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="item-1">
            <Accordion.ItemHeader>Governance token</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">One token equals one vote.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
    </Accordion.Container>
)
```

### MultiOpen

```jsx
() => (
    <Accordion.Container
        className="w-full"
        defaultValue={['item-0', 'item-1']}
        isMulti={true}
    >
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Members</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">
                    12 members can create proposals.
                </p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="item-1">
            <Accordion.ItemHeader>Treasury</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">3 assets held by the DAO.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
    </Accordion.Container>
)
```

### DisabledItem

```jsx
() => (
    <Accordion.Container className="w-full" isMulti={true}>
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Available section</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">
                    This section can be expanded.
                </p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item disabled={true} value="item-1">
            <Accordion.ItemHeader>Locked section</Accordion.ItemHeader>
        </Accordion.Item>
    </Accordion.Container>
)
```

## Related

`Accordion.Container`, `Accordion.Item`, `Accordion.ItemHeader`, `Accordion.ItemContent`
