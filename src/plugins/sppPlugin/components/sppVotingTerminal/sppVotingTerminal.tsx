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
        subProposals: proposal.subProposals.filter((proposal) => proposal.stageId === stage.id),
        index,
        currentStageIndex: proposal.currentStageIndex,
        lastStageTransition: proposal.lastStageTransition,
    }));

    return (
        <ProposalVoting.Container
            title={t('app.plugins.spp.sppVotingTerminal.title')}
            description={t('app.plugins.spp.sppVotingTerminal.description')}
            activeStage={proposal.currentStageIndex.toString()}
        >
            {processedStages?.map(({ stage, subProposals, index, currentStageIndex, lastStageTransition }) => (
                <SppVotingTerminalStage
                    key={stage.id}
                    daoId={daoId}
                    subProposals={subProposals}
                    stage={stage}
                    index={index}
                    currentStageIndex={currentStageIndex}
                    lastStageTransition={lastStageTransition}
                />
            ))}
        </ProposalVoting.Container>
    );
};
