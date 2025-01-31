import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';
import { type ISppProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export interface ISppProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
    /**
     * Plugin of the proposal.
     */
    plugin: IDaoPlugin;
}

export const SppProposalListItem: React.FC<ISppProposalListItemProps> = (props) => {
    const { proposal, daoId, plugin } = props;
    const { stageIndex, settings, executed } = proposal;

    const { t } = useTranslations();

    const currentStage = sppProposalUtils.getCurrentStage(proposal);

    const proposalDate = executed.blockTimestamp
        ? executed.blockTimestamp * 1000
        : sppStageUtils.getStageEndDate(proposal, currentStage)?.toMillis();

    const proposalStatus = sppProposalUtils.getProposalStatus(proposal);

    const defaultStageName = t('app.plugins.spp.sppProposalListItem.stage', { stageIndex: stageIndex + 1 });
    const statusContext = settings.stages.length > 1 ? (currentStage.name ?? defaultStageName) : undefined;

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin).toLowerCase();

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposalDate}
            href={`/dao/${daoId}/proposals/${slug}`}
            status={proposalStatus}
            statusContext={statusContext}
            publisher={{
                address: proposal.creator.address,
                name: proposal.creator.ens ?? undefined,
                link: `members/${proposal.creator.address}`,
            }}
        />
    );
};
