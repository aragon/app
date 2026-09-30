NetworkSwitchAlert from @aragon/gov-ui-kit. Use via `window.GovUiKit.NetworkSwitchAlert` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### EthereumMainnet

```jsx
() => (
    <AppProviders>
        <div className="max-w-lg">
            <NetworkSwitchAlert
                isCrossNetworkTransaction={true}
                networkName="Ethereum Mainnet"
            />
        </div>
    </AppProviders>
)
```

### Base

```jsx
() => (
    <AppProviders>
        <div className="max-w-lg">
            <NetworkSwitchAlert
                isCrossNetworkTransaction={true}
                networkName="Base"
            />
        </div>
    </AppProviders>
)
```
