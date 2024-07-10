import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalsPageClient, type IDaoProposalsPageClientProps } from './daoProposalsPageClient';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

jest.mock('../../components/daoProposalList', () => ({
    DaoProposalList: () => <div data-testid="proposal-list-mock" />,
}));

describe('<DaoProposalsPageClient /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalsPageClientProps>) => {
        const completeProps: IDaoProposalsPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoProposalsPageClient {...completeProps} />;
    };

    it('renders the page title, proposals list and proposals page details', () => {
        const pluginIds = ['id-1', 'id-2'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());

        expect(screen.getByText(/daoProposalsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalsPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByTestId('proposal-list-mock')).toBeInTheDocument();
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_PROPOSALS_PAGE_DETAILS);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
