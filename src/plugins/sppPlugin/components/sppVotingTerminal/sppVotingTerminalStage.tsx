import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { ProposalVoting, ProposalVotingStatus, ProposalVotingTab } from '@aragon/ods';
import type { ISppStage, ISppSubProposal } from '../../types';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';

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
     * Sub-proposal.
     */
    proposals?: ISppSubProposal[];
    /**
     * Index of the sub proposal.
     */
    index: number;
}

const votesPerPage = 6;

export const SppVotingTerminalStage: React.FC<IProposalVotingTerminalStageProps> = (props) => {
    const { stage, daoId, proposals, index } = props;

    // TODO: Support multiple proposals within a stage (APP-3659)
    const proposal = proposals?.[0];
    const voteListParams = { queryParams: { proposalId: proposal?.id, pageSize: votesPerPage } };

    const proposalSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[], IUseGovernanceSettingsParams>({
        params: { daoId, settings: proposal?.settings, pluginAddress: proposal?.pluginAddress ?? '' },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: proposal?.pluginSubdomain ?? '',
    });

    const processedStartDate = (proposal?.startDate ?? 0) * 1000;
    const processedEndDate = ((proposal?.blockTimestamp ?? 0) + stage.votingPeriod) * 1000;

    //TODO: Need to make adjustment in ODS to disable tabs for inactive proposals
    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={index === 0 ? ProposalVotingStatus.ACTIVE : ProposalVotingStatus.PENDING}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={true}
            defaultTab={ProposalVotingTab.BREAKDOWN}
        >
            {proposal && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={proposal.pluginSubdomain}
                        proposalId={proposal.id}
                    />
                    <ProposalVoting.Votes>
                        <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={proposal.pluginAddress} />
                    </ProposalVoting.Votes>
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </ProposalVoting.Stage>
    );
};
