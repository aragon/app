AssetDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.AssetDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `AssetDataListItem.Structure`, `AssetDataListItem.Skeleton`. Compose only these listed members, following the examples below. The `<AssetDataListItem>` root is callable; no unlisted `Item` or `Group` member is implied.

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
