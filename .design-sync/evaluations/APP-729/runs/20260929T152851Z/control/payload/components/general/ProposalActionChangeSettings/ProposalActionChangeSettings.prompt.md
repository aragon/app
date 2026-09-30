ProposalActionChangeSettings from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalActionChangeSettings` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProposalActionChangeSettingsProps {
  /** Action to be rendered. */
  action: IProposalActionChangeSettings;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### TokenVoting

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionChangeSettings
            action={{
                ...baseAction,
                type: ProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
                existingSettings: [
                    { term: 'Approval threshold', definition: '> 50%' },
                    {
                        term: 'Minimum participation',
                        definition: '≥ 15% (≥ 300.5K ARA)',
                    },
                    {
                        term: 'Minimum duration',
                        definition: '3 days, 0 hours, 0 minutes',
                    },
                    { term: 'Early execution', definition: 'Yes' },
                ],
                proposedSettings: [
                    { term: 'Approval threshold', definition: '> 55%' },
                    {
                        term: 'Minimum participation',
                        definition: '≥ 20% (≥ 400.7K ARA)',
                    },
                    {
                        term: 'Minimum duration',
                        definition: '5 days, 0 hours, 0 minutes',
                    },
                    { term: 'Early execution', definition: 'No' },
                ],
            }}
            index={0}
        />
    </GukModulesProvider>
)
```

### Multisig

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionChangeSettings
            action={{
                ...baseAction,
                type: ProposalActionType.CHANGE_SETTINGS_MULTISIG,
                existingSettings: [
                    {
                        term: 'Approval threshold',
                        definition: '3 of 5 members',
                    },
                    { term: 'Proposal creation', definition: 'Any member' },
                ],
                proposedSettings: [
                    {
                        term: 'Approval threshold',
                        definition: '4 of 7 members',
                    },
                    { term: 'Proposal creation', definition: 'Any member' },
                ],
            }}
            index={1}
        />
    </GukModulesProvider>
)
```
