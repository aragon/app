import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, type AvatarIconVariant, IconType, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface ISppVotingTerminalBodyBreakdownDefaultProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ISppProposal;
    /**
     * Address of the body.
     */
    body: string;
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

const statusToIcon: Record<string, { icon: IconType; variant: AvatarIconVariant } | undefined> = {
    success: { icon: IconType.CHECKMARK, variant: 'success' },
    failure: { icon: IconType.CLOSE, variant: 'critical' },
};

export const SppVotingTerminalBodyBreakdownDefault: React.FC<ISppVotingTerminalBodyBreakdownDefaultProps> = (props) => {
    const { proposal, body, stage, canVote, children } = props;

    const { t } = useTranslations();

    const { status, label, style } = sppProposalUtils.getBodyResultStatus({ proposal, body, stage, canVote });
    const statusIcon = statusToIcon[status];

    return (
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
            <div
                className={classNames(
                    'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral-sm md:px-6 md:py-5',
                    'flex w-full min-w-fit flex-row justify-between gap-2',
                    style,
                )}
            >
                {t(label)}
                {statusIcon != null && <AvatarIcon icon={statusIcon.icon} variant={statusIcon.variant} />}
            </div>
            {children}
        </Tabs.Content>
    );
};
