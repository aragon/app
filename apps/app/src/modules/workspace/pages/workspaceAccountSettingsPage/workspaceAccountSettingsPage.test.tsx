import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoSettingsPage } from '@/modules/settings/pages/daoSettingsPage/daoSettingsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type IWorkspaceAccountSettingsPageProps,
    WorkspaceAccountSettingsPage,
} from './workspaceAccountSettingsPage';
import { WorkspaceSafeSettingsPageClient } from './workspaceSafeSettingsPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('@/modules/settings/pages/daoSettingsPage/daoSettingsPage', () => ({
    DaoSettingsPage: jest.fn(() => <div data-testid="dao-settings-mock" />),
}));

jest.mock('./workspaceSafeSettingsPageClient', () => ({
    WorkspaceSafeSettingsPageClient: jest.fn(() => (
        <div data-testid="safe-settings-mock" />
    )),
}));

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

describe('<WorkspaceAccountSettingsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoSettingsPageMock = DaoSettingsPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;
    const safeSettingsClientMock = WorkspaceSafeSettingsPageClient as jest.Mock;
    const getAccountInfoSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'getAccountInfo',
    );

    const generateAccountInfo = (
        type: WorkspaceAccountInfoType,
    ): IWorkspaceAccountInfo =>
        ({
            network: Network.ETHEREUM_SEPOLIA,
            address,
            type,
        }) as IWorkspaceAccountInfo;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        getAccountInfoSpy.mockResolvedValue(
            generateAccountInfo(WorkspaceAccountInfoType.DAO),
        );
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        daoSettingsPageMock.mockClear();
        accountGateMock.mockClear();
        safeSettingsClientMock.mockClear();
        getAccountInfoSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountSettingsPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountSettingsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            ...props,
        };
        const Component = await WorkspaceAccountSettingsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO settings page of the account behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dao-settings-mock')).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
    });

    it('hands the settings page the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const pageProps = daoSettingsPageMock.mock.calls.at(-1)?.[0] as
            | { params: Promise<unknown> }
            | undefined;

        await expect(pageProps?.params).resolves.toEqual({
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
        expect(daoSettingsPageMock).not.toHaveBeenCalled();
    });

    describe('Safe account', () => {
        beforeEach(() => {
            getAccountInfoSpy.mockResolvedValue(
                generateAccountInfo(WorkspaceAccountInfoType.SAFE),
            );
        });

        it('renders the Safe settings page outside the account gate', async () => {
            render(await createTestComponent());

            expect(
                screen.getByTestId('safe-settings-mock'),
            ).toBeInTheDocument();
            expect(accountGateMock).not.toHaveBeenCalled();
            expect(daoSettingsPageMock).not.toHaveBeenCalled();
            expect(safeSettingsClientMock).toHaveBeenCalledWith(
                {
                    workspaceId: 'demo',
                    network: Network.ETHEREUM_SEPOLIA,
                    address,
                },
                undefined,
            );
        });

        it('looks the account up by the network and address of the URL', async () => {
            render(await createTestComponent());

            expect(getAccountInfoSpy).toHaveBeenCalledWith({
                network: Network.ETHEREUM_SEPOLIA,
                address,
            });
        });
    });

    it('renders the DAO settings page behind the gate when the lookup fails', async () => {
        getAccountInfoSpy.mockResolvedValue(undefined);

        render(await createTestComponent());

        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dao-settings-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('safe-settings-mock'),
        ).not.toBeInTheDocument();
    });
});
