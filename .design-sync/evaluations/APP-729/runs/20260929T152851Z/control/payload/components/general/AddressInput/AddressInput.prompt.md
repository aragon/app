AddressInput from @aragon/gov-ui-kit. Use via `window.GovUiKit.AddressInput` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface AddressInputProps {
  /** Current value of the address input. */
  value?: string;
  /** Callback called whenever the current input value (address or ens) changes. */
  onChange?: (value?: string) => void;
  /** Callback called with the address value object when the user input is valid. The component will output the address in che */
  onAccept?: (value?: IAddressInputResolvedValue) => void;
  /** Require an address to pass EIP-55 checksum validation. */
  enforceChecksum?: boolean;
  /** Hides the control buttons (ENS/address toggle, block explorer link, copy, clear, and paste). */
  hideControls?: boolean;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: CSSProperties;
  /** Classes for the component. */
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Classes for the input element. */
  inputClassName?: string;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}
```

## Examples

### WithAddress

```jsx
() => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            helpText="The address receiving the transferred tokens."
            label="Recipient"
            onChange={noop}
            value="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
        />
    </GukModulesProvider>
)
```

### Empty

```jsx
() => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            label="Wallet address or ENS"
            onChange={noop}
            placeholder="0x… or name.eth"
            value=""
        />
    </GukModulesProvider>
)
```

### ChecksumError

```jsx
() => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            label="Recipient"
            onChange={noop}
            value="0x17c6808fA04DC9de98eaCfeb4c66B352067c1cDD"
        />
    </GukModulesProvider>
)
```

### Disabled

```jsx
() => (
    <GukModulesProvider>
        <AddressInput
            chainId={1}
            disabled={true}
            label="Token contract"
            onChange={noop}
            value="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
        />
    </GukModulesProvider>
)
```
