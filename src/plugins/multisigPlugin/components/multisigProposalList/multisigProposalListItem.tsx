import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';
import { type IMultisigProposal } from '../../types';
import { multisigProposalUtils } from '../../utils/multisigProposalUtils';

export interface IMultisigProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: IMultisigProposal;
    /**
     * URL of the DAO for this proposal.
     */
    daoUrl: string;
    /**
     * Plugin of the proposal.
     */
    plugin: IDaoPlugin;
}

export const MultisigProposalListItem: React.FC<IMultisigProposalListItemProps> = (props) => {
    const { proposal, daoUrl, plugin } = props;

    const vote = useUserVote({ proposal });

    const proposalDate = (proposal.executed.blockTimestamp ?? proposal.endDate) * 1000;

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin);

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposalDate}
            href={`${daoUrl}/proposals/${slug}`}
            status={multisigProposalUtils.getProposalStatus(proposal)}
            voted={vote != null}
            publisher={{
                address: proposal.creator.address,
                name: proposal.creator.ens ?? undefined,
                link: `members/${proposal.creator.address}`,
            }}
            id={slug}
        />
    );
};
