import { useTranslations } from '@/shared/components/translationsProvider';
import { ProposalVoting } from '@aragon/ods';
import { type ISppProposal } from '../../types';
import { SppVotingTerminalStage } from './sppVotingTerminalStage';

export interface IProposalVotingTerminalProps {
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: ISppProposal;
}

export const SppVotingTerminal: React.FC<IProposalVotingTerminalProps> = (props) => {
    const { daoId, proposal } = props;

    const { t } = useTranslations();

    const processedStages = proposal.settings.stages.map((stage, index) => ({
        stage,
        proposals: proposal.subProposals.filter((proposal) => proposal.stageId === stage.id),
        index,
    }));

    return (
        <ProposalVoting.Container
            title={t('app.governance.proposalVotingTerminal.title')}
            description={t('app.governance.proposalVotingTerminal.description')}
            activeStage={proposal.currentStageIndex.toString()}
        >
            {processedStages?.map(({ stage, proposals, index }) => (
                <SppVotingTerminalStage
                    key={stage.id}
                    daoId={daoId}
                    proposals={proposals}
                    stage={stage}
                    index={index}
                />
            ))}
        </ProposalVoting.Container>
    );
};
