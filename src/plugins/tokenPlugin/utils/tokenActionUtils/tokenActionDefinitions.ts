import { formatUnits } from 'viem';
import {
    type ITokenActionChangeSettings,
    type ITokenPluginSettings,
    type ITokenProposalAction,
    TokenProposalActionType,
} from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

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

export const defaultUpdateSettings = (settings: ITokenPluginSettings): ITokenActionChangeSettings => ({
    type: TokenProposalActionType.UPDATE_VOTE_SETTINGS,
    from: '',
    to: '',
    data: '0x',
    value: '0',
    proposedSettings: {
        ...settings,
        minParticipation: tokenSettingsUtils.fromRatioToPercentage(settings.minParticipation),
        supportThreshold: tokenSettingsUtils.fromRatioToPercentage(settings.supportThreshold),
        minProposerVotingPower: formatUnits(BigInt(settings.minProposerVotingPower), settings.token.decimals),
    },
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
