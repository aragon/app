import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { SafePendingTransactionList } from '@/modules/safe/components/safePendingTransactionList';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceMemberList } from '../../components/workspaceMemberList';
import { WorkspaceSafeAsideCard } from '../../components/workspaceSafeAsideCard';
import * as useWorkspaceAccountOptionsHook from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceSafeDashboardPageClientProps,
    WorkspaceSafeDashboardPageClient,
} from './workspaceSafeDashboardPageClient';

jest.mock('@/modules/safe/components/safePendingTransactionList', () => ({
    SafePendingTransactionList: jest.fn(() => (
        <div data-testid="pending-list-mock" />
    )),
}));

jest.mock('../../components/workspaceMemberList', () => ({
    WorkspaceMemberList: jest.fn(() => <div data-testid="member-list-mock" />),
}));

jest.mock('../../components/workspaceAssetList', () => ({
    WorkspaceAssetList: jest.fn(() => <div data-testid="asset-list-mock" />),
}));

jest.mock('../../components/workspaceSafeAsideCard', () => ({
    WorkspaceSafeAsideCard: jest.fn(() => (
        <div data-testid="aside-card-mock" />
    )),
}));

describe('<WorkspaceSafeDashboardPageClient /> component', () => {
    const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsHook,
        'useWorkspaceAccountOptions',
    );
    const pendingListMock = SafePendingTransactionList as jest.Mock;
    const memberListMock = WorkspaceMemberList as jest.Mock;
    const assetListMock = WorkspaceAssetList as jest.Mock;
    const asideCardMock = WorkspaceSafeAsideCard as jest.Mock;

    const safeAccount: IWorkspaceAccount = {
        id: accountId,
        type: WorkspaceAccountType.SAFE,
        address,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe', description: 'Pays the grants' },
    };

    const mockActiveOption = (
        option?: Partial<useWorkspaceAccountOptionsHook.IWorkspaceAccountOption>,
    ) => {
        const activeOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption =
            {
                id: accountId,
                label: 'Grants Safe',
                account: safeAccount,
                isAllAccounts: false,
                isExternal: false,
                ...option,
            };

        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [activeOption],
            accountId,
            activeOption,
            isAllAccounts: false,
            scopedAccounts: [safeAccount],
            isPending: false,
        });
    };

    // The options are built from the workspace read, so none resolves the account until it lands.
    const mockUnresolvedOption = () =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [],
            accountId,
            activeOption: undefined,
            isAllAccounts: false,
            scopedAccounts: [],
            isPending: true,
        });

    beforeEach(() => {
        mockActiveOption();
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address,
                    owners: ['0x1111', '0x2222', '0x3333'],
                    threshold: 2,
                    nonce: '12',
                    version: '1.4.1',
                }),
            }),
        );
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        pendingListMock.mockClear();
        memberListMock.mockClear();
        assetListMock.mockClear();
        asideCardMock.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeDashboardPageClientProps>,
    ) => {
        const completeProps: IWorkspaceSafeDashboardPageClientProps = {
            workspaceId: 'demo',
            network: Network.ETHEREUM_SEPOLIA,
            address,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeDashboardPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the header with the name of the account and the threshold, owners and nonce of the Safe', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('heading', { level: 1, name: 'Grants Safe' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceSafeDashboardPage\.stats\.threshold/),
        ).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceSafeDashboardPage\.stats\.owners/),
        ).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceSafeDashboardPage\.stats\.nonce/),
        ).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('titles the page by the truncated address while no option resolves the account', () => {
        mockUnresolvedOption();
        render(createTestComponent());

        expect(
            screen.getByRole('heading', { level: 1, name: '0x1F01…132a' }),
        ).toBeInTheDocument();
    });

    it('renders the pending transactions of the Safe with its live configuration', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceSafeDashboardPage\.main\.pending\.title/,
            ),
        ).toBeInTheDocument();
        expect(pendingListMock).toHaveBeenCalledWith(
            {
                network: Network.ETHEREUM_SEPOLIA,
                address,
                currentNonce: '12',
                safeVersion: '1.4.1',
                threshold: 2,
            },
            undefined,
        );
    });

    it('hands the pending transactions no configuration while the Safe is read', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeServiceApi.useSafeInfo
            >,
        );
        render(createTestComponent());

        expect(pendingListMock).toHaveBeenCalledWith(
            expect.objectContaining({
                currentNonce: undefined,
                safeVersion: undefined,
                threshold: undefined,
            }),
            undefined,
        );
    });

    it('says the pending transactions are unavailable on a network the Safe service does not cover', () => {
        render(createTestComponent({ network: Network.CITREA_MAINNET }));

        expect(
            screen.getByText(
                /workspaceSafeDashboardPage\.main\.pending\.unavailable(?!Heading)/,
            ),
        ).toBeInTheDocument();
        expect(pendingListMock).not.toHaveBeenCalled();
        expect(useSafeInfoSpy).toHaveBeenCalledWith(expect.anything(), {
            enabled: false,
        });
        // The rest of the dashboard reads the workspace endpoints, which do not depend on the Safe service.
        expect(screen.getByTestId('member-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('asset-list-mock')).toBeInTheDocument();
    });

    it('previews the owners of the Safe without pagination, linking to its members page', () => {
        render(createTestComponent());

        expect(memberListMock).toHaveBeenCalledWith(
            {
                workspaceId: 'demo',
                accounts: [safeAccount],
                pageSize: 6,
                hidePagination: true,
            },
            undefined,
        );
        expect(
            screen.getByRole('link', { name: /viewAllMembers/ }),
        ).toHaveAttribute('href', `/workspace/demo/${accountId}/members`);
    });

    it('previews the assets of the Safe without pagination, linking to its assets page', () => {
        render(createTestComponent());

        expect(assetListMock).toHaveBeenCalledWith(
            {
                accounts: [{ network: Network.ETHEREUM_SEPOLIA, address }],
                pageSize: 3,
                isPending: false,
                hidePagination: true,
            },
            undefined,
        );
        expect(
            screen.getByRole('link', { name: /viewAllAssets/ }),
        ).toHaveAttribute('href', `/workspace/demo/${accountId}/assets`);
    });

    it('renders the Safe aside card of the account without stats, which the header states', () => {
        render(createTestComponent());

        expect(asideCardMock).toHaveBeenCalledWith(
            { account: safeAccount, title: 'Grants Safe', stats: [] },
            undefined,
        );
    });

    it('renders no aside card while the account is not resolved', () => {
        mockUnresolvedOption();
        render(createTestComponent());

        expect(asideCardMock).not.toHaveBeenCalled();
    });
});
