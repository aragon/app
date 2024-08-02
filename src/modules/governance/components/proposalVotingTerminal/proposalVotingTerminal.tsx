import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { ProposalVoting, ProposalVotingStatus } from '@aragon/ods';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { VoteList } from '../voteList';

export interface IProposalVotingTerminalProps {
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: IProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

const votesPerPage = 6;

export const ProposalVotingTerminal: React.FC<IProposalVotingTerminalProps> = (props) => {
    const { proposal, daoId } = props;

    const { t } = useTranslations();
    const pluginIds = useDaoPluginIds(daoId);

    const voteListParams = { queryParams: { proposalId: proposal.id, pageSize: votesPerPage } };

    return (
        <ProposalVoting.Container
            title={t('app.governance.proposalVotingTerminal.title')}
            description={t('app.governance.proposalVotingTerminal.description')}
        >
            <ProposalVoting.Stage
                status={ProposalVotingStatus.PENDING}
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
                <ProposalVoting.Details />
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
