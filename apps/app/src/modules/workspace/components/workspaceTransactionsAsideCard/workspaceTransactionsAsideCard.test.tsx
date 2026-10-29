import { render, screen } from '@testing-library/react';
import { DispatchPanel } from '@/modules/capitalFlow/components/dispatchPanel/dispatchPanel';
import { Network } from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider/featureFlagsProvider';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import type * as allCardModule from './workspaceAllTransactionsAsideCard';
import { WorkspaceAllTransactionsAsideCard } from './workspaceAllTransactionsAsideCard';
import type * as daoCardModule from './workspaceDaoTransactionsAsideCard';
import { WorkspaceDaoTransactionsAsideCard } from './workspaceDaoTransactionsAsideCard';
import type * as safeCardModule from './workspaceSafeTransactionsAsideCard';
import { WorkspaceSafeTransactionsAsideCard } from './workspaceSafeTransactionsAsideCard';
import {
    type IWorkspaceTransactionsAsideCardProps,
    WorkspaceTransactionsAsideCard,
} from './workspaceTransactionsAsideCard';

jest.mock('./workspaceAllTransactionsAsideCard', () => ({
    WorkspaceAllTransactionsAsideCard: jest.fn(() => (
        <div data-testid="all-card-mock" />
    )),
}));

jest.mock('./workspaceDaoTransactionsAsideCard', () => ({
    WorkspaceDaoTransactionsAsideCard: jest.fn(() => (
        <div data-testid="dao-card-mock" />
    )),
}));

jest.mock('./workspaceSafeTransactionsAsideCard', () => ({
    WorkspaceSafeTransactionsAsideCard: jest.fn(() => (
        <div data-testid="safe-card-mock" />
    )),
}));

jest.mock(
    '@/modules/capitalFlow/components/dispatchPanel/dispatchPanel',
    () => ({
        DispatchPanel: jest.fn(() => <div data-testid="dispatch-panel-mock" />),
    }),
);

describe('<WorkspaceTransactionsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const allCardMock = WorkspaceAllTransactionsAsideCard as jest.Mock;
    const daoCardMock = WorkspaceDaoTransactionsAsideCard as jest.Mock;
    const safeCardMock = WorkspaceSafeTransactionsAsideCard as jest.Mock;
    const dispatchPanelMock = DispatchPanel as jest.Mock;

    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe' },
    };

    const daoOption: IWorkspaceAccountOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
    };

    const safeOption: IWorkspaceAccountOption = {
        id: safeAccount.id,
        label: 'Grants Safe',
        account: safeAccount,
        isAllAccounts: false,
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    beforeEach(() => {
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            isEnabled: () => false,
            setOverride: jest.fn(),
        });
    });

    afterEach(() => {
        allCardMock.mockClear();
        daoCardMock.mockClear();
        safeCardMock.mockClear();
        dispatchPanelMock.mockClear();
        useFeatureFlagsSpy.mockReset();
    });

    const lastAllCardProps = () =>
        allCardMock.mock.calls.at(-1)?.[0] as
            | allCardModule.IWorkspaceAllTransactionsAsideCardProps
            | undefined;

    const lastDaoCardProps = () =>
        daoCardMock.mock.calls.at(-1)?.[0] as
            | daoCardModule.IWorkspaceDaoTransactionsAsideCardProps
            | undefined;

    const lastSafeCardProps = () =>
        safeCardMock.mock.calls.at(-1)?.[0] as
            | safeCardModule.IWorkspaceSafeTransactionsAsideCardProps
            | undefined;

    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceTransactionsAsideCardProps = {
            accounts: [daoAccount, safeAccount],
            pageSize: 20,
            ...props,
        };

        return <WorkspaceTransactionsAsideCard {...completeProps} />;
    };

    it('renders the aggregated card titled generically when no account is selected', () => {
        render(createTestComponent());

        expect(screen.getByTestId('all-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('dao-card-mock')).not.toBeInTheDocument();
        expect(lastAllCardProps()).toEqual({
            accounts: [daoAccount, safeAccount],
            pageSize: 20,
        });
    });

    // The aggregated option carries a label of its own, but it describes the workspace rather than an account.
    it('treats the aggregated option like no selection', () => {
        render(createTestComponent({ activeOption: allAccountsOption }));

        expect(screen.getByTestId('all-card-mock')).toBeInTheDocument();
        expect(lastAllCardProps()?.title).toBeUndefined();
        expect(screen.queryByTestId('dao-card-mock')).not.toBeInTheDocument();
    });

    it('renders the DAO card when the selected account is a DAO', () => {
        render(
            createTestComponent({
                accounts: [daoAccount],
                activeOption: daoOption,
            }),
        );

        expect(screen.getByTestId('dao-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('all-card-mock')).not.toBeInTheDocument();
        expect(lastDaoCardProps()).toEqual({
            account: daoAccount,
            label: 'Demo DAO',
            pageSize: 20,
        });
    });

    it('renders the Safe card when the selected account is a Safe', () => {
        render(
            createTestComponent({
                accounts: [safeAccount],
                activeOption: safeOption,
            }),
        );

        expect(screen.getByTestId('safe-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('all-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('dao-card-mock')).not.toBeInTheDocument();
        expect(lastSafeCardProps()).toEqual({
            account: safeAccount,
            label: 'Grants Safe',
            pageSize: 20,
        });
    });

    describe('dispatch panel', () => {
        const enableAutomation = () =>
            useFeatureFlagsSpy.mockReturnValue({
                snapshot: [],
                isEnabled: (flag) => flag === 'capitalFlowAutomation',
                setOverride: jest.fn(),
            });

        it('renders no dispatch panel for a Safe account', () => {
            enableAutomation();
            render(
                createTestComponent({
                    accounts: [safeAccount],
                    activeOption: safeOption,
                }),
            );

            expect(
                screen.queryByTestId('dispatch-panel-mock'),
            ).not.toBeInTheDocument();
            expect(dispatchPanelMock).not.toHaveBeenCalled();
        });

        it('renders the dispatch panel for a DAO account', () => {
            enableAutomation();
            render(
                createTestComponent({
                    accounts: [daoAccount],
                    activeOption: daoOption,
                }),
            );

            expect(
                screen.getByTestId('dispatch-panel-mock'),
            ).toBeInTheDocument();
            expect(dispatchPanelMock.mock.calls.at(-1)?.[0]).toEqual({
                daoAddress,
                network: daoAccount.network,
            });
        });
    });
});
