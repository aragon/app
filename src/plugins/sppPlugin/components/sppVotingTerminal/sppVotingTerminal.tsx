import { generateTokenPluginSettings, generateTokenProposal } from '@/plugins/tokenPlugin/testUtils';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePluginSettings } from '@/shared/hooks/usePluginSettings';
import { ProposalVoting } from '@aragon/ods';
import { generateSppProposal } from '../../testUtils';
import type { ISppPluginSettings, ISppProposal } from '../../types';
import { SppVotingTerminalStage } from './sppVotingTerminalStage';

const proposal = generateSppProposal({
    currentStageIndex: 0,
    subProposals: [
        {
            ...generateTokenProposal({
                id: '0x94beaf110a7e02986e8d4dae097ca6de26c97c42d90b42014c1f0936c679b5aa-0xA2Dee0b38d2CfaDeb52F2B5A738b5Ea7E037DCe9-48',
                blockTimestamp: 1726153572,
                settings: generateTokenPluginSettings({
                    minParticipation: 40,
                    supportThreshold: 500000,
                    historicalTotalSupply: '2',
                }),
                metrics: {
                    votesByOption: [
                        { type: VoteOption.YES, totalVotingPower: '447190' },
                        { type: VoteOption.NO, totalVotingPower: '4818' },
                    ],
                },
            }),
            stageId: '0',
        },
    ],
});

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
    const { daoId } = props;

    const { t } = useTranslations();

    const settings = usePluginSettings<ISppPluginSettings>({ daoId });
    const processedStages = settings?.stages.map((stage) => ({
        stage,
        proposals: proposal.subProposals.filter((proposal) => proposal.stageId === stage.id),
    }));

    return (
        <ProposalVoting.Container
            title={t('app.governance.proposalVotingTerminal.title')}
            description={t('app.governance.proposalVotingTerminal.description')}
            activeStage={proposal.currentStageIndex}
        >
            {processedStages?.map(({ stage, proposals }) => (
                <SppVotingTerminalStage
                    key={stage.id}
                    daoId={daoId}
                    startDate={proposal.startDate}
                    proposals={proposals}
                    stage={stage}
                />
            ))}
        </ProposalVoting.Container>
    );
};
