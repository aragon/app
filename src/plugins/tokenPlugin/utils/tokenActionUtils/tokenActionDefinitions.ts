import type { IDaoPlugin } from '@/shared/api/daoService';
import { formatUnits } from 'viem';
import {
    type ITokenActionChangeSettings,
    type ITokenPluginSettings,
    type ITokenProposalAction,
    TokenProposalActionType,
} from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

export const defaultMintAction = (settings: ITokenPluginSettings): ITokenProposalAction => ({
    type: TokenProposalActionType.MINT,
    from: '',
    to: settings.token.address,
    data: '0x',
    value: '0',
    inputData: {
        function: 'mint',
        contract: settings.token.name,
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
});

export const defaultUpdateSettings = ({
    address,
    settings,
}: IDaoPlugin<ITokenPluginSettings>): ITokenActionChangeSettings => ({
    type: TokenProposalActionType.UPDATE_VOTE_SETTINGS,
    from: '',
    to: address,
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
                components: [
                    { name: 'votingMode', type: 'uint8' },
                    { name: 'supportThreshold', type: 'uint32' },
                    { name: 'minParticipation', type: 'uint32' },
                    { name: 'minDuration', type: 'uint64' },
                    { name: 'minProposerVotingPower', type: 'uint256' },
                ],
            },
        ],
    },
});

