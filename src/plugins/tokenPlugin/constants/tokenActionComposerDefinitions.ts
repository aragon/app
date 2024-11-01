import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';

export const defaultMintAction: IProposalAction = {
    type: ProposalActionType.MINT,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'mint',
        contract: 'GovernanceERC20',
        parameters: [
            {
                name: 'to',
                type: 'address',
                value: '',
                notice: 'The address to mint tokens to',
            },
            {
                name: 'amount',
                type: 'uint256',
                value: '',
                notice: 'The amount of tokens to mint',
            },
        ],
    },
};
