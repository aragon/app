import { VoteList } from '@/modules/governance/components/voteList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { ProposalVoting, ProposalVotingStatus } from '@aragon/ods';
import type { ISppStage, ISppSubProposal } from '../../types';

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
     * Optional start date of the main proposal.
     */
    startDate?: number;
    /**
     * Sub-proposal.
     */
    proposal?: ISppSubProposal;
    /**
     * Index of the sub proposal.
     */
    index?: number;
}

const votesPerPage = 6;

export const SppVotingTerminalStage: React.FC<IProposalVotingTerminalStageProps> = (props) => {
    const { stage, daoId, startDate, proposal, index } = props;

    const pluginIds = [stage.plugins[0].subdomain];

    const voteListParams = { queryParams: { proposalId: proposal?.id, pageSize: votesPerPage } };

    const proposalSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: { daoId, settings: proposal?.settings },
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginIds,
    });

    const processedStartDate = (startDate ?? 0) * 1000;
    const processedEndDate = ((proposal?.blockTimestamp ?? 0) + stage.votingPeriod) * 1000;

    return (
        <ProposalVoting.Stage
            name={stage.name}
            status={index === 0 ? ProposalVotingStatus.ACTIVE : ProposalVotingStatus.PENDING}
            startDate={processedStartDate}
            endDate={processedEndDate}
            index={index}
            isMultiStage={true}
        >
            {proposal && (
                <>
                    <PluginComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                        pluginIds={pluginIds}
                        proposalId={proposal.id}
                        proposal={proposal}
                    />
                    <ProposalVoting.Votes>
                        <VoteList initialParams={voteListParams} daoId={daoId} />
                    </ProposalVoting.Votes>
                </>
            )}
            <ProposalVoting.Details settings={proposalSettings} />
        </ProposalVoting.Stage>
    );
};
