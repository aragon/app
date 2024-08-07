import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { type ProposalStatus, ProposalVoting, ProposalVotingStatus } from '@aragon/ods';
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

// TODO: to be removed when https://github.com/aragon/ods/pull/267 is merged on ODS
const statusToStageStatus: Record<ProposalStatus, ProposalVotingStatus> = {
    accepted: ProposalVotingStatus.ACCEPTED,
    active: ProposalVotingStatus.ACTIVE,
    challenged: ProposalVotingStatus.ACTIVE,
    draft: ProposalVotingStatus.PENDING,
    executed: ProposalVotingStatus.ACCEPTED,
    expired: ProposalVotingStatus.ACCEPTED,
    failed: ProposalVotingStatus.ACCEPTED,
    partiallyExecuted: ProposalVotingStatus.ACCEPTED,
    pending: ProposalVotingStatus.PENDING,
    // executable: ProposalVotingStatus.ACCEPTED, use executable when updating ODS library
    queued: ProposalVotingStatus.ACCEPTED,
    rejected: ProposalVotingStatus.REJECTED,
    vetoed: ProposalVotingStatus.ACTIVE,
};

export const ProposalVotingTerminal: React.FC<IProposalVotingTerminalProps> = (props) => {
    const { proposal, status, daoId } = props;

    const { t } = useTranslations();
    const pluginIds = useDaoPluginIds(daoId);

    const voteListParams = { queryParams: { proposalId: proposal.id, pageSize: votesPerPage } };

    // TODO: remove custom settings object and plugin-specific logic when settings interface is cleaned up (APP-3483)
    const settingsObject = {
        settings: proposal.settings,
        token: (proposal as unknown as Record<string, unknown>).token,
    };

    const proposalSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: { daoId, settings: settingsObject },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginIds,
    });

    return (
        <ProposalVoting.Container
            title={t('app.governance.proposalVotingTerminal.title')}
            description={t('app.governance.proposalVotingTerminal.description')}
        >
            <ProposalVoting.Stage
                status={statusToStageStatus[status]}
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
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
