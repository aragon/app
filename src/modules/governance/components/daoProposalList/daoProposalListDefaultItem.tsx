import type { IProposal } from '@/modules/governance/api/governanceService';
import { type IDao } from '@/shared/api/daoService';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ProposalDataListItem, type ProposalStatus } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useUserVote } from '../../hooks/useUserVote';

export interface IDaoProposalListDefaultItemProps<TProposal extends IProposal = IProposal> {
    /**
     * DAO related to the proposal
     */
    dao: IDao;
    /**
     * Proposal to display.
     */
    proposal: TProposal;
    /**
     * Slug of the proposal.
     */
    proposalSlug: string;
}

export const DaoProposalListDefaultItem: React.FC<IDaoProposalListDefaultItemProps> = (props) => {
    const { proposal, dao, proposalSlug } = props;

    const { id, title, summary, executed, endDate, creator, pluginSubdomain: pluginId } = proposal;

    const userVote = useUserVote({ proposal, network: dao.network });

    const slotId = GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS;
    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({ params: proposal, slotId, pluginId })!;

    const proposalDate = (executed.blockTimestamp ?? endDate) * 1000;
    const processedEndDate = proposalDate === 0 ? undefined : proposalDate;
    const proposalHref = daoUtils.getDaoUrl(dao, `proposals/${proposalSlug}`);

    const publisherHref = daoUtils.getDaoUrl(dao, `members/${creator.address}`);
    const publisherName = creator.ens ?? undefined;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            id={proposalSlug}
            status={proposalStatus}
            key={id}
            title={title}
            summary={summary}
            date={processedEndDate}
            href={proposalHref}
            voted={userVote != null}
            publisher={{ address: creator.address, link: publisherHref, name: publisherName }}
        />
    );
};
