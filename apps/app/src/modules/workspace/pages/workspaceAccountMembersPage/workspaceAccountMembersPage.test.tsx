import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { DaoMembersPage } from '@/modules/governance/pages/daoMembersPage/daoMembersPage';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    WorkspaceMembersPageClient,
    workspaceMembersCount,
} from '../workspaceMembersPage';
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

jest.mock('../workspaceMembersPage', () => ({
    ...jest.requireActual('../workspaceMembersPage/workspaceMembersPage'),
    WorkspaceMembersPageClient: jest.fn(() => (
        <div data-testid="members-client-mock" />
    )),
}));

describe('<WorkspaceAccountMembersPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const daoMembersPageMock = DaoMembersPage as jest.Mock;
    const membersClientMock = WorkspaceMembersPageClient as jest.Mock;
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
        daoMembersPageMock.mockClear();
        membersClientMock.mockClear();
        resolveAccountTypeSpy.mockReset();
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

    it('renders the DAO members page of the account', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('dao-members-mock')).toBeInTheDocument();
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

    describe('Safe account', () => {
        beforeEach(() => {
            resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        });

        it('renders the workspace members page for a Safe account', async () => {
            render(await createTestComponent());

            expect(
                screen.getByTestId('members-client-mock'),
            ).toBeInTheDocument();
            expect(daoMembersPageMock).not.toHaveBeenCalled();
            expect(membersClientMock).toHaveBeenCalledWith(
                { workspaceId: 'demo', pageSize: workspaceMembersCount },
                undefined,
            );
        });

        it('looks the account up by the account ID of the URL', async () => {
            render(await createTestComponent());

            expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
        });

        it('takes the Safe branch for a lowercased account ID', async () => {
            const lowerAddress = address.toLowerCase();
            render(
                await createTestComponent({
                    params: Promise.resolve({
                        workspaceId: 'demo',
                        accountId: `${Network.ETHEREUM_SEPOLIA}-${lowerAddress}`,
                    }),
                }),
            );

            expect(
                screen.getByTestId('members-client-mock'),
            ).toBeInTheDocument();
            expect(resolveAccountTypeSpy).toHaveBeenCalledWith(
                `${Network.ETHEREUM_SEPOLIA}-${lowerAddress}`,
            );
        });
    });
});
