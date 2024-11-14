import {
    type IProposalAction,
    IProposalActionChangeSettings,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import { ITokenPluginSettings } from '../../types';

export const defaultMintAction: IProposalAction = {
    type: ProposalActionType.MINT,
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

export const defaultUpdateSettings = (settings: ITokenPluginSettings): IProposalActionChangeSettings => ({
    type: ProposalActionType.UPDATE_VOTE_SETTINGS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedSettings: settings,
    inputData: {
        function: 'updateVotingSettings',
        contract: '',
        parameters: [
            {
                name: '_votingSettings',
                type: 'tuple',
                notice: 'The new settings',
                value: '',
            },
        ],
    },
});
