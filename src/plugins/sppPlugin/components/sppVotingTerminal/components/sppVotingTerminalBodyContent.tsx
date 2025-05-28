import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useSppGovernanceSettingsDefault } from '@/plugins/sppPlugin/hooks/useSppGovernanceSettingsDefault';
import type { ISppProposal, ISppStage, ISppStagePlugin, ISppSubProposal } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { type IDefinitionSetting, ProposalStatus, ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { SppVotingTerminalBodyBreakdownDefault } from './sppVotingTerminalBodyBreakdownDefault';
import { SppVotingTerminalBodyVoteDefault } from './sppVotingTerminalBodyVoteDefault';

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
     * Stage on which sub proposal is created.
     */
    stage: ISppStage;
    /**
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

const votesPerPage = 6;

export const SppVotingTerminalBodyContent: React.FC<ISppVotingTerminalBodyContentProps> = (props) => {
    const { plugin, daoId, subProposal, stage, proposal, children } = props;

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const canVote = stageStatus === ProposalStatus.ACTIVE;

    const isExternalBody = plugin.subdomain == null;
    const isVeto = sppStageUtils.isVeto(stage);

    const pluginSettings = isExternalBody ? {} : plugin.settings;
    const settings = useSlotSingleFunction<IUseGovernanceSettingsParams, IDefinitionSetting[]>({
        params: { daoId, settings: pluginSettings, isVeto, pluginAddress: plugin.address },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain ?? 'external',
        fallback: useSppGovernanceSettingsDefault,
    });

    const proposalSettings = useDaoPluginInfo({ daoId, address: proposal.pluginAddress, settings });

    const voteListParams = {
        queryParams: { proposalId: subProposal?.id, pluginAddress: subProposal?.pluginAddress, pageSize: votesPerPage },
    };

    // Set parent name and description on sub-proposal to correctly display the proposal info on the vote dialog.
    const { title, description, incrementalId } = proposal;
    const processedSubProposal =
        subProposal != null ? { ...subProposal, title, description, incrementalId } : undefined;

    return (
        <>
            {(processedSubProposal != null || isExternalBody) && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={isExternalBody ? 'external' : plugin.subdomain}
                        proposal={isExternalBody ? proposal : subProposal}
                        body={isExternalBody ? plugin.address : undefined}
                        stage={stage}
                        canVote={canVote}
                        isVeto={isVeto}
                        Fallback={SppVotingTerminalBodyBreakdownDefault}
                    >
                        <div className="flex flex-col gap-y-4 pt-6 md:pt-8">
                            {canVote && (
                                <PluginSingleComponent
                                    slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                                    pluginId={isExternalBody ? 'external' : processedSubProposal!.pluginSubdomain}
                                    proposal={isExternalBody ? proposal : processedSubProposal}
                                    externalAddress={isExternalBody ? plugin.address : undefined}
                                    daoId={daoId}
                                    stage={stage}
                                    isVeto={isVeto}
                                    Fallback={SppVotingTerminalBodyVoteDefault}
                                />
                            )}
                            {children}
                        </div>
                    </PluginSingleComponent>
                    {processedSubProposal && (
                        <ProposalVoting.Votes>
                            <VoteList
                                initialParams={voteListParams}
                                daoId={daoId}
                                pluginAddress={plugin.address}
                                isVeto={isVeto}
                            />
                        </ProposalVoting.Votes>
                    )}
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </>
    );
};
