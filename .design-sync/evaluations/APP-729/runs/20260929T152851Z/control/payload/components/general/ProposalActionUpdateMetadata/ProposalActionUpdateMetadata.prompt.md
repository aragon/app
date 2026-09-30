ProposalActionUpdateMetadata from @aragon/gov-ui-kit. Use via `window.GovUiKit.ProposalActionUpdateMetadata` (bundle loaded from the root `_ds_bundle.js`).

## Props

```ts
interface ProposalActionUpdateMetadataProps {
  /** Action to be rendered. */
  action: IProposalActionUpdateMetadata;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}
```

## Examples

### DaoMetadata

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionUpdateMetadata
            action={{
                ...baseAction,
                type: ProposalActionType.UPDATE_METADATA,
                existingMetadata: {
                    avatar: oldAvatar,
                    name: 'Patito DAO',
                    description:
                        'A community-run DAO funding public goods in the Patito ecosystem.',
                    links: [
                        {
                            label: 'Website',
                            href: 'https://patito.example.org/',
                        },
                    ],
                },
                proposedMetadata: {
                    avatar: newAvatar,
                    name: 'Patito Collective',
                    description:
                        'The Patito Collective funds public goods, coordinates contributors, and stewards the protocol treasury.',
                    links: [
                        {
                            label: 'Website',
                            href: 'https://patito.example.org/',
                        },
                        {
                            label: 'Forum',
                            href: 'https://forum.patito.example.org/',
                        },
                    ],
                },
            }}
            index={0}
        />
    </GukModulesProvider>
)
```

### PluginMetadata

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionUpdateMetadata
            action={{
                ...baseAction,
                type: ProposalActionType.UPDATE_PLUGIN_METADATA,
                existingMetadata: {
                    name: 'Founder council',
                    description: 'Some non helpful description',
                    links: [
                        {
                            label: 'Charter',
                            href: 'https://patito.example.org/charter',
                        },
                    ],
                },
                proposedMetadata: {
                    name: 'Founders council',
                    description:
                        'The founders council is composed of the original founders of the DAO and holds a veto right on all published proposals.',
                    links: [
                        {
                            label: 'Charter',
                            href: 'https://patito.example.org/charter',
                        },
                        {
                            label: 'Members',
                            href: 'https://patito.example.org/members',
                        },
                    ],
                },
            }}
            index={1}
        />
    </GukModulesProvider>
)
```

### ProcessPluginMetadata

```jsx
() => (
    <GukModulesProvider>
        <ProposalActionUpdateMetadata
            action={{
                ...baseAction,
                type: ProposalActionType.UPDATE_PLUGIN_METADATA,
                existingMetadata: {
                    name: 'Core',
                    processKey: 'CRE',
                    description: 'Primary process.',
                    links: [],
                },
                proposedMetadata: {
                    name: 'Core',
                    processKey: 'CRE',
                    description:
                        'Core proposals are the primary governance process of the DAO. Grants and protocol upgrades both require passing a Core proposal.',
                    links: [
                        {
                            label: 'Process docs',
                            href: 'https://patito.example.org/process/core',
                        },
                    ],
                },
            }}
            index={2}
        />
    </GukModulesProvider>
)
```
