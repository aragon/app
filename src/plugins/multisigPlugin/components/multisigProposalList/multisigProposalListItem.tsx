import { useVotedStatus } from '@/modules/governance/hooks/useVotedStatus';
import { ProposalDataListItem } from '@aragon/ods';
import { useAccount } from 'wagmi';
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

    const { address } = useAccount();

    const { voted } = useVotedStatus({ proposalId: proposal.id, address });

    console.log('MultisigProposalListItem', proposal);
    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.executed.blockTimestamp ? proposal.executed.blockTimestamp * 1000 : proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={multisigProposalUtils.getProposalStatus(proposal)}
            type="approvalThreshold"
            voted={voted}
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
