import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SppStageStatus } from '@/plugins/sppPlugin/components/sppStageStatus';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import {
    proposalStatusToVotingStatus,
    ProposalVoting,
    ProposalVotingStatus,
    ProposalVotingTab,
} from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { SppVotingTerminalBodyContent } from './sppVotingTerminalBodyContent';
import { SppVotingTerminalBodySummaryFooter } from './sppVotingTerminalBodySummaryFooter';
import { SppVotingTerminalMultiBodySummaryDefault } from './sppVotingTerminalMultiBodySummaryDefault';
import { SppVotingTerminalStageTimelock } from './sppVotingTerminalStageTimelock';

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
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
}

export const SppVotingTerminalStage: React.FC<IProposalVotingTerminalStageProps> = (props) => {
    const { stage, daoId, proposal } = props;

    const processedStartDate = sppStageUtils.getStageStartDate(proposal, stage)?.toMillis();
    const processedEndDate = sppStageUtils.getStageEndDate(proposal, stage)?.toMillis();

    // Keep stage status updated for statuses that are time dependent
    const { ACTIVE, PENDING, ACCEPTED, UNREACHED } = ProposalVotingStatus;
    const enableDynamicValue = [ACTIVE, PENDING, ACCEPTED].includes(sppStageUtils.getStageStatus(proposal, stage));
    const stageStatus = useDynamicValue({
        callback: () => sppStageUtils.getStageStatus(proposal, stage),
        enabled: enableDynamicValue,
    });

    const processedStageStatus = stageStatus === UNREACHED ? stageStatus : proposalStatusToVotingStatus[stageStatus];
    const bodyList = stage.plugins.map((plugin) => plugin.address);

    const isMultiStage = proposal.settings.stages.length > 1;
    const isSingleBody = bodyList.length === 1;

    const canVote = processedStageStatus === ProposalVotingStatus.ACTIVE;

    const isVeto = sppStageUtils.isVeto(stage);
    const isTimelockStage = !stage.plugins.length;

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={processedStageStatus}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={stage.stageIndex}
            isMultiStage={isMultiStage}
            bodyList={bodyList}
        >
            <ProposalVoting.BodySummary>
                <ProposalVoting.BodySummaryList>
                    {stage.plugins.map((plugin) => (
                        <ProposalVoting.BodySummaryListItem key={plugin.address} id={plugin.address}>
                            <PluginSingleComponent
                                slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY}
                                pluginId={plugin.subdomain ?? 'external'}
                                proposal={
                                    plugin.subdomain
                                        ? sppStageUtils.getBodySubProposal(proposal, plugin.address, stage.stageIndex)
                                        : proposal
                                }
                                isExecuted={proposal.executed.status}
                                name={plugin.subdomain && plugin.name}
                                isOptimistic={isVeto}
                                canVote={canVote}
                                stage={stage}
                                externalAddress={plugin.subdomain ? undefined : plugin.address}
                                Fallback={SppVotingTerminalMultiBodySummaryDefault}
                            />
                        </ProposalVoting.BodySummaryListItem>
                    ))}
                </ProposalVoting.BodySummaryList>
                {isTimelockStage && <SppVotingTerminalStageTimelock stage={stage} proposal={proposal} />}
                <SppVotingTerminalBodySummaryFooter proposal={proposal} stage={stage} daoId={daoId} />
            </ProposalVoting.BodySummary>
            {stage.plugins.map((plugin) => (
                <ProposalVoting.BodyContent
                    name={plugin.subdomain && plugin.name}
                    key={plugin.address}
                    status={processedStageStatus}
                    bodyId={plugin.address}
                    hideTabs={!plugin.subdomain ? [ProposalVotingTab.VOTES] : undefined}
                >
                    <SppVotingTerminalBodyContent
                        plugin={plugin}
                        daoId={daoId}
                        subProposal={sppStageUtils.getBodySubProposal(proposal, plugin.address, stage.stageIndex)}
                        proposal={proposal}
                        canVote={canVote}
                        isVeto={isVeto}
                        stage={stage}
                    >
                        {isSingleBody && <SppStageStatus proposal={proposal} stage={stage} daoId={daoId} />}
                    </SppVotingTerminalBodyContent>
                </ProposalVoting.BodyContent>
            ))}
        </ProposalVoting.Stage>
    );
};
