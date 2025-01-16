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

describe('<SppProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(sppProposalUtils, 'getProposalStatus');

    afterEach(() => {
        getProposalStatusSpy.mockReset();
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
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
        const proposal = generateSppProposal({
            subProposals,
            settings,
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
        const proposal = generateSppProposal({
            subProposals,
            settings,
        });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });

    it('displays the stage name in status context when proposal is multistage and appropriate for status', () => {
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({
            stages: [generateSppStage({ name: 'stage-name' }), generateSppStage()],
        });
        const proposal = generateSppProposal({
            subProposals,
            settings,
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText('stage-name')).toBeInTheDocument();
    });

    it('displays "Stage N" in status context when proposal is multistage and no stage name is returned', () => {
        const subProposals = [generateSppSubProposal(), generateSppSubProposal(), generateSppSubProposal()];
        const settings = generateSppPluginSettings({
            stages: [generateSppStage(), generateSppStage({ name: undefined }), generateSppStage()],
        });
        const proposal = generateSppProposal({
            subProposals,
            settings,
            stageIndex: 1,
            endDate: 0,
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));

        expect(screen.getByText('Stage 2')).toBeInTheDocument(); // Expects "Stage 2" since `stageIndex + 1 = 2`
    });
});
