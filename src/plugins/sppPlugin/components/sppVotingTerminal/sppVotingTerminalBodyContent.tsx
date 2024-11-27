import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage, ISppStagePlugin, ISppSubProposal } from '../../types';
import { SppStageStatus } from '../sppStageStatus';

export interface ISppVotingTerminalBodyContentProps {
    /**
     * The plugin that the stage belongs to.
     */
    plugin: ISppStagePlugin;
    /**
     * ID of the related DAO.
     */
    daoId: string;
    /**
     * Sub proposal to display the content for.
     */
    subProposal?: ISppSubProposal;
    /**
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Main stage of the body.
     */
    stage: ISppStage;
}
const votesPerPage = 6;

export const SppVotingTerminalBodyContent: React.FC<ISppVotingTerminalBodyContentProps> = (props) => {
    const { plugin, daoId, subProposal, proposal, stage } = props;

    const voteListParams = {
        queryParams: { proposalId: subProposal?.id, pluginAddress: subProposal?.pluginAddress, pageSize: votesPerPage },
    };

    const proposalSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[], IUseGovernanceSettingsParams>({
        params: { daoId, settings: plugin.settings, pluginAddress: plugin.address },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain,
    });

    const processedSubProposal =
        subProposal != null ? { ...subProposal, title: proposal.title, description: proposal.description } : undefined;
    return (
        <>
            {subProposal && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={plugin.subdomain}
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
                        <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={plugin.address} />
                    </ProposalVoting.Votes>
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </>
    );
};
