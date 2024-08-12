import { type IProposalActionTokenMint, ProposalActionType } from '@/modules/governance/api/governanceService';

export const generateProposalActionTokenMint = (
    action: Partial<IProposalActionTokenMint>,
): IProposalActionTokenMint => ({
    type: ProposalActionType.MINT,
    receivers: {
        address: '0x1',
        currentBalance: 1,
        newBalance: 1,
    },
    token: {
        address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
        symbol: 'ETH',
        decimals: 18,
    },
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
    data: '',
    value: '1000000',
    tokenSupply: 0,
    holdersCount: 0,
    tokenSymbol: 'ETH',
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
