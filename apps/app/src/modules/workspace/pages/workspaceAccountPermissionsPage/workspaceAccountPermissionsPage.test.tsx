import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoPermissionsPage } from '@/modules/permissions/pages/daoPermissionsPage/daoPermissionsPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import {
    type IWorkspaceAccountPermissionsPageProps,
    WorkspaceAccountPermissionsPage,
} from './workspaceAccountPermissionsPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock(
    '@/modules/permissions/pages/daoPermissionsPage/daoPermissionsPage',
    () => ({
        DaoPermissionsPage: jest.fn(() => (
            <div data-testid="dao-permissions-mock" />
        )),
    }),
);

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

describe('<WorkspaceAccountPermissionsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoPermissionsPageMock = DaoPermissionsPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        daoPermissionsPageMock.mockClear();
        accountGateMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountPermissionsPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountPermissionsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            ...props,
        };
        const Component = await WorkspaceAccountPermissionsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO permissions page of the account behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dao-permissions-mock')).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
    });

    it('hands the permissions page the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const pageProps = daoPermissionsPageMock.mock.calls.at(-1)?.[0] as
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
        expect(daoPermissionsPageMock).not.toHaveBeenCalled();
    });
});
