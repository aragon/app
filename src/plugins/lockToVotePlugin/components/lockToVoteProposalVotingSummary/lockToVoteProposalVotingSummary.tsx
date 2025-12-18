'use client';

import { formatterUtils, invariant, NumberFormat, Progress, ProposalStatus } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { VoteOption } from '../../../tokenPlugin/types';
import { tokenSettingsUtils } from '../../../tokenPlugin/utils/tokenSettingsUtils';
import type { ILockToVoteProposal } from '../../types';
import { lockToVoteProposalUtils } from '../../utils/lockToVoteProposalUtils';

export interface ILockToVoteProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal?: ILockToVoteProposal;
    /**
     * Name of the plugin.
     */
    name: string;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto: boolean;
    /**
     * Additional executed status when plugin is a sub-plugin.
     */
    isExecuted?: boolean;
}

export const LockToVoteProposalVotingSummary: React.FC<ILockToVoteProposalVotingSummaryProps> = (props) => {
    const { proposal, name, isVeto, isExecuted } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">{name}</p>;
    }

    const { supportThreshold, historicalTotalSupply } = proposal.settings;
    const { symbol, decimals } = proposal.settings.token;

    const status = lockToVoteProposalUtils.getProposalStatus(proposal);

    const yesVotes = Number(lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.YES));
    const noVotes = Number(lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.NO));
    const abstainVotes = Number(lockToVoteProposalUtils.getOptionVotingPower(proposal, VoteOption.ABSTAIN));

    const tokenTotalSupply = formatUnits(BigInt(historicalTotalSupply!), decimals);
    const totalSupplyNumber = Number(tokenTotalSupply);

    invariant(totalSupplyNumber > 0, 'LockToVoteProposalVotingSummary: tokenTotalSupply must be a positive number');

    const totalVotes = yesVotes + noVotes + abstainVotes;
    const formattedTotalVotes = formatterUtils.formatNumber(totalVotes, { format: NumberFormat.GENERIC_SHORT })!;

    const winningOption = Math.max(yesVotes, noVotes, abstainVotes);
    const winningOptionPercentage = totalVotes > 0 ? (winningOption / totalVotes) * 100 : 0;
    const formattedWinningOption = formatterUtils.formatNumber(winningOption, { format: NumberFormat.GENERIC_SHORT });

    const supportThresholdPercentage = tokenSettingsUtils.ratioToPercentage(supportThreshold);
    const supportReached = winningOptionPercentage >= supportThresholdPercentage;

    const isApprovalReached = lockToVoteProposalUtils.isApprovalReached(proposal);

    if (status !== ProposalStatus.ACTIVE || isExecuted) {
        const approvalText = isApprovalReached ? 'approved' : 'notApproved';
        const vetoText = isApprovalReached ? 'vetoed' : 'notVetoed';
        const statusText = isVeto ? vetoText : approvalText;

        const statusClass = isApprovalReached && isVeto ? 'text-critical-800' : isApprovalReached ? 'text-success-800' : 'text-neutral-500';

        return (
            <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                {name} <span className={statusClass}>{t(`app.plugins.lockToVote.lockToVoteProposalVotingSummary.${statusText}`)}</span>
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                {name}{' '}
                <span className="text-neutral-500">
                    {isVeto
                        ? t('app.plugins.lockToVote.lockToVoteProposalVotingSummary.optimisticSupportLabel')
                        : t('app.plugins.lockToVote.lockToVoteProposalVotingSummary.supportLabel')}
                </span>
            </p>
            <Progress
                thresholdIndicator={supportThresholdPercentage}
                value={winningOptionPercentage}
                variant={supportReached ? 'primary' : 'neutral'}
            />
            <p className="font-normal text-neutral-800 text-sm leading-tight md:text-base">
                {formattedWinningOption}{' '}
                <span className="text-neutral-500">
                    {t('app.plugins.lockToVote.lockToVoteProposalVotingSummary.votesDescription', {
                        details: `${formattedTotalVotes} ${symbol}`,
                    })}
                </span>
            </p>
        </div>
    );
};
