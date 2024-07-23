import { ProposalDataListItem } from '@aragon/ods';
import type { ITokenProposal } from '../../types';

export interface ITokenProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ITokenProposal;
    /**
     * ID of the DAO for this proposa.
     */
    daoId: string;
}

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            // TODO: provide the correct status (APP-3393)
            status="draft"
            type="majorityVoting"
            // TODO: provide the corrct voted status (APP-3394)
            voted={true}
            publisher={{
                address: proposal.creatorAddress,
                link: `members/${proposal.creatorAddress}`,
            }}
            // TODO: add winning option (APP-3373)
            result={{
                option: 'yes',
                voteAmount: '100k wAnt',
                votePercentage: 15,
            }}
        />
    );
};
