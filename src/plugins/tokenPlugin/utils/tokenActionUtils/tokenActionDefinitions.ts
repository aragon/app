import { type ITokenProposalAction, TokenProposalActionType } from '../../types';

export const defaultMintAction: ITokenProposalAction = {
    type: TokenProposalActionType.MINT,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    inputData: {
        function: 'mint',
        contract: '',
        parameters: [
            {
                name: 'to',
                type: 'address',
                value: '',
                notice: 'The address receiving the tokens.',
            },
            {
                name: 'amount',
                type: 'uint256',
                value: '',
                notice: 'The amount of tokens to be minted.',
            },
        ],
    },
};
