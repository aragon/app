import { daoOptions } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { memberListOptions } from '../../api/governanceService';
import { DaoMembersPage, daoMembersCount, type IDaoMembersPageProps } from './daoMembersPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoMembersPageClient', () => ({ DaoMembersPageClient: () => <div data-testid="page-client-mock" /> }));

describe('<DaoMembersPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchInfiniteQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoMembersPageProps>) => {
        const completeProps: IDaoMembersPageProps = {
            params: Promise.resolve({ id: 'dao-id' }),
            ...props,
        };
        const Component = await DaoMembersPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member list of the first DAO body plugin', async () => {
        const dao = generateDao();
        const bodyPlugin = generateDaoPlugin({ address: '0x123' });
        fetchQuerySpy.mockResolvedValue(dao);
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);

        const params = { id: 'my-dao' };
        render(await createTestComponent({ params: Promise.resolve(params) }));

        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: params }).queryKey);
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { type: PluginType.BODY });

        const memberListParams = { daoId: params.id, pageSize: daoMembersCount, pluginAddress: bodyPlugin.address };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            memberListOptions({ queryParams: memberListParams }).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
