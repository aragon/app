import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { proposalStatusToVotingStatus, ProposalVoting, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage, ISppSubProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { SppStageStatus } from '../sppStageStatus';

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

const votesPerPage = 6;

export const SppVotingTerminalStage: React.FC<IProposalVotingTerminalStageProps> = (props) => {
    const { stage, daoId, subProposals, index, proposal } = props;

    // TODO: Support multiple proposals within a stage (APP-3659)
    const subProposal = subProposals?.[0];
    const { address: pluginAddress, ...plugin } = stage.plugins[0];

    // Vote list for subproposal TODO: Support multiple proposals within a stage (APP-3659)
    const voteListParams = { queryParams: { proposalId: subProposal?.id, pluginAddress, pageSize: votesPerPage } };

    const proposalSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[], IUseGovernanceSettingsParams>({
        params: { daoId, settings: plugin.settings, pluginAddress },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain,
    });

    const processedStartDate = sppStageUtils.getStageStartDate(proposal, stage)?.toMillis();
    const processedEndDate = sppStageUtils.getStageEndDate(proposal, stage)?.toMillis();

    // Set parent name and description on sub-proposal to correctly display the proposal info on the vote dialog.
    const processedSubProposal =
        subProposal != null ? { ...subProposal, title: proposal.title, description: proposal.description } : undefined;

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

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={processedStageStatus}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={isMultiStage}
            forceMount={true}
        >
            {subProposal && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={subProposal.pluginSubdomain}
                        proposal={subProposal}
                    >
                        {processedSubProposal && (
                            <SppStageStatus
                                proposal={proposal}
                                subProposal={processedSubProposal}
                                daoId={daoId}
                                stage={stage}
                            />
                        )}
                    </PluginSingleComponent>
                    <ProposalVoting.Votes>
                        <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={pluginAddress} />
                    </ProposalVoting.Votes>
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </ProposalVoting.Stage>
    );
};
