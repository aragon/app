import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoDashboardPage } from '@/modules/dashboard/pages/daoDashboardPage/daoDashboardPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import {
    type IWorkspaceAccountOverviewPageProps,
    WorkspaceAccountOverviewPage,
} from './workspaceAccountOverviewPage';

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

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

describe('<WorkspaceAccountOverviewPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoDashboardPageMock = DaoDashboardPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        daoDashboardPageMock.mockClear();
        accountGateMock.mockClear();
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

    it('renders the DAO dashboard of the account behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dao-dashboard-mock')).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
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
});
