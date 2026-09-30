ProposalActionWithdrawToken from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalActionWithdrawToken` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProposalActionWithdrawTokenProps {
  /** Action to be rendered. */
  action: IProposalActionWithdrawToken;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### StablecoinTransfer

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionWithdrawToken
            action={{
                ...baseAction,
                type: ProposalActionType.WITHDRAW_TOKEN,
                sender: {
                    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    name: 'Patito DAO Treasury',
                },
                receiver: {
                    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                    name: 'grants.patito.eth',
                },
                token: {
                    name: 'USD Coin',
                    symbol: 'USDC',
                    logo: usdcLogo,
                    priceUsd: '1.00',
                    decimals: 6,
                    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                },
                amount: '50000',
            }}
            index={0}
        />
    </GukModulesProvider>
)
```

### EthTransfer

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionWithdrawToken
            action={{
                ...baseAction,
                type: ProposalActionType.WITHDRAW_TOKEN,
                sender: {
                    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                },
                receiver: {
                    address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
                },
                token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    logo: ethLogo,
                    priceUsd: '3421.55',
                    decimals: 18,
                    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                },
                amount: '12.5',
            }}
            index={1}
        />
    </GukModulesProvider>
)
```
