'use client';

import {
    formatterUtils,
    NumberFormat,
    Progress,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal?: ITokenProposal;
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

export const TokenProposalVotingSummary: React.FC<
    ITokenProposalVotingSummaryProps
> = (props) => {
    const { proposal, name, isVeto, isExecuted } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return (
            <p className="text-base leading-tight font-normal text-surface-primary md:text-lg">
                {name}
            </p>
        );
    }

    const { supportThreshold } = proposal.settings;
    const { symbol } = proposal.settings.token;

    const status = tokenProposalUtils.getProposalStatus(proposal);

    const yesVotes = Number(
        tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES),
    );
    const noVotes = Number(
        tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO),
    );

    const countableTotalVotes = yesVotes + noVotes;
    const formattedCountableTotalVotes = formatterUtils.formatNumber(
        countableTotalVotes,
        { format: NumberFormat.GENERIC_SHORT },
    );

    const supportPercentage =
        countableTotalVotes > 0 ? (yesVotes / countableTotalVotes) * 100 : 0;
    const formattedYesVotes = formatterUtils.formatNumber(yesVotes, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const supportThresholdPercentage =
        tokenSettingsUtils.ratioToPercentage(supportThreshold);

    const isSupportReached = tokenProposalUtils.isSupportReached(proposal);
    const isApprovalReached = tokenProposalUtils.isApprovalReached(proposal);

    if (status !== ProposalStatus.ACTIVE || isExecuted) {
        const approvalText = isApprovalReached ? 'approved' : 'notApproved';
        const vetoText = isApprovalReached ? 'vetoed' : 'notVetoed';
        const statusText = isVeto ? vetoText : approvalText;

        const statusClass =
            isApprovalReached && isVeto
                ? 'text-critical-primary'
                : isApprovalReached
                  ? 'text-success-primary'
                  : 'text-surface-secondary';

        return (
            <p className="text-base leading-tight font-normal text-surface-primary md:text-lg">
                {name}{' '}
                <span className={statusClass}>
                    {t(
                        `app.plugins.token.tokenProposalVotingSummary.${statusText}`,
                    )}
                </span>
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="text-base leading-tight font-normal text-surface-primary md:text-lg">
                {name}{' '}
                <span className="text-surface-secondary">
                    {isVeto
                        ? t(
                              'app.plugins.token.tokenProposalVotingSummary.optimisticSupportLabel',
                          )
                        : t(
                              'app.plugins.token.tokenProposalVotingSummary.supportLabel',
                          )}
                </span>
            </p>
            <Progress
                thresholdIndicator={supportThresholdPercentage}
                value={supportPercentage}
                variant={isSupportReached ? 'primary' : 'neutral'}
            />
            <p className="text-sm leading-tight font-normal text-surface-primary md:text-base">
                {formattedYesVotes}{' '}
                <span className="text-surface-secondary">
                    {t(
                        'app.plugins.token.tokenProposalVotingSummary.votesDescription',
                        {
                            details: `${formattedCountableTotalVotes} ${symbol}`,
                        },
                    )}
                </span>
            </p>
        </div>
    );
};
