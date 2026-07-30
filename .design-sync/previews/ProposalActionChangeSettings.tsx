import {
    GukModulesProvider,
    ProposalActionChangeSettings,
    ProposalActionType,
} from '@aragon/gov-ui-kit';

const baseAction = {
    from: '0x25716fB10298638eD386A5A5dD2E9233D213F442',
    to: '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
    data: '',
    value: '0',
    inputData: null,
};

export const TokenVoting = () => (
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
);

export const Multisig = () => (
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
);
