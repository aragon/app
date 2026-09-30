ProposalActionChangeMembers from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalActionChangeMembers` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProposalActionChangeMembersProps {
  /** Action to be rendered. */
  action: IProposalActionChangeMembers;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### AddMembers

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.ADD_MEMBERS,
                members: [
                    {
                        address: '0xceB69F6342eCE283b2F5c9088Ff249B5d0Ae66ea',
                        name: 'treasury-ops.eth',
                    },
                    { address: '0x97fb9274ac39bB275AC76f56390e6713A2C417D9' },
                    {
                        address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
                        name: 'cgero.eth',
                    },
                ],
                currentMembers: 5,
            }}
            index={0}
        />
    </GukModulesProvider>
)
```

### RemoveMembers

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.REMOVE_MEMBERS,
                members: [
                    {
                        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                        name: 'inactive-signer.eth',
                    },
                    { address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465' },
                ],
                currentMembers: 8,
            }}
            index={1}
        />
    </GukModulesProvider>
)
```

### AddSingleMember

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionChangeMembers
            action={{
                ...baseAction,
                type: ProposalActionType.ADD_MEMBERS,
                members: [
                    {
                        address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786',
                        name: 'security-council.eth',
                    },
                ],
                currentMembers: 3,
            }}
            index={0}
        />
    </GukModulesProvider>
)
```
