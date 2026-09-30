import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import {
    DaoDashboardPageClient,
    type IDaoDashboardPageClientProps,
} from '@/modules/dashboard/pages/daoDashboardPage';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceDetailsPageDaoDashboardProps,
    WorkspaceDetailsPageDaoDashboard,
} from './workspaceDetailsPageDaoDashboard';

jest.mock('@/modules/dashboard/pages/daoDashboardPage', () => ({
    DaoDashboardPageClient: jest.fn(() => (
        <div data-testid="dao-dashboard-page-mock" />
    )),
}));

describe('<WorkspaceDetailsPageDaoDashboard /> component', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const daoDashboardPageMock = DaoDashboardPageClient as jest.Mock;

    /**
     * Props of the last render of the DAO dashboard page.
     */
    const lastDaoDashboardPageProps = () =>
        daoDashboardPageMock.mock.calls.at(-1)?.[0] as
            | IDaoDashboardPageClientProps
            | undefined;

    beforeEach(() => {
        getDaoSpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        getDaoSpy.mockReset();
        daoDashboardPageMock.mockClear();
    });

    // Each test builds its own address so the DAO queries are never deduped across tests by React Query.
    let testIndex = 0;

    const buildAccount = (): IWorkspaceAccount => {
        testIndex += 1;
        const suffix = testIndex.toString().padStart(2, '0');
        const address = `0xE8fd9Fe445A037ee07fb98FDD4b146d939140D${suffix}`;

        return {
            id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
            type: WorkspaceAccountType.DAO,
            address,
            network: Network.ETHEREUM_SEPOLIA,
        };
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceDetailsPageDaoDashboardProps>,
    ) => {
        const completeProps: IWorkspaceDetailsPageDaoDashboardProps = {
            account: buildAccount(),
            featuredDelegates: [],
            ...props,
        };

        // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that
        // would otherwise shadow this one.
        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceDetailsPageDaoDashboard {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('displays the dashboard of the account', async () => {
        const account = buildAccount();
        const featuredDelegates = [
            { daoAddress: account.address } as unknown as IFeaturedDelegates,
        ];
        render(createTestComponent({ account, featuredDelegates }));

        expect(
            await screen.findByTestId('dao-dashboard-page-mock'),
        ).toBeInTheDocument();
        expect(lastDaoDashboardPageProps()).toEqual(
            expect.objectContaining({ daoId: account.id, featuredDelegates }),
        );
    });

    it('reads the DAO of the account', async () => {
        const account = buildAccount();
        render(createTestComponent({ account }));

        await screen.findByTestId('dao-dashboard-page-mock');

        expect(getDaoSpy).toHaveBeenCalledWith({
            urlParams: { id: account.id },
        });
    });

    it('displays a loading state while the DAO loads', async () => {
        getDaoSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(await screen.findByRole('progressbar')).toBeInTheDocument();
        expect(daoDashboardPageMock).not.toHaveBeenCalled();
    });

    it('displays an error instead of the dashboard when the DAO fails to load', async () => {
        getDaoSpy.mockRejectedValue(new Error('dao error'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceDetailsPage\.daoError\.heading$/),
        ).toBeInTheDocument();
        expect(daoDashboardPageMock).not.toHaveBeenCalled();
        expect(getDaoSpy).toHaveBeenCalledTimes(1);
    });
});
