import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceTodoListProps } from '../../components/workspaceTodoList';
import type { IWorkspaceTodosAsideCardProps } from '../../components/workspaceTodosAsideCard';
import type { IUseWorkspaceAccountOptionsResult } from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceTodosPageClientProps,
    WorkspaceTodosPageClient,
} from './workspaceTodosPageClient';

// The list is tested on its own; here it only needs to say what it was asked for.
jest.mock('../../components/workspaceTodoList', () => ({
    WorkspaceTodoList: (props: IWorkspaceTodoListProps) => (
        <p>{`list ${props.workspaceId} ${props.accounts.map((account) => account.id).join(',')} ${props.isPending ? 'pending' : 'ready'} ${props.viewAllHref ?? 'paginated'}`}</p>
    ),
}));

jest.mock('../../components/workspaceTodosAsideCard', () => ({
    WorkspaceTodosAsideCard: (props: IWorkspaceTodosAsideCardProps) => (
        <p>{`aside ${props.accounts.map((account) => account.id).join(',')} ${props.title ?? 'untitled'}`}</p>
    ),
}));

describe('<WorkspaceTodosPageClient /> component', () => {
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );

    const account: IWorkspaceAccount = {
        id: 'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        type: WorkspaceAccountType.DAO,
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        network: Network.ETHEREUM_SEPOLIA,
    };

    const mockOptions = (result?: Partial<IUseWorkspaceAccountOptionsResult>) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [],
            accountId: 'all',
            isAllAccounts: true,
            scopedAccounts: [account],
            isPending: false,
            ...result,
        });

    beforeEach(() => {
        mockOptions();
    });

    afterEach(() => {
        useWorkspaceAccountOptionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodosPageClientProps>,
    ) => {
        const completeProps: IWorkspaceTodosPageClientProps = {
            workspaceId: 'demo',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodosPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the page title', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodosPage\.main\.title$/),
        ).toBeInTheDocument();
    });

    it('lists the to-dos of the accounts of the route scope, paginated', () => {
        render(createTestComponent());

        expect(
            screen.getByText(`list demo ${account.id} ready paginated`),
        ).toBeInTheDocument();
    });

    it('keeps the list loading and the aside back while the scope resolves', () => {
        mockOptions({ scopedAccounts: [], isPending: true });
        render(createTestComponent());

        expect(screen.getByText(/^list demo\s+pending/)).toBeInTheDocument();
        expect(screen.queryByText(/^aside/)).not.toBeInTheDocument();
    });

    it('summarises the to-dos of the whole workspace on the aside', () => {
        render(createTestComponent());

        expect(
            screen.getByText(`aside ${account.id} untitled`),
        ).toBeInTheDocument();
    });

    it('titles the aside with the account the route is scoped to', () => {
        mockOptions({
            accountId: account.id,
            isAllAccounts: false,
            activeOption: {
                id: account.id,
                label: 'Demo DAO',
                account,
                isAllAccounts: false,
                isExternal: false,
            },
        });
        render(createTestComponent());

        expect(
            screen.getByText(`aside ${account.id} Demo DAO`),
        ).toBeInTheDocument();
    });
});
