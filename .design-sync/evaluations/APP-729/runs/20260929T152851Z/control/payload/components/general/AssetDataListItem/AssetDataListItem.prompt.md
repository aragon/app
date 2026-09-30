AssetDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.AssetDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `AssetDataListItem.Structure`, `AssetDataListItem.Skeleton`. See the DS docs for composition — e.g. items like `AssetDataListItem.Item` go inside `<AssetDataListItem>`; containers like `AssetDataListItem.Group` wrap multiple `<AssetDataListItem>`s.

## Examples

### Default

```jsx
() => (
    <GukModulesProvider>
        <AssetDataListItem.Structure
            amount={250_000}
            fiatPrice={1}
            name="USD Coin"
            symbol="USDC"
        />
    </GukModulesProvider>
)
```

### TreasuryList

```jsx
() => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <AssetDataListItem.Structure
                amount={250_000}
                fiatPrice={1}
                logoSrc={usdcLogo}
                name="USD Coin"
                symbol="USDC"
            />
            <AssetDataListItem.Structure
                amount={86.4}
                fiatPrice={3421.55}
                name="Ethereum"
                symbol="ETH"
            />
            <AssetDataListItem.Structure
                amount={1_200_000}
                fiatPrice={0.82}
                name="Aragon"
                symbol="ANT"
            />
        </div>
    </GukModulesProvider>
)
```

### HiddenValue

```jsx
() => (
    <GukModulesProvider>
        <AssetDataListItem.Structure
            amount={512}
            hideValue={true}
            name="Governance NFT"
            symbol="GOV"
        />
    </GukModulesProvider>
)
```

### Loading

```jsx
() => (
    <GukModulesProvider>
        <AssetDataListItem.Skeleton />
    </GukModulesProvider>
)
```

## Related

`AssetDataListItem.Structure`, `AssetDataListItem.Skeleton`
