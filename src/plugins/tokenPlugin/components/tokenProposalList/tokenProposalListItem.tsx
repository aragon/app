import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { ProposalDataListItem } from '@aragon/gov-ui-kit';
import { type ITokenProposal } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';

export interface ITokenProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ITokenProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    const vote = useUserVote({ proposal });

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.executed.blockTimestamp ? proposal.executed.blockTimestamp * 1000 : proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={tokenProposalUtils.getProposalStatus(proposal)}
            type="majorityVoting"
            voted={vote != null}
            publisher={{
                address: proposal.creator.address,
                link: `members/${proposal.creator.address}`,
                name: proposal.creator.ens ?? undefined,
            }}
        />
    );
};
