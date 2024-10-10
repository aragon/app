import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ProposalVoting, ProposalVotingStatus } from '@aragon/ods';
import type { ISppProposal, ISppStage, ISppSubProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

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
    const plugin = stage.plugins[0];

    const voteListParams = {
        queryParams: { proposalId: proposal?.id, pluginAddress: plugin.address, pageSize: votesPerPage },
    };

    const proposalSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[], IUseGovernanceSettingsParams>({
        params: { daoId, settings: plugin.settings, pluginAddress: plugin.address },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain,
    });

    const processedStartDate = sppStageUtils.getStageStartDate(proposal).toSeconds();
    const processedEndDate = sppStageUtils.getStageEndDate(proposal, stage).toSeconds();

    return (
        <ProposalVoting.Stage
            name={stage.name}
            // TODO: process and set correct stage status (APP-3662)
            status={index === 0 ? ProposalVotingStatus.ACTIVE : ProposalVotingStatus.PENDING}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={true}
            forceMount={true}
        >
            {subProposal && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={subProposal.pluginSubdomain}
                        proposal={subProposal}
                    />
                    <ProposalVoting.Votes>
                        <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={plugin.address} />
                    </ProposalVoting.Votes>
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </ProposalVoting.Stage>
    );
};
