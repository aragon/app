import {
    type ISppProposalListItemProps,
    SppProposalListItem,
} from '@/plugins/sppPlugin/components/sppProposalList/sppProposalListItem';
import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppSubProposal,
} from '../../testUtils';
import { sppProposalUtils } from '../../utils/sppProposalUtils';
import { sppStageUtils } from '../../utils/sppStageUtils';

describe('<SppProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(sppProposalUtils, 'getProposalStatus');
    const hasUserVotedInStageSpy = jest.spyOn(sppStageUtils, 'hasUserVotedInStage');

    afterEach(() => {
        getProposalStatusSpy.mockReset();
        hasUserVotedInStageSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ISppProposalListItemProps>) => {
        const completeProps: ISppProposalListItemProps = {
            proposal: generateSppProposal(),
            daoId: 'dao-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SppProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the spp proposal', () => {
        const id = 'proposal-id';
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
        const proposal = generateSppProposal({
            id,
            subProposals,
            settings,
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const id = 'proposal-id';
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
        const proposal = generateSppProposal({
            id,
            subProposals,
            settings,
        });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });

    it('displays the stage name in status context when proposal is multistage and appropriate for status', () => {
        const id = 'proposal-id';
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({
            stages: [generateSppStage({ name: 'stage-name' }), generateSppStage()],
        });
        const stageIndex = 0;
        const proposal = generateSppProposal({
            id,
            subProposals,
            settings,
            stageIndex,
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText('stage-name')).toBeInTheDocument();
    });

    it('displays the vote status when user has voted in the active stage', () => {
        const id = 'proposal-id';
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({
            stages: [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })],
        });
        const stageIndex = 0;
        const proposal = generateSppProposal({
            id,
            subProposals,
            settings,
            stageIndex,
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        hasUserVotedInStageSpy.mockReturnValue(true);
        render(createTestComponent({ proposal }));
        expect(screen.getByText('Voted')).toBeInTheDocument();
    });
});
