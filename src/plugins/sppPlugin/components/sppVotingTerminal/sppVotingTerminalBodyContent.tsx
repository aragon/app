import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { ISppProposal, ISppStagePlugin, ISppSubProposal } from '../../types';
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
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Flag indicating if the vote is a veto.
     */
    isVeto: boolean;
    /**
     * Flag indicating if the user can vote.
     */
    canVote: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

const votesPerPage = 6;

export const SppVotingTerminalBodyContent: React.FC<ISppVotingTerminalBodyContentProps> = (props) => {
    const { plugin, daoId, subProposal, proposal, canVote, isVeto, children } = props;

    const voteListParams = {
        queryParams: { proposalId: subProposal?.id, pluginAddress: subProposal?.pluginAddress, pageSize: votesPerPage },
    };

    const proposalSettings = useSlotSingleFunction<IUseGovernanceSettingsParams, IDaoSettingTermAndDefinition[]>({
        params: { daoId, settings: plugin.settings, pluginAddress: plugin.address },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: plugin.subdomain,
    });

    // Set parent name and description on sub-proposal to correctly display the proposal info on the vote dialog.
    const { title, description, incrementalId } = proposal;
    const processedSubProposal =
        subProposal != null ? { ...subProposal, title, description, incrementalId } : undefined;

    console.log('plugin', plugin, proposal);
    return (
        <>
            {(processedSubProposal || plugin.subdomain == null) && (
                <>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={plugin.subdomain}
                        proposal={subProposal}
                        Fallback={({ children }) => (
                            <>
                                <h1>HELLO BREAKDOWN TODO</h1>
                                {children}
                            </>
                        )}
                    >
                        <div className="flex flex-col gap-y-4 pt-6 md:pt-8">
                            {canVote && (
                                <PluginSingleComponent
                                    slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                                    pluginId={processedSubProposal?.pluginSubdomain ?? 'external'}
                                    proposal={processedSubProposal ?? proposal}
                                    daoId={daoId}
                                    isVeto={isVeto}
                                    externalAddress={processedSubProposal?.pluginSubdomain ? undefined : plugin.address}
                                    Fallback={SppVotingTerminalBodyVoteDefault}
                                />
                            )}
                            {children}
                        </div>
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
