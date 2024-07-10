import { ProposalDataListItem } from '@aragon/ods';
import { type IMultisigProposal } from '../../types';

export interface IMultisigProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: IMultisigProposal;
}

export const MultisigProposalListItem: React.FC<IMultisigProposalListItemProps> = (props) => {
    const { proposal } = props;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.endDate * 1000}
            // TODO: provide the correct status (APP-3393)
            status="draft"
            type="approvalThreshold"
            // TODO: provide the corrct voted status (APP-3394)
            voted={true}
            publisher={{
                address: proposal.creatorAddress,
                link: `members/${proposal.creatorAddress}`,
            }}
            // TODO: add winning option (APP-3373)
            result={{
                approvalAmount: 10,
                approvalThreshold: 20,
            }}
        />
    );
};
