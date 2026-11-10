import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { DaoDashboardPage } from '@/modules/dashboard/pages/daoDashboardPage/daoDashboardPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type IWorkspaceAccountOverviewPageProps,
    WorkspaceAccountOverviewPage,
} from './workspaceAccountOverviewPage';
import { WorkspaceSafeDashboardPageClient } from './workspaceSafeDashboardPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock(
    '@/modules/dashboard/pages/daoDashboardPage/daoDashboardPage',
    () => ({
        DaoDashboardPage: jest.fn(() => (
            <div data-testid="dao-dashboard-mock" />
        )),
    }),
);

jest.mock('./workspaceSafeDashboardPageClient', () => ({
    WorkspaceSafeDashboardPageClient: jest.fn(() => (
        <div data-testid="safe-dashboard-mock" />
    )),
}));

describe('<WorkspaceAccountOverviewPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoDashboardPageMock = DaoDashboardPage as jest.Mock;
    const safeDashboardClientMock =
        WorkspaceSafeDashboardPageClient as jest.Mock;
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        daoDashboardPageMock.mockClear();
        safeDashboardClientMock.mockClear();
        resolveAccountTypeSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountOverviewPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountOverviewPageProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            ...props,
        };
        const Component = await WorkspaceAccountOverviewPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO dashboard of the account', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('dao-dashboard-mock')).toBeInTheDocument();
    });

    it('hands the dashboard the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const dashboardProps = daoDashboardPageMock.mock.calls.at(-1)?.[0] as
            | { params: Promise<unknown> }
            | undefined;

        await expect(dashboardProps?.params).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
        });
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
        expect(daoDashboardPageMock).not.toHaveBeenCalled();
    });

    describe('Safe account', () => {
        beforeEach(() => {
            resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        });

        it('renders the Safe dashboard', async () => {
            render(await createTestComponent());

            expect(
                screen.getByTestId('safe-dashboard-mock'),
            ).toBeInTheDocument();
            expect(daoDashboardPageMock).not.toHaveBeenCalled();
            expect(safeDashboardClientMock).toHaveBeenCalledWith(
                {
                    workspaceId: 'demo',
                    network: Network.ETHEREUM_SEPOLIA,
                    address,
                },
                undefined,
            );
        });

        it('looks the account up by the account ID of the URL', async () => {
            render(await createTestComponent());

            expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
        });
    });
});
