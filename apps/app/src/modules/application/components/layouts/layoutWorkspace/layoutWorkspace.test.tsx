import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { workspaceService } from '@/modules/workspace/api/workspaceService';
import type { IWorkspaceGateProps } from '@/modules/workspace/components/workspaceGate';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import type { INavigationWorkspaceProps } from '../../navigations/navigationWorkspace';
import { type ILayoutWorkspaceProps, LayoutWorkspace } from './layoutWorkspace';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
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
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        fetchQuerySpy.mockReset();
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

    it('renders the navigation outside the gate, so it is navigable while the workspace loads', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('workspace-gate-mock')).not.toContainElement(
            screen.getByTestId('navigation-workspace-mock'),
        );
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
