import { useTranslations } from '@/shared/components/translationsProvider';
import { type ISppProposal, SppProposalType } from '../../types';
import { sppProposalUtils } from '../../utils/sppProposalUtils';

export interface ISppVotingTerminalMultiBodySummaryDefaultProps {
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
     * Defines if the voting is optimistic or not.
     */
    isOptimistic: boolean;
    /**
     * Flag indicating if the user can vote (proposal is in the Active state).
     */
    canVote: boolean;
}

export const SppVotingTerminalMultiBodySummaryDefault: React.FC<ISppVotingTerminalMultiBodySummaryDefaultProps> = (
    props,
) => {
    const { proposal, externalAddress, stageIndex, canVote, isOptimistic } = props;
    const { t } = useTranslations();

    const result = sppProposalUtils.getBodyResult(proposal, externalAddress, stageIndex);
    const voted = !!result?.resultType;

    const statusLabelContext = voted ? 'voted' : canVote ? 'vote' : 'expired';
    const statusText = `${statusLabelContext}.${isOptimistic ? 'veto' : 'approve'}`;
    const statusClass = voted
        ? result.resultType === SppProposalType.VETO
            ? 'text-critical-800'
            : 'text-success-800'
        : 'text-neutral-500';

    return (
        <p>
            {t('app.plugins.spp.sppVotingTerminalMultiBodySummaryDefault.name')}{' '}
            <span className={statusClass}>
                {t(`app.plugins.spp.sppVotingTerminalMultiBodySummaryDefault.${statusText}`)}
            </span>
        </p>
    );
};
