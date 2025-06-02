import type { IDaoProposalListDefaultItemProps } from '@/modules/governance/components/daoProposalList';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import { type ISppProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export interface ISppProposalListItemProps extends IDaoProposalListDefaultItemProps<ISppProposal> {}

export const SppProposalListItem: React.FC<ISppProposalListItemProps> = (props) => {
    const { proposal, dao, proposalSlug } = props;
    const { id, title, summary, stageIndex, settings, executed, creator } = proposal;

    const { t } = useTranslations();

    const currentStage = sppProposalUtils.getCurrentStage(proposal);

    const proposalDate = executed.blockTimestamp
        ? executed.blockTimestamp * 1000
        : sppStageUtils.getStageEndDate(proposal, currentStage)?.toMillis();

    const proposalStatus = sppProposalUtils.getProposalStatus(proposal);

    const defaultStageName = t('app.plugins.spp.sppProposalListItem.stage', { stageIndex: stageIndex + 1 });
    const statusContext = settings.stages.length > 1 ? (currentStage.name ?? defaultStageName) : undefined;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={id}
            title={title}
            summary={summary}
            date={proposalDate}
            href={daoUtils.getDaoUrl(dao, `proposals/${proposalSlug}`)}
            status={proposalStatus}
            statusContext={statusContext}
            publisher={{
                address: creator.address,
                name: creator.ens ?? undefined,
                link: `members/${creator.address}`,
            }}
        />
    );
};
