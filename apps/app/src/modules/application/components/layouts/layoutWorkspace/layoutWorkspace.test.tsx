import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import * as WorkspaceServiceModule from '@/modules/workspace/api/workspaceService';
import { workspaceService } from '@/modules/workspace/api/workspaceService';
import type { IWorkspaceGateProps } from '@/modules/workspace/components/workspaceGate';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { featureFlags } from '@/shared/featureFlags';
import type { INavigationWorkspaceProps } from '../../navigations/navigationWorkspace';
import { type ILayoutWorkspaceProps, LayoutWorkspace } from './layoutWorkspace';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
}));

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('../../supportChat', () => ({
    SupportChatLauncher: () => <div data-testid="support-chat-launcher-mock" />,
}));

jest.mock('../../navigations/navigationWorkspace', () => ({
    NavigationWorkspace: (props: INavigationWorkspaceProps) => (
        <div data-testid="navigation-workspace-mock">{props.workspaceId}</div>
    ),
}));

// The gate reads the workspace registry through React Query, which is the subject of its own tests. Rendering it
// here would need a query client and would make the registry assertion below report the gate's read instead of
// the layout's.
jest.mock('@/modules/workspace/components/workspaceGate', () => ({
    WorkspaceGate: (props: IWorkspaceGateProps) => (
        <div data-testid="workspace-gate-mock">{props.children}</div>
    ),
}));

describe('<LayoutWorkspace /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const useWorkspaceSpy = jest.spyOn(WorkspaceServiceModule, 'useWorkspace');
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
        isEnabledSpy.mockResolvedValue(true);
        useWorkspaceSpy.mockReturnValue({
            status: 'success',
            error: null,
        } as ReturnType<typeof WorkspaceServiceModule.useWorkspace>);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        fetchQuerySpy.mockReset();
        isEnabledSpy.mockReset();
        useWorkspaceSpy.mockReset();
        notFoundMock.mockClear();
    });

    // Query options carry a fresh queryFn per call, so the key is what identifies the read. `prefetchQuery` passes
    // its options straight to `fetchQuery`, which is what is spied here.
    const prefetchedKeys = () =>
        fetchQuerySpy.mock.calls.map(
            ([options]) => (options as { queryKey: unknown[] }).queryKey,
        );

    const createTestComponent = async (
        props?: Partial<ILayoutWorkspaceProps>,
    ) => {
        const completeProps: ILayoutWorkspaceProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };

        return await LayoutWorkspace(completeProps);
    };

    // The pages check the flag too, but this layout renders around their 404, navigation included.
    it('renders the 404 page without reading anything when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(fetchQuerySpy).not.toHaveBeenCalled();
    });

    it('renders the workspace navigation for the workspace of the url parameters', async () => {
        render(await createTestComponent());

        expect(
            screen.getByTestId('navigation-workspace-mock'),
        ).toHaveTextContent('demo');
    });

    it('renders the page below the navigation', async () => {
        render(
            await createTestComponent({
                children: <div data-testid="page-mock" />,
            }),
        );

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    it('renders the navigation outside the gate once the workspace has loaded', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('workspace-gate-mock')).not.toContainElement(
            screen.getByTestId('navigation-workspace-mock'),
        );
    });

    // A link to a missing workspace would otherwise flash a navigation before its gate state replaces the spinner.
    it('renders no navigation while the workspace is loading', async () => {
        useWorkspaceSpy.mockReturnValue({
            status: 'pending',
            error: null,
        } as ReturnType<typeof WorkspaceServiceModule.useWorkspace>);
        render(await createTestComponent());

        expect(
            screen.queryByTestId('navigation-workspace-mock'),
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('workspace-gate-mock')).toBeInTheDocument();
    });

    // A missing workspace has nothing to navigate: its selectors would be empty and its links lead nowhere.
    it('drops the navigation and its footer marker once the workspace is confirmed not to exist, leaving the gate', async () => {
        useWorkspaceSpy.mockReturnValue({
            status: 'error',
            error: new AragonBackendServiceError(
                AragonBackendServiceError.notFoundCode,
                'Workspace not found',
                404,
            ),
        } as unknown as ReturnType<typeof WorkspaceServiceModule.useWorkspace>);
        const { container } = render(
            await createTestComponent({
                children: <div data-testid="page-mock" />,
            }),
        );

        expect(
            screen.queryByTestId('navigation-workspace-mock'),
        ).not.toBeInTheDocument();
        // Without the marker, the root layout shows the page footer the sidebar would have replaced.
        expect(container.querySelector('[data-app-sidebar]')).toBeNull();
        expect(screen.getByTestId('workspace-gate-mock')).toBeInTheDocument();
    });

    it('keeps the navigation when the workspace failed to load for another reason', async () => {
        useWorkspaceSpy.mockReturnValue({
            status: 'error',
            error: new Error('storage unavailable'),
        } as unknown as ReturnType<typeof WorkspaceServiceModule.useWorkspace>);
        const { container } = render(await createTestComponent());

        expect(
            screen.getByTestId('navigation-workspace-mock'),
        ).toBeInTheDocument();
        expect(container.querySelector('[data-app-sidebar]')).not.toBeNull();
    });

    it('gates the page and not the navigation', async () => {
        render(
            await createTestComponent({
                children: <div data-testid="page-mock" />,
            }),
        );

        expect(screen.getByTestId('workspace-gate-mock')).toContainElement(
            screen.getByTestId('page-mock'),
        );
    });

    it('does not read the workspace registry, which is not available on the server', async () => {
        render(await createTestComponent());

        expect(getWorkspaceSpy).not.toHaveBeenCalled();
    });

    // The tabs of the aggregated pages are validated against the URL parameter at mount only, so a body the CMS
    // hides must never be offered as one — not even for the tick before the overrides land.
    it('prefetches the CMS overrides for the pages below', async () => {
        await createTestComponent();

        expect(prefetchedKeys()).toContainEqual(daoOverridesOptions().queryKey);
    });

    it('hydrates what it prefetched for the pages below', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });
});
