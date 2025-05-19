import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { addressUtils, ProposalStatus, ProposalVoting, ProposalVotingTab } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../../types';
import { sppStageUtils } from '../../../utils/sppStageUtils';
import { SppStageStatus } from './sppStageStatus';
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
    const processedMinAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)?.toMillis();
    const processedMaxAdvance = sppStageUtils.getStageMaxAdvance(proposal, stage)?.toMillis();

    // Keep stage status updated for statuses that are time dependent
    const { ACTIVE, PENDING, ACCEPTED } = ProposalStatus;
    const enableDynamicValue = [ACTIVE, PENDING, ACCEPTED].includes(sppStageUtils.getStageStatus(proposal, stage));
    const stageStatus = useDynamicValue({
        callback: () => sppStageUtils.getStageStatus(proposal, stage),
        enabled: enableDynamicValue,
    });

    const bodyList = stage.plugins.map((plugin) => plugin.address);

    const isMultiStage = proposal.settings.stages.length > 1;
    const isSingleBody = bodyList.length === 1;

    const canVote = stageStatus === ProposalStatus.ACTIVE;

    const isVeto = sppStageUtils.isVeto(stage);
    const isTimelockStage = !stage.plugins.length;

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={stageStatus}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={stage.stageIndex}
            isMultiStage={isMultiStage}
            bodyList={bodyList}
            minAdvance={processedMinAdvance}
            maxAdvance={processedMaxAdvance}
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
                <ProposalVoting.BodyContent
                    name={plugin.subdomain != null ? plugin.name : addressUtils.truncateAddress(plugin.address)}
                    key={plugin.address}
                    status={stageStatus}
                    bodyId={plugin.address}
                    hideTabs={!plugin.subdomain ? [ProposalVotingTab.VOTES] : undefined}
                    bodyBrand={plugin.subdomain === undefined ? brandedExternals[plugin.brandId] : undefined}
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
