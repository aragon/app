import { ProposalStatus, ProposalVoting } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import type { ISppProposal, ISppStage } from '../../../types';
import { sppStageUtils } from '../../../utils/sppStageUtils';
import { SppVotingTerminalBodySummary } from './sppVotingTerminalBodySummary';
import { SppVotingTerminalBodySummaryFooter } from './sppVotingTerminalBodySummaryFooter';
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

export const SppVotingTerminalStage: React.FC<ISppVotingTerminalStageProps> = (
    props,
) => {
    const { stage, daoId, proposal } = props;

    const processedStartDate = sppStageUtils
        .getStageStartDate(proposal, stage)
        ?.toMillis();
    const processedEndDate = sppStageUtils
        .getStageEndDate(proposal, stage)
        ?.toMillis();

    // Keep stage status and timings updated for statuses that are time dependent
    const { ACTIVE, PENDING, ACCEPTED, ADVANCEABLE } = ProposalStatus;

    const getStageDetails = useCallback(() => {
        const status = sppStageUtils.getStageStatus(proposal, stage);
        const minAdvance = sppStageUtils
            .getStageMinAdvance(proposal, stage)
            ?.toMillis();
        const maxAdvance = sppStageUtils
            .getStageMaxAdvance(proposal, stage)
            ?.toMillis();

        return { status, minAdvance, maxAdvance };
    }, [proposal, stage]);

    const { status, minAdvance, maxAdvance } = useDynamicValue({
        enabled: [ACTIVE, PENDING, ACCEPTED, ADVANCEABLE].includes(
            sppStageUtils.getStageStatus(proposal, stage),
        ),
        callback: getStageDetails,
    });

    const stageName = stage.name ?? stage.stageIndex.toString();
    const bodyList = stage.plugins.map((plugin) => plugin.address);

    const isSingleBody = bodyList.length === 1;
    const isTimelockStage = !stage.plugins.length;

    return (
        <ProposalVoting.Stage
            bodyList={bodyList}
            endDate={processedEndDate}
            index={stage.stageIndex}
            maxAdvance={maxAdvance}
            minAdvance={minAdvance}
            name={stageName}
            startDate={processedStartDate}
            status={status}
        >
            <ProposalVoting.BodySummary>
                <ProposalVoting.BodySummaryList>
                    {stage.plugins.map((plugin) => (
                        <SppVotingTerminalBodySummary
                            key={plugin.address}
                            plugin={plugin}
                            proposal={proposal}
                            stage={stage}
                        />
                    ))}
                </ProposalVoting.BodySummaryList>
                {isTimelockStage && (
                    <SppVotingTerminalStageTimelock
                        proposal={proposal}
                        stage={stage}
                    />
                )}
                <SppVotingTerminalBodySummaryFooter
                    daoId={daoId}
                    proposal={proposal}
                    stage={stage}
                />
            </ProposalVoting.BodySummary>
            {stage.plugins.map((plugin) => (
                <SppVotingTerminalStageBodyContent
                    daoId={daoId}
                    displayStatus={isSingleBody}
                    key={plugin.address}
                    plugin={plugin}
                    proposal={proposal}
                    stage={stage}
                />
            ))}
        </ProposalVoting.Stage>
    );
};
