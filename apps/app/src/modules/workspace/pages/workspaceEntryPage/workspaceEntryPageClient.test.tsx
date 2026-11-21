import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import * as useWalletConnectedModule from '@/modules/application/hooks/useWalletConnected';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    type IWorkspaceEntryPageClientProps,
    WorkspaceEntryPageClient,
} from './workspaceEntryPageClient';

jest.mock('./workspaceGettingStarted', () => ({
    WorkspaceGettingStarted: () => <div>getting started</div>,
}));

describe('<WorkspaceEntryPageClient /> component', () => {
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useWalletConnectedSpy = jest.spyOn(
        useWalletConnectedModule,
        'useWalletConnected',
    );
    const replaceMock = jest.fn();

    const workspace: IWorkspace = {
        id: 'my-workspace-1a2b3c4d',
        name: 'My workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
    };

    const mockWallet = (
        state: {
            isConnected: boolean;
            isReconnecting?: boolean;
            address?: string;
        } = { isConnected: true },
    ) => {
        useWalletConnectedSpy.mockReturnValue(state.isConnected);
        useWalletAccountSpy.mockReturnValue({
            address: state.address ?? (state.isConnected ? '0x123' : undefined),
            isConnecting: false,
            isReconnecting: state.isReconnecting ?? false,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
    };

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
        mockWallet();
    });

    afterEach(() => {
        getWorkspaceListSpy.mockReset();
        useRouterSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useWalletConnectedSpy.mockReset();
        replaceMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceEntryPageClientProps>,
        queryClient = new QueryClient(),
    ) => {
        const completeProps: IWorkspaceEntryPageClientProps = { ...props };

        return (
            <ReactQueryWrapper client={queryClient}>
                <WorkspaceEntryPageClient {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders nothing while the workspace list loads', () => {
        getWorkspaceListSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('replaces the route with the aggregated overview of the first workspace, wallet or not', async () => {
        mockWallet({ isConnected: false });
        getWorkspaceListSpy.mockResolvedValue([
            workspace,
            { ...workspace, id: 'other' },
        ]);
        render(createTestComponent());

        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                `/workspace/${workspace.id}/all/overview`,
            ),
        );
        expect(replaceMock).toHaveBeenCalledTimes(1);
    });

    it('shows that the workspace is opening while the redirect to it loads', async () => {
        mockWallet({ isConnected: false });
        getWorkspaceListSpy.mockResolvedValue([workspace]);
        render(createTestComponent());

        expect(await screen.findByRole('status')).toHaveTextContent(
            'app.workspace.workspaceEntryPage.opening',
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('replaces the route with the landing page when there is no workspace and no wallet', async () => {
        mockWallet({ isConnected: false });
        getWorkspaceListSpy.mockResolvedValue([]);
        render(createTestComponent());

        await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/'));
        expect(screen.queryByText('getting started')).not.toBeInTheDocument();
    });

    it('waits for the wallet to settle before deciding', async () => {
        mockWallet({ isConnected: false, isReconnecting: true });
        getWorkspaceListSpy.mockResolvedValue([]);
        const queryClient = new QueryClient();
        queryClient.setQueryData(workspaceServiceKeys.workspaceList(), []);
        const { rerender } = render(
            createTestComponent(undefined, queryClient),
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();

        mockWallet({ isConnected: true });
        rerender(createTestComponent(undefined, queryClient));

        expect(await screen.findByText('getting started')).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('renders Getting started when there is no workspace and a wallet', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        render(createTestComponent());

        expect(await screen.findByText('getting started')).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('keeps Getting started on a disconnect, leaving the redirect to it', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        const { rerender } = render(createTestComponent());
        await screen.findByText('getting started');

        mockWallet({ isConnected: false });
        rerender(createTestComponent());

        expect(screen.getByText('getting started')).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('waits for AppKit to catch up with a wallet wagmi already restored', async () => {
        mockWallet({ isConnected: false, address: '0x123' });
        getWorkspaceListSpy.mockResolvedValue([]);
        const queryClient = new QueryClient();
        queryClient.setQueryData(workspaceServiceKeys.workspaceList(), []);
        render(createTestComponent(undefined, queryClient));

        await waitFor(() => expect(getWorkspaceListSpy).toHaveBeenCalled());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('does not redirect when the workspace Getting started creates reaches the list', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        const queryClient = new QueryClient();
        const { rerender } = render(
            createTestComponent(undefined, queryClient),
        );
        await screen.findByText('getting started');

        queryClient.setQueryData(workspaceServiceKeys.workspaceList(), [
            workspace,
        ]);
        rerender(createTestComponent(undefined, queryClient));

        expect(screen.getByText('getting started')).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('renders an error when the workspace list fails to load', async () => {
        getWorkspaceListSpy.mockRejectedValue(new Error('failed'));
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        render(createTestComponent(undefined, queryClient));

        expect(
            await screen.findByText(/workspaceEntryPage\.error\.title$/),
        ).toBeInTheDocument();
        expect(screen.queryByText('getting started')).not.toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
