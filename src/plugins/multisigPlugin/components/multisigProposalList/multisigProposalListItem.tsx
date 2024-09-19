import { ProposalDataListItem } from '@aragon/ods';
import { type IMultisigProposal } from '../../types';
import { multisigProposalUtils } from '../../utils/multisigProposalUtils';

export interface IMultisigProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: IMultisigProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

export const MultisigProposalListItem: React.FC<IMultisigProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={multisigProposalUtils.getProposalStatus(proposal)}
            type="approvalThreshold"
            // TODO: provide the corrct voted status (APP-3394)
            voted={true}
            publisher={{
                address: proposal.creator.address,
                name: proposal.creator.ens ?? undefined,
                link: `members/${proposal.creator.address}`,
            }}
            result={{
                approvalAmount: proposal.metrics.totalVotes,
                approvalThreshold: proposal.settings.minApprovals,
            }}
        />
    );
};
