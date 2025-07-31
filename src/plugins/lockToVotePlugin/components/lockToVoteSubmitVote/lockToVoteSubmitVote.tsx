'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import type { ISubmitVoteProps } from '@/modules/governance/types';
import { TokenSubmitVote } from '@/plugins/tokenPlugin/components/tokenSubmitVote';
import { VoteOption, type ITokenProposal } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { VoteIndicator } from '@aragon/gov-ui-kit';
import { erc20Abi, type Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVoteSubmitVoteFeedbackDialogParams } from '../../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import type { ILockToVotePlugin } from '../../types';

export interface ILockToVoteSubmitVoteProps extends ISubmitVoteProps<ITokenProposal> {}

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const LockToVoteSubmitVote: React.FC<ILockToVoteSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network, settings } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useAccount();

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })![0];
    const { id: chainId } = networkDefinitions[network];

    const { data: tokenBalance } = useReadContract({
        abi: erc20Abi,
        address: settings.token.address as Hex,
        chainId,
        functionName: 'balanceOf',
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const openVoteDialog = (option?: string) => {
        const voteLabel = voteOptionToIndicator[option ?? ''];
        const voteLabelDescription =
            voteLabel === 'abstain'
                ? undefined
                : t(`app.plugins.token.tokenSubmitVote.voteDescription.${isVeto ? 'veto' : 'approve'}`);
        const vote = { value: Number(option), label: voteLabel, labelDescription: voteLabelDescription };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto, plugin };

        open(GovernanceDialogId.VOTE, { params });
    };

    const openVoteFeedbackDialog = () => {
        const { lockManagerAddress } = plugin as ILockToVotePlugin;
        const params: ILockToVoteSubmitVoteFeedbackDialogParams = {
            lockManagerAddress,
            network,
            onVoteClick: openVoteDialog,
        };
        open(LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK, { params });
    };

    const handleSubmitVote = (option?: string) => {
        if (tokenBalance != null && tokenBalance > 0) {
            openVoteFeedbackDialog();
        } else {
            openVoteDialog(option);
        }
    };

    return <TokenSubmitVote {...props} onSubmitVoteClick={handleSubmitVote} submitNamespace="update" />;
};
