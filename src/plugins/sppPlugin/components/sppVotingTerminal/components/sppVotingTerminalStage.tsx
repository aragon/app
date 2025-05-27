import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { ProposalStatus, ProposalVoting } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import type { ISppProposal, ISppStage } from '../../../types';
import { sppStageUtils } from '../../../utils/sppStageUtils';
import { SppVotingTerminalBodySummaryFooter } from './sppVotingTerminalBodySummaryFooter';
import { SppVotingTerminalMultiBodySummaryDefault } from './sppVotingTerminalMultiBodySummaryDefault';
import { SppVotingTerminalStageBodyContent } from './sppVotingTerminalStageBodyContent';
import { SppVotingTerminalStageTimelock } from './sppVotingTerminalStageTimelock';

export interface ISppVotingTerminalStageProps {
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

export const SppVotingTerminalStage: React.FC<ISppVotingTerminalStageProps> = (props) => {
    const { stage, daoId, proposal } = props;

    const processedStartDate = sppStageUtils.getStageStartDate(proposal, stage)?.toMillis();
    const processedEndDate = sppStageUtils.getStageEndDate(proposal, stage)?.toMillis();

    // Keep stage status and timings updated for statuses that are time dependent
    const { ACTIVE, PENDING, ACCEPTED, ADVANCEABLE } = ProposalStatus;

    const getStageDetails = useCallback(() => {
        const status = sppStageUtils.getStageStatus(proposal, stage);
        const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)?.toMillis();
        const maxAdvance = sppStageUtils.getStageMaxAdvance(proposal, stage)?.toMillis();

        return { status, minAdvance, maxAdvance };
    }, [proposal, stage]);

    const { status, minAdvance, maxAdvance } = useDynamicValue({
        enabled: [ACTIVE, PENDING, ACCEPTED, ADVANCEABLE].includes(sppStageUtils.getStageStatus(proposal, stage)),
        callback: getStageDetails,
    });

    const stageName = stage.name ?? stage.stageIndex.toString();
    const bodyList = stage.plugins.map((plugin) => plugin.address);
    const canVote = status === ProposalStatus.ACTIVE;

    const isSingleBody = bodyList.length === 1;
    const isVeto = sppStageUtils.isVeto(stage);
    const isTimelockStage = !stage.plugins.length;

    return (
        <ProposalVoting.Stage
            name={stageName}
            status={status}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={stage.stageIndex}
            bodyList={bodyList}
            minAdvance={minAdvance}
            maxAdvance={maxAdvance}
        >
            <ProposalVoting.BodySummary>
                <ProposalVoting.BodySummaryList>
                    {stage.plugins.map(({ address, ...plugin }) => (
                        <ProposalVoting.BodySummaryListItem
                            key={address}
                            id={address}
                            bodyBrand={plugin.subdomain === undefined ? brandedExternals[plugin.brandId] : undefined}
                        >
                            {plugin.subdomain != null && (
                                <PluginSingleComponent
                                    slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY}
                                    pluginId={plugin.subdomain}
                                    proposal={sppStageUtils.getBodySubProposal(proposal, address, stage.stageIndex)}
                                    name={plugin.name}
                                    isOptimistic={isVeto}
                                    isExecuted={proposal.executed.status}
                                />
                            )}
                            {plugin.subdomain == null && (
                                <SppVotingTerminalMultiBodySummaryDefault
                                    proposal={proposal}
                                    body={address}
                                    stage={stage}
                                    canVote={canVote}
                                />
                            )}
                        </ProposalVoting.BodySummaryListItem>
                    ))}
                </ProposalVoting.BodySummaryList>
                {isTimelockStage && <SppVotingTerminalStageTimelock stage={stage} proposal={proposal} />}
                <SppVotingTerminalBodySummaryFooter proposal={proposal} stage={stage} daoId={daoId} />
            </ProposalVoting.BodySummary>
            {stage.plugins.map((plugin) => (
                <SppVotingTerminalStageBodyContent
                    key={plugin.address}
                    plugin={plugin}
                    displayStatus={isSingleBody}
                    status={status}
                    proposal={proposal}
                    daoId={daoId}
                    stage={stage}
                />
            ))}
        </ProposalVoting.Stage>
    );
};
