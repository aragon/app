import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    DaoMembersPageClient,
    type IDaoMembersPageClientProps,
} from './daoMembersPageClient';

jest.mock('../../components/daoMemberList', () => ({
    DaoMemberList: { Container: () => <div data-testid="member-list-mock" /> },
}));

jest.mock('@/modules/settings/components/daoPluginInfo', () => ({
    DaoPluginInfo: () => <div data-testid="plugin-info-mock" />,
}));

describe('<DaoMembersPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMembersPageClientProps>,
    ) => {
        const completeProps: IDaoMembersPageClientProps = {
            initialParams: {
                queryParams: { daoId: 'test-id', pluginAddress: '0x123' },
            },
            featuredDelegates: [],
            ...props,
        };

        return <DaoMembersPageClient {...completeProps} />;
    };

    it('renders the page title, members list and members page details', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/daoMembersPage.main.title/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('member-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('plugin-info-mock')).toBeInTheDocument();
    });
});
