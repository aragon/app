import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import type { IWorkspaceTodoContentProps } from '../../components/workspaceTodoList';
import type { IUseWorkspaceAccountOptionsResult } from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceTodosPageClientProps,
    WorkspaceTodosPageClient,
} from './workspaceTodosPageClient';

// The content is tested on its own; here it only needs to say which accounts and kind it was asked for.
jest.mock('../../components/workspaceTodoList', () => ({
    ...jest.requireActual('../../components/workspaceTodoList'),
    WorkspaceTodoContent: (props: IWorkspaceTodoContentProps) => (
        <p>{`content ${props.filter ?? ''} ${props.accounts.map((account) => account.id).join(',')} ${props.workspaceName} ${props.isAccountsPending ? 'pending' : 'ready'}`}</p>
    ),
}));

describe('<WorkspaceTodosPageClient /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
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
    const workspace: IWorkspace = {
        id: 'demo',
        name: 'Demo workspace',
        description: '',
        avatar: null,
        links: [],
        targets: [],
        accounts: [account],
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
        getWorkspaceSpy.mockResolvedValue(workspace);
        getAccountsSpy.mockResolvedValue([]);
        mockOptions();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
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
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceTodosPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders the title and the kind filters, every kind selected by default', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodosPage\.main\.title$/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', {
                name: /workspaceTodosPage\.filter\.all$/,
            }),
        ).toBeChecked();
        expect(
            screen.getByRole('radio', {
                name: /workspaceTodosPage\.filter\.proposals$/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', {
                name: /workspaceTodosPage\.filter\.transactions$/,
            }),
        ).toBeInTheDocument();
    });

    it('hands the accounts of the route scope and the workspace name to the content', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(
                screen.getByText(
                    `content all ${account.id} Demo workspace ready`,
                ),
            ).toBeInTheDocument(),
        );
    });

    it('keeps the content loading while the scope resolves', () => {
        mockOptions({ scopedAccounts: [], isPending: true });
        render(createTestComponent());

        expect(screen.getByText(/^content all .*pending$/)).toBeInTheDocument();
    });

    it('filters the content on the selected kind', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('radio', {
                name: /workspaceTodosPage\.filter\.transactions$/,
            }),
        );

        expect(screen.getByText(/^content transactions /)).toBeInTheDocument();
    });
});
