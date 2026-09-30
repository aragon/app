TransactionDataListItem from @aragon/gov-ui-kit. Use via `window.GovUiKit.TransactionDataListItem` (bundle loaded from the root `_ds_bundle.js`).

Sub-components: `TransactionDataListItem.Structure`, `TransactionDataListItem.Skeleton`. Compose only these listed members, following the examples below. The `<TransactionDataListItem>` root is callable; no unlisted `Item` or `Group` member is implied.

## Examples

### Deposit

```jsx
() => (
    <GukModulesProvider>
        <TransactionDataListItem.Structure
            amountUsd={4531.25}
            chainId={1}
            date={1_698_765_432_000}
            hash="0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa"
            status={TransactionStatus.SUCCESS}
            tokenAmount={2500}
            tokenSymbol="USDC"
            type={TransactionType.DEPOSIT}
        />
    </GukModulesProvider>
)
```

### Withdraw

```jsx
() => (
    <GukModulesProvider>
        <TransactionDataListItem.Structure
            amountUsd={2812.5}
            chainId={1}
            date={1_697_040_000_000}
            hash="0x1c9a4d7b0f3e2a5c8b6d4f1e9a7c5b3d2f0e8a6c4b2d0f9e7a5c3b1d8f6e4a2c"
            status={TransactionStatus.SUCCESS}
            tokenAmount={1.5}
            tokenSymbol="ETH"
            type={TransactionType.WITHDRAW}
        />
    </GukModulesProvider>
)
```

### Failed

```jsx
() => (
    <GukModulesProvider>
        <TransactionDataListItem.Structure
            amountUsd={187.4}
            chainId={1}
            date={1_698_000_000_000}
            hash="0x3e7d9f1b5a2c8e4f6d0b9a7c3e5f1d8b2a4c6e0f9d7b5a3c1e8f4d2b6a0c9e7f"
            status={TransactionStatus.FAILED}
            tokenAmount={0.1}
            tokenSymbol="ETH"
            type={TransactionType.DEPOSIT}
        />
    </GukModulesProvider>
)
```

### Execution

```jsx
() => (
    <GukModulesProvider>
        <TransactionDataListItem.Structure
            actionCount={5}
            chainId={1}
            date={1_698_432_100_000}
            hash="0x9aaa5c2e7f1d3b8a6c4e0f2d9b7a5c3e1f8d6b4a2c0e9f7d5b3a1c8e6f4d2b0c"
            label="Token Voting"
            status={TransactionStatus.SUCCESS}
            type={TransactionType.EXECUTION}
        />
    </GukModulesProvider>
)
```

### Pending

```jsx
() => (
    <GukModulesProvider>
        <TransactionDataListItem.Structure
            chainId={1}
            date={1_698_890_000_000}
            hash="0x5d2f8a1c9e7b3f6d0a4c2e8f1b9d7a5c3e0f6d4b2a8c1e9f7d3b5a0c6e2f8d4b"
            status={TransactionStatus.PENDING}
            tokenAmount={10_000}
            tokenSymbol="DAI"
            type={TransactionType.DEPOSIT}
        />
    </GukModulesProvider>
)
```

## Related

`TransactionDataListItem.Structure`, `TransactionDataListItem.Skeleton`
