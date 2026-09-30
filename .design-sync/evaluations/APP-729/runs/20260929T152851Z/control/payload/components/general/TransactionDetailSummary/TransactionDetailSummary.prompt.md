TransactionDetailSummary from @aragon/gov-ui-kit. Use via `window.GovUiKit.TransactionDetailSummary` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface TransactionDetailSummaryProps {
  /** Chain ID of the transaction, used to build the block-explorer links. */
  chainId: number;
  /** Entity that executed the transaction, rendered on the `Executed by` row. */
  executedBy: ITransactionDetailSummaryExecutedBy;
  /** Identifier of the proposal that triggered the execution (e.g. 'CRE-54'). The row is omitted when not set. */
  proposalId?: string;
  /** Internal link applied to the proposal identifier (e.g. the proposal detail page). */
  proposalHref?: string;
  /** Total number of actions bundled in the execution. */
  totalActions: number;
  /** Hash of the execution transaction. Rendered truncated with an explorer link and a copy button. */
  transactionHash: `0x${string}`;
  /** Date of the execution in ISO format or as a timestamp. */
  date: string | number;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}
```

## Examples

### ActiveProcess

```jsx
() => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1_698_432_100_000}
            executedBy={{
                address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
                helptext: 'SPP v1.3',
                href: '/processes/core',
                label: 'Core',
            }}
            proposalHref="/proposals/CRE-54"
            proposalId="CRE-54"
            totalActions={5}
            transactionHash="0x9aaa5c2e7f1d3b8a6c4e0f2d9b7a5c3e1f8d6b4a2c0e9f7d5b3a1c8e6f4d2b0c"
        />
    </GukModulesProvider>
)
```

### InactiveProcess

```jsx
() => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1_697_040_000_000}
            executedBy={{
                address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
            }}
            totalActions={2}
            transactionHash="0x8f5b7c2f2ad5e304bd53a4a8bcbd11a4a58ab48b93c6e7f4e14a3d3c3b7f90aa"
        />
    </GukModulesProvider>
)
```

### PluginExecutor

```jsx
() => (
    <GukModulesProvider>
        <TransactionDetailSummary
            chainId={1}
            date={1_698_000_000_000}
            executedBy={{
                address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5',
                label: 'Token Voting',
            }}
            totalActions={1}
            transactionHash="0x1c9a4d7b0f3e2a5c8b6d4f1e9a7c5b3d2f0e8a6c4b2d0f9e7a5c3b1d8f6e4a2c"
        />
    </GukModulesProvider>
)
```
