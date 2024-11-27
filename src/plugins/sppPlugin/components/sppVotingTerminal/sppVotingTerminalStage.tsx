import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { proposalStatusToVotingStatus, ProposalVoting, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { SppProposalType, type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { SppVotingTerminalBodyContent } from './sppVotingTerminalBodyContent';

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

    const { t } = useTranslations();

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

    const isVetoStage = stage.plugins[0].proposalType === SppProposalType.VETO;
    const actionType = isVetoStage ? 'veto' : 'approve';
    const threshold = isVetoStage ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={processedStageStatus}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={isMultiStage}
            bodyList={stage.plugins.map((plugin) => plugin.address)}
        >
            <ProposalVoting.BodySummary>
                <ProposalVoting.BodySummaryList>
                    {stage.plugins.map((plugin) => (
                        <ProposalVoting.BodySummaryListItem key={plugin.address} id={plugin.address}>
                            <PluginSingleComponent
                                slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_SUMMARY}
                                pluginId={plugin.subdomain}
                                proposal={subProposals?.find(
                                    (subProposal) => subProposal.pluginAddress === plugin.address,
                                )}
                                name="Body name"
                            />
                        </ProposalVoting.BodySummaryListItem>
                    ))}
                </ProposalVoting.BodySummaryList>
                <p className="text-center text-neutral-500 md:text-right">
                    <span className="text-neutral-800">
                        {t('app.plugins.spp.sppVotingTerminalStage.footer.thresholdLabel', {
                            count: threshold,
                            entityType,
                        })}
                    </span>{' '}
                    {t('app.plugins.spp.sppVotingTerminalStage.footer.actionRequired', { action: actionType })}
                </p>
            </ProposalVoting.BodySummary>
            {stage.plugins.map((plugin) => {
                const subProposal = subProposals?.find((subProposal) => subProposal.pluginAddress === plugin.address);
                return (
                    <ProposalVoting.BodyContent
                        name={subProposal?.title}
                        key={plugin.address}
                        status={processedStageStatus}
                        bodyId={plugin.address}
                    >
                        <SppVotingTerminalBodyContent
                            plugin={plugin}
                            daoId={daoId}
                            subProposal={subProposal}
                            proposal={proposal}
                            stage={stage}
                        />
                    </ProposalVoting.BodyContent>
                );
            })}
        </ProposalVoting.Stage>
    );
};
