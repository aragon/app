import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { IProposalActionChangeSettings } from '@/modules/governance/api/governanceService/domain/proposalActionChangeSettings';

export const generateProposalActionChangeSettings = (
    action?: Partial<IProposalActionChangeSettings>,
): IProposalActionChangeSettings => ({
    existingSettings: [
        { term: 'Token Symbol', definition: 'ABC' },
        { term: 'Support Threshold', definition: '50%' },
        { term: 'Proposal Threshold', definition: '1%' },
        { term: 'Minimum Duration', definition: '7 days' },
        { term: 'Early Execution', definition: 'No' },
        { term: 'Vote Changes', definition: 'Yes' },
    ],
    proposedSettings: [
        { term: 'Token Symbol', definition: 'ABC' },
        { term: 'Support Threshold', definition: '60%' },
        { term: 'Proposal Threshold', definition: '2%' },
        { term: 'Minimum Duration', definition: '5 days' },
        { term: 'Early Execution', definition: 'Yes' },
        { term: 'Vote Changes', definition: 'No' },
    ],
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
    data: '',
    value: '1000000',
    inputData: {
        function: 'settings',
        contract: 'GovernanceERC20',
        parameters: [
            { name: 'updateSettings', type: 'address', value: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
            { name: 'transferAsset', type: 'uint256', value: '1000000000000000000' },
        ],
    },
    ...action,
});
