import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SppStageStatus } from '@/plugins/sppPlugin/components/sppStageStatus';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { proposalStatusToVotingStatus, ProposalVoting, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { SppProposalType, type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { SppVotingTerminalBodyContent } from './sppVotingTerminalBodyContent';
import { SppVotingTerminalBodySummaryFooter } from './sppVotingTerminalBodySummaryFooter';

export interface IProposalVotingTerminalStageProps {
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
    /**
     * Stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Sub proposals of the SPP stage.
     */
    subProposals?: ISppSubProposal[];
    /**
     * Index of the stage.
     */
    index: number;
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
}

export const SppVotingTerminalStage: React.FC<IProposalVotingTerminalStageProps> = (props) => {
    const { stage, daoId, subProposals, index, proposal } = props;

    const processedStartDate = sppStageUtils.getStageStartDate(proposal, stage)?.toMillis();
    const processedEndDate = sppStageUtils.getStageEndDate(proposal, stage)?.toMillis();

    // Keep stage status updated for statuses that are time dependent
    const { ACTIVE, PENDING, ACCEPTED } = ProposalVotingStatus;
    const enableDynamicValue = [ACTIVE, PENDING, ACCEPTED].includes(sppStageUtils.getStageStatus(proposal, stage));
    const stageStatus = useDynamicValue({
        callback: () => sppStageUtils.getStageStatus(proposal, stage),
        enabled: enableDynamicValue,
    });

    const processedStageStatus =
        stageStatus === ProposalVotingStatus.UNREACHED ? stageStatus : proposalStatusToVotingStatus[stageStatus];

    const isMultiStage = proposal.settings.stages.length > 1;

    const bodyList = stage.plugins.map((plugin) => plugin.address);

    const isSingleBody = bodyList.length === 1;

    const canVote = processedStageStatus === ProposalVotingStatus.ACTIVE;
    const isVeto = stage.plugins[0].proposalType === SppProposalType.VETO;

    const getBodySubProposal = (address: string) =>
        subProposals?.find((subProposal) => subProposal.pluginAddress === address);

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={processedStageStatus}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={isMultiStage}
            bodyList={bodyList}
        >
            <ProposalVoting.BodySummary>
                <ProposalVoting.BodySummaryList>
                    {stage.plugins.map((plugin) => (
                        <ProposalVoting.BodySummaryListItem key={plugin.address} id={plugin.address}>
                            <PluginSingleComponent
                                slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY}
                                pluginId={plugin.subdomain}
                                proposal={getBodySubProposal(plugin.address)}
                                isExecuted={proposal.executed.status}
                                name={plugin.name}
                                isOptimistic={isVeto}
                            />
                        </ProposalVoting.BodySummaryListItem>
                    ))}
                </ProposalVoting.BodySummaryList>
                <SppVotingTerminalBodySummaryFooter proposal={proposal} stage={stage} isVeto={isVeto} />
            </ProposalVoting.BodySummary>
            {stage.plugins.map((plugin) => (
                <ProposalVoting.BodyContent
                    name={plugin.name}
                    key={plugin.address}
                    status={processedStageStatus}
                    bodyId={plugin.address}
                >
                    <SppVotingTerminalBodyContent
                        plugin={plugin}
                        daoId={daoId}
                        subProposal={getBodySubProposal(plugin.address)}
                        proposal={proposal}
                        canVote={canVote}
                        isVeto={isVeto}
                    >
                        {isSingleBody && <SppStageStatus proposal={proposal} stage={stage} />}
                    </SppVotingTerminalBodyContent>
                </ProposalVoting.BodyContent>
            ))}
        </ProposalVoting.Stage>
    );
};
