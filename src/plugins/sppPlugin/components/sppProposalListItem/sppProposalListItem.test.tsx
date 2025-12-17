import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateDao } from '@/shared/testUtils';
import { generateSppPluginSettings, generateSppProposal, generateSppStage } from '../../testUtils';
import { sppProposalUtils } from '../../utils/sppProposalUtils';
import { type ISppProposalListItemProps, SppProposalListItem } from './sppProposalListItem';

describe('<SppProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(sppProposalUtils, 'getProposalStatus');

    afterEach(() => {
        getProposalStatusSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ISppProposalListItemProps>) => {
        const completeProps: ISppProposalListItemProps = {
            dao: generateDao(),
            proposal: generateSppProposal(),
            proposalSlug: 'spp-1',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SppProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the SPP proposal', () => {
        const proposal = generateSppProposal({ title: 'SPP Proposal' });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposalSlug = 'SPP-5';
        render(createTestComponent({ proposalSlug }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toMatch('proposals/SPP-5');
    });

    it('renders the stage name in status context when proposal is multistage', () => {
        const stages = [generateSppStage({ name: 'stage-name' }), generateSppStage()];
        const proposal = generateSppProposal({
            stageIndex: 0,
            settings: generateSppPluginSettings({ stages }),
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText(stages[0].name!)).toBeInTheDocument();
    });

    it('renders default stage label with index in status context when proposal is multistage and active stage has no name', () => {
        const stages = [generateSppStage({ name: 'first-stage' }), generateSppStage({ name: undefined })];
        const proposal = generateSppProposal({
            stageIndex: 1,
            settings: generateSppPluginSettings({ stages }),
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText(/sppProposalListItem.stage \(stageIndex=2/)).toBeInTheDocument();
    });
});
