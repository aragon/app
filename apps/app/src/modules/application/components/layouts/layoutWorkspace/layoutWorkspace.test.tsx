import { render, screen } from '@testing-library/react';
import { workspaceService } from '@/modules/workspace/api/workspaceService';
import type { INavigationWorkspaceProps } from '../../navigations/navigationWorkspace';
import { type ILayoutWorkspaceProps, LayoutWorkspace } from './layoutWorkspace';

jest.mock('../../navigations/navigationWorkspace', () => ({
    NavigationWorkspace: (props: INavigationWorkspaceProps) => (
        <div data-testid="navigation-workspace-mock">{props.workspaceId}</div>
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

    it('does not read the workspace registry, which is not available on the server', async () => {
        render(await createTestComponent());

        expect(getWorkspaceSpy).not.toHaveBeenCalled();
    });
});
