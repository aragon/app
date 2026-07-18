import { GukModulesProvider, ProposalActionUpdateMetadata, ProposalActionType } from '@aragon/gov-ui-kit';

const baseAction = {
    from: '0x25716fB10298638eD386A5A5dD2E9233D213F442',
    to: '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
    data: '',
    value: '0',
    inputData: null,
};

const oldAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%233164FA'/%3E%3Ccircle cx='32' cy='32' r='14' fill='white'/%3E%3C/svg%3E";
const newAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%2310B981'/%3E%3Cpath d='M20 40 L32 20 L44 40 Z' fill='white'/%3E%3C/svg%3E";

export const DaoMetadata = () => (
    <GukModulesProvider>
        <ProposalActionUpdateMetadata
            action={{
                ...baseAction,
                type: ProposalActionType.UPDATE_METADATA,
                existingMetadata: {
                    avatar: oldAvatar,
                    name: 'Patito DAO',
                    description: 'A community-run DAO funding public goods in the Patito ecosystem.',
                    links: [{ label: 'Website', href: 'https://patito.example.org/' }],
                },
                proposedMetadata: {
                    avatar: newAvatar,
                    name: 'Patito Collective',
                    description:
                        'The Patito Collective funds public goods, coordinates contributors, and stewards the protocol treasury.',
                    links: [
                        { label: 'Website', href: 'https://patito.example.org/' },
                        { label: 'Forum', href: 'https://forum.patito.example.org/' },
                    ],
                },
            }}
            index={0}
        />
    </GukModulesProvider>
);

export const PluginMetadata = () => (
    <GukModulesProvider>
        <ProposalActionUpdateMetadata
            action={{
                ...baseAction,
                type: ProposalActionType.UPDATE_PLUGIN_METADATA,
                existingMetadata: {
                    name: 'Founder council',
                    description: 'Some non helpful description',
                    links: [{ label: 'Charter', href: 'https://patito.example.org/charter' }],
                },
                proposedMetadata: {
                    name: 'Founders council',
                    description:
                        'The founders council is composed of the original founders of the DAO and holds a veto right on all published proposals.',
                    links: [
                        { label: 'Charter', href: 'https://patito.example.org/charter' },
                        { label: 'Members', href: 'https://patito.example.org/members' },
                    ],
                },
            }}
            index={1}
        />
    </GukModulesProvider>
);

export const ProcessPluginMetadata = () => (
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
                    links: [{ label: 'Process docs', href: 'https://patito.example.org/process/core' }],
                },
            }}
            index={2}
        />
    </GukModulesProvider>
);
