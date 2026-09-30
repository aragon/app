SmartContractFunctionDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.SmartContractFunctionDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `SmartContractFunctionDataListItem.Skeleton`, `SmartContractFunctionDataListItem.Structure`. Compose only these listed members, following the examples below. The `<SmartContractFunctionDataListItem>` root is callable; no unlisted `Item` or `Group` member is implied.

## Examples

### Verified

```jsx
() => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            contractName="GovernanceERC20"
            functionName="transfer"
        />
    </GukModulesProvider>
)
```

### Unverified

```jsx
() => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure contractAddress="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5" />
    </GukModulesProvider>
)
```

### WithFunctionSelector

```jsx
() => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            contractName="GovernanceERC20"
            functionName="approve"
            functionSelector="0x095ea7b3"
        />
    </GukModulesProvider>
)
```

### WithRemoveButton

```jsx
() => (
    <GukModulesProvider>
        <SmartContractFunctionDataListItem.Structure
            contractAddress="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
            contractName="GovernanceERC20"
            functionName="mint"
            onRemove={() => undefined}
        />
    </GukModulesProvider>
)
```

## Related

`SmartContractFunctionDataListItem.Skeleton`, `SmartContractFunctionDataListItem.Structure`
