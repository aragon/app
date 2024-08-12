import { generateToken } from '@/modules/finance/testUtils';
import { ProposalActionType, type IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';

export const generateProposalActionWithdrawToken = (
    action?: Partial<IProposalActionWithdrawToken>,
): IProposalActionWithdrawToken => ({
    type: ProposalActionType.TRANSFER,
    sender: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    receiver: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
    token: generateToken(),
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
    data: '',
    value: '1000000',
    inputData: {
        function: 'transfer',
        contract: 'Ether',
        parameters: [
            {
                name: 'functionName',
                type: 'string',
                value: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
            },
            {
                name: 'functionName',
                type: 'string',
                value: '1000000000000000000',
            },
        ],
    },
    amount: '10000000',
    ...action,
});
