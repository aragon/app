'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogOption, IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import type { ISubmitVoteProps } from '@/modules/governance/types';
import { TokenSubmitVote } from '@/plugins/tokenPlugin/components/tokenSubmitVote';
import { VoteOption, type ITokenProposal } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { VoteIndicator } from '@aragon/gov-ui-kit';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVoteSubmitVoteFeedbackDialogParams } from '../../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { useLockToVoteData } from '../../hooks/useLockToVoteData';
import type { ILockToVotePlugin } from '../../types';
import type { ILockToVoteOption } from '../../utils/lockToVoteTransactionUtils';

export interface ILockToVoteSubmitVoteProps extends ISubmitVoteProps<ITokenProposal> {}

interface ILockToVoteOptionVoteDialog extends IVoteDialogOption, ILockToVoteOption {}

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const LockToVoteSubmitVote: React.FC<ILockToVoteSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const plugins = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress, includeSubPlugins: true })!;
    const plugin = plugins[0].meta as ILockToVotePlugin;

    const { balance, allowance, approveTokens } = useLockToVoteData({ plugin, daoId });

    const openVoteDialog = (option?: string, lockAmount?: bigint) => {
        const voteLabel = voteOptionToIndicator[option ?? ''];
        const voteDescription = t(`app.plugins.lockToVote.lockToVoteSubmitVote.${isVeto ? 'veto' : 'approve'}`);
        const labelDescription = voteLabel === 'abstain' ? undefined : voteDescription;

        const vote = { value: Number(option), lockAmount, label: voteLabel, labelDescription };

        const params: IVoteDialogParams<number, ILockToVoteOptionVoteDialog> = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
            target: plugin.lockManagerAddress,
        };

        open(GovernanceDialogId.VOTE, { params });
    };

    const handleLockAndVote = (option?: string) => (lockAmount?: bigint) => {
        if (lockAmount != null && lockAmount > allowance) {
            approveTokens(lockAmount, () => openVoteDialog(option, lockAmount));
        } else {
            openVoteDialog(option, lockAmount);
        }
    };

    const openVoteFeedbackDialog = (option?: string) => {
        const onVoteClick = handleLockAndVote(option);
        const params: ILockToVoteSubmitVoteFeedbackDialogParams = { plugin, daoId, onVoteClick };
        open(LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK, { params });
    };

    const handleSubmitVote = (option?: string) => {
        if (balance != null && balance > 0) {
            openVoteFeedbackDialog(option);
        } else {
            openVoteDialog(option);
        }
    };

    return <TokenSubmitVote {...props} onSubmitVoteClick={handleSubmitVote} submitNamespace="update" />;
};
