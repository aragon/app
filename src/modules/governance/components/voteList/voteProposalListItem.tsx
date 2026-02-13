import {
    type VoteIndicator,
    VoteProposalDataListItem,
} from '@aragon/gov-ui-kit';
import type { IVote } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { proposalUtils } from '../../utils/proposalUtils';

export interface IVoteProposalListItemProps {
    /**
     * Relevant vote data.
     */
    vote: IVote;
    /**
     * Vote option.
     */
    voteIndicator: VoteIndicator;
    /**
     * ID of the DAO related to the votes.
     */
    daoId: string;
}

export const VoteProposalListItem: React.FC<IVoteProposalListItemProps> = (
    props,
) => {
    const { vote, daoId, voteIndicator } = props;

    const proposal = vote.parentProposal ?? vote.proposal!;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const slug = proposalUtils.getProposalSlug(proposal, dao);
    const proposalHref = proposalUtils.getProposalUrl(proposal, dao);

    return (
        <VoteProposalDataListItem.Structure
            date={vote.blockTimestamp * 1000}
            href={proposalHref}
            key={vote.transactionHash}
            proposalId={slug}
            proposalTitle={proposal.title}
            voteIndicator={voteIndicator}
        />
    );
};
