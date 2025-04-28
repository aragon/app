import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, type AvatarIconVariant, IconType, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ISppProposal, SppProposalType } from '../../types';
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
     * Index of the stage on which external body is located.
     */
    stageIndex: number;
    /**
     * Defines if the proposal is optimistic.
     */
    isVeto?: boolean;
    /**
     * Flag indicating if the user can vote (proposal is in the Active state).
     */
    canVote: boolean;
    /**
     * Additional children to render.
     */
    children: React.ReactNode;
}

// Just an internal type to help with the mapping external voting result to UI properties.
type BreakdownStatus = 'neutral' | 'success' | 'failure';

const breakdownStatusToIcon = new Map<BreakdownStatus, { icon: IconType; variant: AvatarIconVariant } | undefined>([
    ['success', { icon: IconType.CHECKMARK, variant: 'success' }],
    ['failure', { icon: IconType.CLOSE, variant: 'critical' }],
]);

export const SppVotingTerminalBodyBreakdownDefault: React.FC<ISppVotingTerminalBodyBreakdownDefaultProps> = (props) => {
    const { proposal, externalAddress, stageIndex, isVeto, canVote, children } = props;
    const { t } = useTranslations();

    const result = sppProposalUtils.getBodyResult(proposal, externalAddress, stageIndex);
    const voted = result?.resultType != null;
    const breakdownStatusStyle: BreakdownStatus = voted
        ? result.resultType === SppProposalType.VETO
            ? 'failure'
            : 'success'
        : 'neutral';

    const statusLabelColor =
        breakdownStatusStyle === 'success'
            ? 'text-success-800'
            : breakdownStatusStyle === 'failure'
              ? 'text-critical-800'
              : 'text-neutral-500';
    const statusIcon = breakdownStatusToIcon.get(breakdownStatusStyle);

    const statusLabelContext = voted ? 'voted' : canVote ? 'vote' : 'expired';
    const statusLabel = `${statusLabelContext}.${isVeto ? 'veto' : 'approve'}`;

    return (
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
            <div
                className={classNames(
                    'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral-sm md:px-6 md:py-5',
                    'flex w-full min-w-fit flex-row justify-between gap-2',
                    statusLabelColor,
                )}
            >
                {t(`app.plugins.spp.sppVotingTerminalBodyBreakdownDefault.${statusLabel}`)}
                {statusIcon && <AvatarIcon icon={statusIcon.icon} variant={statusIcon.variant} />}
            </div>
            {children}
        </Tabs.Content>
    );
};
