import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { ProposalDataListItem, proposalDataListItemUtils } from '@aragon/gov-ui-kit';
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
    const proposalStatus = sppProposalUtils.getProposalStatus(proposal);

    const isNotFinalStage = proposal.stageIndex !== proposal.settings.stages.length - 1;
    const isOngoing = proposalDataListItemUtils.isOngoingStatus(stageStatus);

    const getProcessStatus = () => {
        if (isNotFinalStage) {
            return stageStatus;
        }
        return proposalStatus;
    };

    const vote = useUserVote({ proposal: proposal.subProposals[proposal.stageIndex] });

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposalDate}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={getProcessStatus()}
            statusContext={
                isNotFinalStage && isOngoing ? proposal.settings.stages[proposal.stageIndex].name : undefined
            }
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
