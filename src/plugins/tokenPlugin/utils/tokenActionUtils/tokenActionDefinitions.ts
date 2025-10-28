import { type IDaoPlugin } from '@/shared/api/daoService';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { formatUnits } from 'viem';
import {
    TokenProposalActionType,
    type ITokenActionChangeSettings,
    type ITokenPluginSettings,
    type ITokenProposalAction,
} from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';

export const defaultMintAction = (settings: ITokenPluginSettings): ITokenProposalAction => ({
    type: TokenProposalActionType.MINT,
    from: '',
    to: settings.token.address,
    data: '',
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
    data: '',
    value: '0',
    proposedSettings: {
        ...settings,
        minParticipation: tokenSettingsUtils.ratioToPercentage(settings.minParticipation),
        supportThreshold: tokenSettingsUtils.ratioToPercentage(settings.supportThreshold),
        minProposerVotingPower: formatUnits(BigInt(settings.minProposerVotingPower), settings.token.decimals),
    },
    existingSettings: {
        ...settings,
        minParticipation: tokenSettingsUtils.ratioToPercentage(settings.minParticipation),
        supportThreshold: tokenSettingsUtils.ratioToPercentage(settings.supportThreshold),
        minProposerVotingPower: formatUnits(BigInt(settings.minProposerVotingPower), settings.token.decimals),
    },
    inputData: {
        function: 'updateVotingSettings',
        contract: PluginContractName.TOKEN_VOTING,
        parameters: [
            {
                name: '_votingSettings',
                type: 'tuple',
                notice: 'The new voting settings',
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
