import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoMembersPageClient, type IDaoMembersPageClientProps } from './daoMembersPageClient';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

jest.mock('../../components/daoMemberList', () => ({
    DaoMemberList: () => <div data-testid="member-list-mock" />,
}));

describe('<DaoMembersPageClient /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoMembersPageClientProps>) => {
        const completeProps: IDaoMembersPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoMembersPageClient {...completeProps} />;
    };

    it('renders the page title, members list and members page details', () => {
        const pluginIds = ['id-1', 'id-2'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());

        expect(screen.getByText(/daoMembersPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoMembersPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByTestId('member-list-mock')).toBeInTheDocument();
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_MEMBERS_PAGE_DETAILS);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
