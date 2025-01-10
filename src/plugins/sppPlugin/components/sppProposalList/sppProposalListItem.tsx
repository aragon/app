import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import {
    ProposalDataListItem,
    proposalDataListItemUtils,
    ProposalStatus,
    votingStatusToProposalStatus,
} from '@aragon/gov-ui-kit';
import { type ISppProposal } from '../../types';

export interface ISppProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

export const SppProposalListItem: React.FC<ISppProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    const proposalDate =
        (proposal.executed.blockTimestamp ?? proposal.subProposals[proposal.stageIndex].endDate!) * 1000;

    const stageStatus = sppStageUtils.getStageStatus(proposal, proposal.settings.stages[proposal.stageIndex]);

    const isFinalStage = sppStageUtils.isFinalStage(proposal, proposal.settings.stages[proposal.stageIndex]);

    const processedStatus = isFinalStage
        ? sppProposalUtils.getProposalStatus(proposal)
        : votingStatusToProposalStatus[stageStatus];

    const isOngoing = proposalDataListItemUtils.isOngoingStatus(processedStatus);

    const vote = useUserVote({ proposal: proposal.subProposals[proposal.stageIndex] });

    const showStatusContext = !(isFinalStage && processedStatus !== ProposalStatus.ACTIVE) && isOngoing;

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposalDate}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={processedStatus}
            statusContext={showStatusContext ? proposal.settings.stages[proposal.stageIndex].name : undefined}
            type="approvalThreshold"
            voted={vote != null}
            publisher={{
                address: proposal.creator.address,
                name: proposal.creator.ens ?? undefined,
                link: `members/${proposal.creator.address}`,
            }}
        />
    );
};
