DaoDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.DaoDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `DaoDataListItem.Structure`, `DaoDataListItem.Skeleton`. See the DS docs for composition — e.g. items like `DaoDataListItem.Item` go inside `<DaoDataListItem>`; containers like `DaoDataListItem.Group` wrap multiple `<DaoDataListItem>`s.

## Examples

### Default

```jsx
() => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8"
            description="A community-owned DAO funding public goods across the Ethereum ecosystem through quarterly grant rounds."
            name="Patito DAO"
            network="ethereum"
        />
    </GukModulesProvider>
)
```

### WithEns

```jsx
() => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
            description="Protocol treasury council coordinating audits, upgrades and long-term contributor compensation."
            ens="builders.dao.eth"
            name="Builders Collective"
            network="polygon"
        />
    </GukModulesProvider>
)
```

### External

```jsx
() => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
            description="An external DAO operating on a partner network, linked from the explorer."
            isExternal={true}
            name="Nouncil"
            network="base"
        />
    </GukModulesProvider>
)
```

### Loading

```jsx
() => (
    <GukModulesProvider>
        <DaoDataListItem.Skeleton />
    </GukModulesProvider>
)
```

## Related

`DaoDataListItem.Structure`, `DaoDataListItem.Skeleton`
