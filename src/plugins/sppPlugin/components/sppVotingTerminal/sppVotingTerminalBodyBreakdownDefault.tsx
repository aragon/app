import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ISppProposal, type ISppStage } from '../../types';
import { sppProposalUtils } from '../../utils/sppProposalUtils';

export interface ISppVotingTerminalBodyBreakdownDefaultProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ISppProposal;
    /**
     * External body address.
     */
    externalAddress: string;
    /**
     * Stage on which the body is setup.
     */
    stage: ISppStage;
    /**
     * Flag indicating if the user can vote (proposal is in the Active state).
     */
    canVote: boolean;
    /**
     * Additional children to render.
     */
    children: React.ReactNode;
}

export const SppVotingTerminalBodyBreakdownDefault: React.FC<ISppVotingTerminalBodyBreakdownDefaultProps> = (props) => {
    const { proposal, externalAddress, stage, canVote, children } = props;

    const { t } = useTranslations();
    const { statusStyle, statusLabel } = sppProposalUtils.getBodyStatusLabelData({
        proposal,
        externalAddress,
        stage,
        canVote,
        t,
    });

    return (
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
            <div
                className={classNames(
                    'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral-sm md:px-6 md:py-5',
                    'flex w-full min-w-fit flex-row justify-between gap-2',
                    statusStyle.label,
                )}
            >
                {statusLabel}
                {statusStyle.icon != null && <AvatarIcon icon={statusStyle.icon} variant={statusStyle.variant} />}
            </div>
            {children}
        </Tabs.Content>
    );
};
