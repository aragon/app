import type { IProposal } from '@/modules/governance/api/governanceService';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ProposalDataListItem, type ProposalStatus } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '../../constants/moduleSlots';

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

    const { id, title, summary, executed, endDate, creator, pluginSubdomain: pluginId } = proposal;

    const slotId = GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS;
    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({ params: proposal, slotId, pluginId })!;

    const proposalDate = (executed.blockTimestamp ? executed.blockTimestamp : endDate) * 1000;
    const processedEndDate = proposalDate === 0 ? undefined : proposalDate;
    const proposalHref = `/dao/${daoId}/proposals/${id}`;

    const publisherHref = `/dao/${daoId}/members/${creator.address}`;
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
        />
    );
};
