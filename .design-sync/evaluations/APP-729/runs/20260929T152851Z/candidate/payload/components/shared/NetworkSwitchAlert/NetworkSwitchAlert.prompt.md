NetworkSwitchAlert from @aragon/app. Source: `apps/app/src/shared/components/networkSwitchAlert/networkSwitchAlert.tsx`. Use via `window.GovUiKit.NetworkSwitchAlert` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface NetworkSwitchAlertProps {
  /** Whether the wallet's current chain differs from the required chain. */
  isCrossNetworkTransaction: boolean;
  /** Human-readable name of the required network. */
  networkName?: string;
}
```

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
