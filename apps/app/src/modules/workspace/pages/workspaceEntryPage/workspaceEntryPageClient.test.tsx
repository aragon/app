import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { StrictMode } from 'react';
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

describe('<WorkspaceEntryPageClient /> component', () => {
    const getOrCreateDefaultWorkspaceSpy = jest.spyOn(
        workspaceService,
        'getOrCreateDefaultWorkspace',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
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

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        getOrCreateDefaultWorkspaceSpy.mockReset();
        useRouterSpy.mockReset();
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

    it('renders a loading state while the workspace resolves', async () => {
        getOrCreateDefaultWorkspaceSpy.mockReturnValue(
            new Promise(() => undefined),
        );
        render(createTestComponent());

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await waitFor(() =>
            expect(getOrCreateDefaultWorkspaceSpy).toHaveBeenCalled(),
        );
    });

    it('replaces the route with the aggregated overview of the resolved workspace', async () => {
        getOrCreateDefaultWorkspaceSpy.mockResolvedValue(workspace);
        render(createTestComponent());

        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                `/workspace/${workspace.id}/all/overview`,
            ),
        );
    });

    it('resolves the workspace only once when Strict Mode re-runs the effect', async () => {
        getOrCreateDefaultWorkspaceSpy.mockResolvedValue(workspace);
        render(<StrictMode>{createTestComponent()}</StrictMode>);

        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
        expect(getOrCreateDefaultWorkspaceSpy).toHaveBeenCalledTimes(1);
    });

    it('invalidates the workspace list on success', async () => {
        const queryClient = new QueryClient();
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        getOrCreateDefaultWorkspaceSpy.mockResolvedValue(workspace);
        render(createTestComponent(undefined, queryClient));

        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
    });

    it('renders an error when the workspace cannot be resolved', async () => {
        getOrCreateDefaultWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceEntryPage\.error\.title$/),
        ).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
