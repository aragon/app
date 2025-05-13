import type { IProposal } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ProposalDataListItem, type ProposalStatus } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { proposalUtils } from '../../utils/proposalUtils';

export interface IDaoProposalListDefaultItemProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Proposal to display.
     */
    proposal: IProposal;
}

export const DaoProposalListDefaultItem: React.FC<IDaoProposalListDefaultItemProps> = (props) => {
    const { proposal, daoId } = props;

    const {
        id,
        title,
        summary,
        executed,
        endDate,
        creator,
        pluginSubdomain: pluginId,
        pluginAddress,
        incrementalId,
    } = proposal;

    const slotId = GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS;
    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({ params: proposal, slotId, pluginId })!;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const plugin = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(incrementalId, plugin?.meta);

    const proposalDate = (executed.blockTimestamp ?? endDate) * 1000;
    const processedEndDate = proposalDate === 0 ? undefined : proposalDate;
    const proposalHref = daoUtils.getDaoUrl(dao, `proposals/${slug}`);

    const publisherHref = daoUtils.getDaoUrl(dao, `members/${creator.address}`);
    const publisherName = creator.ens ?? undefined;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            status={proposalStatus}
            key={id}
            title={title}
            summary={summary}
            date={processedEndDate}
            href={proposalHref}
            publisher={{ address: creator.address, link: publisherHref, name: publisherName }}
            id={slug}
        />
    );
};
