import { useTranslations } from '@/shared/components/translationsProvider';
import { ProposalVoting } from '@aragon/gov-ui-kit';
import { type ISppProposal } from '../../types';
import { SppVotingTerminalStage } from './sppVotingTerminalStage';

export interface ISppVotingTerminalProps {
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: ISppProposal;
}

export const SppVotingTerminal: React.FC<ISppVotingTerminalProps> = (props) => {
    const { daoId, proposal } = props;

    const { t } = useTranslations();

    const processedStages = proposal.settings.stages.map((stage, index) => ({
        stage,
        subProposals: proposal.subProposals.filter((proposal) => proposal.stageId === stage.id),
        index,
    }));

    return (
        <ProposalVoting.Container
            title={t('app.plugins.spp.sppVotingTerminal.title')}
            description={t('app.plugins.spp.sppVotingTerminal.description')}
            activeStage={proposal.currentStageIndex.toString()}
        >
            {processedStages?.map(({ stage, subProposals, index }) => (
                <SppVotingTerminalStage
                    key={stage.id}
                    daoId={daoId}
                    subProposals={subProposals}
                    stage={stage}
                    index={index}
                    proposal={proposal}
                />
            ))}
        </ProposalVoting.Container>
    );
};
