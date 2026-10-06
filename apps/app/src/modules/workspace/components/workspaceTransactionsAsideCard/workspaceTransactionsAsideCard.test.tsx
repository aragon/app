import { render, screen } from '@testing-library/react';
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

describe('<WorkspaceTransactionsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const allCardMock = WorkspaceAllTransactionsAsideCard as jest.Mock;
    const daoCardMock = WorkspaceDaoTransactionsAsideCard as jest.Mock;

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

    // Not reachable through `useWorkspaceAccountOptions`, which makes an option of DAO accounts alone — this covers
    // the branch for the account type that gains an option before it gains a card. Such a type wants the option's
    // label as the card title, which is why the totals card keeps taking one.
    it('falls back to the aggregated card for account types with no card of their own', () => {
        render(
            createTestComponent({
                accounts: [safeAccount],
                activeOption: {
                    id: safeAccount.id,
                    label: 'Grants Safe',
                    account: safeAccount,
                    isAllAccounts: false,
                },
            }),
        );

        expect(screen.getByTestId('all-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('dao-card-mock')).not.toBeInTheDocument();
        expect(lastAllCardProps()).toEqual({
            accounts: [safeAccount],
            pageSize: 20,
        });
    });
});
