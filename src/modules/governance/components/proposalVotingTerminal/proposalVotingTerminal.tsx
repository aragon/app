import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
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
    const pluginIds = useDaoPluginIds(daoId);

    const voteListParams = { queryParams: { proposalId: proposal.id, pageSize: votesPerPage } };

    const proposalSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: { daoId, settings: proposal.settings },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginIds,
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
                <PluginComponent
                    slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                    pluginIds={pluginIds}
                    proposalId={proposal.id}
                />
                <ProposalVoting.Votes>
                    <VoteList initialParams={voteListParams} daoId={daoId} />
                </ProposalVoting.Votes>
                <ProposalVoting.Details settings={proposalSettings} />
                {status === ProposalStatus.ACTIVE && (
                    <PluginComponent
                        slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                        pluginIds={pluginIds}
                        proposalIndex={proposal.proposalIndex}
                        daoId={daoId}
                        title={proposal.title}
                    />
                )}
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
