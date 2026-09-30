ProposalActionTokenMint from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalActionTokenMint` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProposalActionTokenMintProps {
  /** Action to be rendered. */
  action: IProposalActionTokenMint;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### NewHolder

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionTokenMint
            action={{
                ...baseAction,
                type: ProposalActionType.TOKEN_MINT,
                tokenSymbol: 'ARA',
                receiver: {
                    currentBalance: '0',
                    newBalance: '150000',
                    address: '0x32c2FE388ABbB3e678D44DF6a0471086D705316a',
                    name: 'grants-multisig.eth',
                },
            }}
            index={0}
        />
    </GukModulesProvider>
)
```

### TopUpExistingHolder

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionTokenMint
            action={{
                ...baseAction,
                type: ProposalActionType.TOKEN_MINT,
                tokenSymbol: 'GTT',
                receiver: {
                    currentBalance: '250000',
                    newBalance: '500000',
                    address: '0x97fb9274ac39bB275AC76f56390e6713A2C417D9',
                },
            }}
            index={1}
        />
    </GukModulesProvider>
)
```
