import { ProposalActionType, type IProposalActionChangeSettings } from '@/modules/governance/api/governanceService';

export const generateProposalActionChangeSettings = (
    action?: Partial<IProposalActionChangeSettings>,
): IProposalActionChangeSettings => ({
    proposedSettings: {
        settings: {
            minApprovals: 1,
            onlyListed: false,
        },
        id: '0x123',
        pluginAddress: '0x123',
        pluginSubdomain: 'multisig',
    },
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
