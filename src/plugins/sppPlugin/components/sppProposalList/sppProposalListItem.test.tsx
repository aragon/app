import {
    type ISppProposalListItemProps,
    SppProposalListItem,
} from '@/plugins/sppPlugin/components/sppProposalList/sppProposalListItem';
import { generateDaoPlugin } from '@/shared/testUtils';
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
            plugin: generateDaoPlugin(),
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
        const plugin = generateDaoPlugin({ slug: 'spp' });
        const subProposals = [generateSppSubProposal()];
        const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
        const proposal = generateSppProposal({
            subProposals,
            settings,
            incrementalId: 5,
        });
        const daoId = 'dao-id';
        render(createTestComponent({ plugin, proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/SPP-5`);
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

    it('displays "Stage" with number in status context when proposal is multistage and no stage name is returned', () => {
        const subProposals = [generateSppSubProposal(), generateSppSubProposal(), generateSppSubProposal()];
        const settings = generateSppPluginSettings({
            stages: [generateSppStage(), generateSppStage({ name: undefined }), generateSppStage()],
        });
        const proposal = generateSppProposal({
            subProposals,
            settings,
            stageIndex: 1,
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));

        expect(screen.getByText(/spp.sppProposalListItem.stage \(stageIndex=2/)).toBeInTheDocument();
    });
});
