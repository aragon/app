import { ProposalDataListItem, type ProposalStatus } from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDao } from '@/shared/api/daoService';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useUserVote } from '../../hooks/useUserVote';
import { proposalUtils } from '../../utils/proposalUtils';
import { ProposalMetadataAlert } from '../proposalMetadataAlert';

export interface IDaoProposalListDefaultItemProps<
    TProposal extends IProposal = IProposal,
> {
    /**
     * DAO related to the proposal
     */
    dao: IDao;
    /**
     * Proposal to display.
     */
    proposal: TProposal;
    /**
     * Slug of the proposal. Undefined when the proposal's plugin cannot be
     * resolved on the DAO (uninstalled or unsupported plugin), in which case the
     * item renders without a link.
     */
    proposalSlug?: string;
    /**
     * Optional tag displayed on the item. Unused on the DAO pages, where every
     * proposal belongs to the same DAO; the workspace proposal list uses it to
     * name the DAO a row comes from.
     */
    tag?: string;
    /**
     * URL the row links to. Unused on the DAO pages, which build it from the
     * DAO; the workspace proposal list passes the account-scoped workspace URL
     * so that a row keeps the reader inside the workspace.
     *
     * TODO: Investigate this when doing the overall refactor of the link generation
     * within the context of workspaces. A better approach might be to modify the
     * underlying `getProposalUrl` to accept a context parameter,
     * which would allow it to generate the correct URL based on whether it's being called
     * from a DAO page or a workspace page.
     */
    href?: string;
}

export const DaoProposalListDefaultItem: React.FC<
    IDaoProposalListDefaultItemProps
> = (props) => {
    const { proposal, dao, proposalSlug, tag, href } = props;

    const {
        id,
        summary,
        executed,
        endDate,
        creator,
        pluginInterfaceType: pluginId,
    } = proposal;

    const userVote = useUserVote({ proposal, network: dao.network });

    const slotId = GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS;
    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal,
        slotId,
        pluginId,
    })!;

    const proposalDate = (executed.blockTimestamp ?? endDate) * 1000;
    const processedEndDate = proposalDate === 0 ? undefined : proposalDate;

    const proposalHref = href ?? proposalUtils.getProposalUrl(proposal, dao);

    const publisherHref = daoUtils.getDaoUrl(dao, `members/${creator.address}`);
    const { data: publisherEnsName } = useEnsName(creator.address);
    const publisherName = publisherEnsName ?? undefined;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            date={processedEndDate}
            href={proposalHref}
            id={proposalSlug}
            key={id}
            publisher={{
                address: creator.address,
                link: publisherHref,
                name: publisherName,
            }}
            status={proposalStatus}
            summary={summary}
            tag={tag}
            title={proposal.title}
            voted={userVote != null}
        >
            <ProposalMetadataAlert proposal={proposal} />
        </ProposalDataListItem.Structure>
    );
};
