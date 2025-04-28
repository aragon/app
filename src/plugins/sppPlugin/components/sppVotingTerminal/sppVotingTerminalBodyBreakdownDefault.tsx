import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, type AvatarIconVariant, IconType, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ISppProposal, type ISppStage, SppProposalType } from '../../types';
import { sppProposalUtils } from '../../utils/sppProposalUtils';
import { sppStageUtils } from '../../utils/sppStageUtils';

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

// Just an internal type to help with the mapping external voting result to UI properties.
type BreakdownStatus = 'neutral' | 'success' | 'failure';

const statusToStyle: Record<BreakdownStatus, { icon?: IconType; variant?: AvatarIconVariant; label: string }> = {
    success: { icon: IconType.CHECKMARK, variant: 'success', label: 'text-success-800' },
    failure: { icon: IconType.CLOSE, variant: 'critical', label: 'text-critical-800' },
    neutral: { label: 'text-neutral-500' },
};

export const SppVotingTerminalBodyBreakdownDefault: React.FC<ISppVotingTerminalBodyBreakdownDefaultProps> = (props) => {
    const { proposal, externalAddress, stage, canVote, children } = props;

    const { t } = useTranslations();
    const { resultType } = sppProposalUtils.getBodyResult(proposal, externalAddress, stage.stageIndex) ?? {};

    const voted = resultType != null;
    const isVeto = sppStageUtils.isVeto(stage);

    const status = voted ? (resultType === SppProposalType.VETO ? 'failure' : 'success') : 'neutral';
    const statusStyle = statusToStyle[status];

    const statusLabelContext = voted ? 'voted' : canVote ? 'vote' : 'expired';
    const statusLabel = `${statusLabelContext}.${isVeto ? 'veto' : 'approve'}`;

    return (
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
            <div
                className={classNames(
                    'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral-sm md:px-6 md:py-5',
                    'flex w-full min-w-fit flex-row justify-between gap-2',
                    statusStyle.label,
                )}
            >
                {t(`app.plugins.spp.sppVotingTerminalBodyBreakdownDefault.${statusLabel}`)}
                {statusStyle.icon != null && <AvatarIcon icon={statusStyle.icon} variant={statusStyle.variant} />}
            </div>
            {children}
        </Tabs.Content>
    );
};
