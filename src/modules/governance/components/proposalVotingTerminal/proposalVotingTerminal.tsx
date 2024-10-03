import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { ProposalStatus, ProposalVoting, proposalStatusToVotingStatus } from '@aragon/ods';
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

    const { t } = useTranslations();

    const voteListParams = { queryParams: { proposalId: proposal.id, pageSize: votesPerPage } };

    const proposalSettings = useSlotSingleFunction<IDaoSettingTermAndDefinition[], IUseGovernanceSettingsParams>({
        params: { daoId, settings: proposal.settings, pluginAddress: proposal.pluginAddress },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginId: proposal.pluginSubdomain,
    });

    return (
        <ProposalVoting.Container
            title={t('app.governance.proposalVotingTerminal.title')}
            description={t('app.governance.proposalVotingTerminal.description')}
        >
            <ProposalVoting.Stage
                status={proposalStatusToVotingStatus[status]}
                startDate={proposal.startDate * 1000}
                endDate={proposal.endDate * 1000}
            >
                <PluginSingleComponent
                    slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                    pluginId={proposal.pluginSubdomain}
                    proposalId={proposal.id}
                />
                <ProposalVoting.Votes>
                    <VoteList initialParams={voteListParams} daoId={daoId} />
                </ProposalVoting.Votes>
                <ProposalVoting.Details settings={proposalSettings} />
                {status === ProposalStatus.ACTIVE && (
                    <PluginSingleComponent
                        slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                        pluginId={proposal.pluginSubdomain}
                        proposalIndex={proposal.proposalIndex}
                        daoId={daoId}
                        title={proposal.title}
                    />
                )}
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
