import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { DaoMembersPage } from '@/modules/governance/pages/daoMembersPage/daoMembersPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import {
    type IWorkspaceAccountMembersPageProps,
    WorkspaceAccountMembersPage,
} from './workspaceAccountMembersPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('@/modules/governance/pages/daoMembersPage/daoMembersPage', () => ({
    DaoMembersPage: jest.fn(() => <div data-testid="dao-members-mock" />),
}));

jest.mock('../../components/workspaceAccountGate', () => ({
    WorkspaceAccountGate: jest.fn(({ children }: { children: ReactNode }) => (
        <div data-testid="account-gate-mock">{children}</div>
    )),
}));

describe('<WorkspaceAccountMembersPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoMembersPageMock = DaoMembersPage as jest.Mock;
    const accountGateMock = WorkspaceAccountGate as jest.Mock;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        daoMembersPageMock.mockClear();
        accountGateMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountMembersPageProps>,
    ) => {
        const completeProps: IWorkspaceAccountMembersPageProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            ...props,
        };
        const Component = await WorkspaceAccountMembersPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the DAO members page of the account behind the account gate', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('account-gate-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dao-members-mock')).toBeInTheDocument();
        expect(accountGateMock).toHaveBeenCalledWith(
            expect.objectContaining({ accountId }),
            undefined,
        );
    });

    it('hands the members page the account as DAO route parameters', async () => {
        render(await createTestComponent());

        const membersPageProps = daoMembersPageMock.mock.calls.at(-1)?.[0] as
            | { params: Promise<unknown> }
            | undefined;

        await expect(membersPageProps?.params).resolves.toEqual({
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
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });
});
