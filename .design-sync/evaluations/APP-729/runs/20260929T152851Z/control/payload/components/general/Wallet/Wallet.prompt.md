Wallet from @aragon/gov-ui-kit. Use via `window.GovUiKit.Wallet` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface WalletProps {
  /** The connected user details. */
  user?: ICompositeAddress;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### Disconnected

```jsx
() => (
    <GukModulesProvider>
        <Wallet />
    </GukModulesProvider>
)
```

### Connected

```jsx
() => (
    <GukModulesProvider>
        <Wallet
            user={{
                address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD',
                avatarSrc: blueAvatar,
                name: 'cgero.eth',
            }}
        />
    </GukModulesProvider>
)
```

### CustomName

```jsx
() => (
    <GukModulesProvider>
        <Wallet
            user={{
                address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5',
                avatarSrc: tealAvatar,
                name: 'Aragon DAO',
            }}
        />
    </GukModulesProvider>
)
```
