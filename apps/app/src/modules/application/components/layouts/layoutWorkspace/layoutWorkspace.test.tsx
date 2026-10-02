import { render, screen } from '@testing-library/react';
import { workspaceService } from '@/modules/workspace/api/workspaceService';
import type { IWorkspaceGateProps } from '@/modules/workspace/components/workspaceGate';
import type { INavigationWorkspaceProps } from '../../navigations/navigationWorkspace';
import { type ILayoutWorkspaceProps, LayoutWorkspace } from './layoutWorkspace';

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

    afterEach(() => {
        getWorkspaceSpy.mockReset();
    });

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

    it('renders the navigation inside the gate, so it never paints without a workspace', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('workspace-gate-mock')).toContainElement(
            screen.getByTestId('navigation-workspace-mock'),
        );
    });

    it('does not read the workspace registry, which is not available on the server', async () => {
        render(await createTestComponent());

        expect(getWorkspaceSpy).not.toHaveBeenCalled();
    });
});
