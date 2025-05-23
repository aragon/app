import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { type IDefinitionSetting, ProposalStatus, ProposalVoting } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { VoteList } from '../voteList';

export interface IProposalVotingTerminalProps {
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: IProposal;
    /**
     * Status of the proposal.
     */
    status: ProposalStatus;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

const votesPerPage = 6;

export const ProposalVotingTerminal: React.FC<IProposalVotingTerminalProps> = (props) => {
    const { proposal, status, daoId } = props;

    const { address } = useAccount();

    const voteListParams = {
        queryParams: {
            proposalId: proposal.id,
            pluginAddress: proposal.pluginAddress,
            pageSize: votesPerPage,
            highlightUser: address,
        },
    };

    const pluginSettings = useSlotSingleFunction<IUseGovernanceSettingsParams, IDefinitionSetting[]>({
        params: { daoId, settings: proposal.settings, pluginAddress: proposal.pluginAddress },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: proposal.pluginSubdomain,
    });

    const proposalSettings = useDaoPluginInfo({ daoId, address: proposal.pluginAddress, settings: pluginSettings });

    return (
        <ProposalVoting.Container>
            <ProposalVoting.Stage
                status={status}
                startDate={proposal.startDate * 1000}
                endDate={proposal.endDate * 1000}
            >
                <ProposalVoting.BodyContent status={status}>
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginId={proposal.pluginSubdomain}
                        proposal={proposal}
                    >
                        {status === ProposalStatus.ACTIVE && (
                            <div className="pt-6 md:pt-8">
                                <PluginSingleComponent
                                    slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                                    pluginId={proposal.pluginSubdomain}
                                    proposal={proposal}
                                    daoId={daoId}
                                />
                            </div>
                        )}
                    </PluginSingleComponent>
                    <ProposalVoting.Votes>
                        <VoteList initialParams={voteListParams} daoId={daoId} pluginAddress={proposal.pluginAddress} />
                    </ProposalVoting.Votes>
                    <ProposalVoting.Details settings={proposalSettings} />
                </ProposalVoting.BodyContent>
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
