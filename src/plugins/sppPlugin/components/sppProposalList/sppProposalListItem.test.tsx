import {
    type ISppProposalListItemProps,
    SppProposalListItem,
} from '@/plugins/sppPlugin/components/sppProposalList/sppProposalListItem';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateSppPluginSettings, generateSppProposal, generateSppStage } from '../../testUtils';

describe('<SppProposalListItem /> component', () => {
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
        const proposal = generateSppProposal({ settings: generateSppPluginSettings({ stages: [generateSppStage()] }) });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposal = generateSppProposal({
            id: 'proposal-id',
            settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
        });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });
});
