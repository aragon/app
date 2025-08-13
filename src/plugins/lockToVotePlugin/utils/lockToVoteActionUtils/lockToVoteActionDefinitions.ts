import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { formatUnits } from 'viem';
import type { ILockToVoteActionChangeSettings, ILockToVotePluginSettings } from '../../types';
import { LockToVoteProposalActionType } from '../../types/enums';

export const defaultUpdateSettings = ({
    address,
    settings,
}: IDaoPlugin<ILockToVotePluginSettings>): ILockToVoteActionChangeSettings => ({
    type: LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS,
    from: '',
    to: address,
    data: '0x',
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
        contract: '',
        parameters: [
            {
                name: '_votingSettings',
                type: 'tuple',
                notice: 'The new voting settings',
                value: '',
                components: [
                    { name: 'votingMode', type: 'uint8' },
                    { name: 'supportThresholdRatio', type: 'uint32' },
                    { name: 'minParticipationRatio', type: 'uint32' },
                    { name: 'minApprovalRatio', type: 'uint32' },
                    { name: 'proposalDuration', type: 'uint64' },
                    { name: 'minProposerVotingPower', type: 'uint256' },
                ],
            },
        ],
    },
});
