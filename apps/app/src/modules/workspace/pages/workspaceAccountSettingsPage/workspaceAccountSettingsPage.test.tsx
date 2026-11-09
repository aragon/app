import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { DaoSettingsPage } from '@/modules/settings/pages/daoSettingsPage/daoSettingsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
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

describe('<WorkspaceAccountSettingsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoSettingsPageMock = DaoSettingsPage as jest.Mock;
    const safeSettingsClientMock = WorkspaceSafeSettingsPageClient as jest.Mock;
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
        daoSettingsPageMock.mockClear();
        safeSettingsClientMock.mockClear();
        resolveAccountTypeSpy.mockReset();
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

    it('renders the DAO settings page of the account', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('dao-settings-mock')).toBeInTheDocument();
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
            resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        });

        it('renders the Safe settings page', async () => {
            render(await createTestComponent());

            expect(
                screen.getByTestId('safe-settings-mock'),
            ).toBeInTheDocument();
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

        it('looks the account up by the account ID of the URL', async () => {
            render(await createTestComponent());

            expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
        });
    });
});
