import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import { type IWorkspaceGateProps, WorkspaceGate } from './workspaceGate';

describe('<WorkspaceGate /> component', () => {
    const owner = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');

    // The gate only cares whether the workspace resolves, not what it holds.
    const buildWorkspace = (): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner,
        accounts: [],
        targets: [],
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceGateProps>) => {
        const completeProps: IWorkspaceGateProps = {
            workspaceId: 'demo',
            children: <div data-testid="page-mock" />,
            ...props,
        };

        return (
            <ReactQueryWrapper client={new QueryClient()}>
                <WorkspaceGate {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders the page once the workspace has loaded', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        render(createTestComponent());

        expect(await screen.findByTestId('page-mock')).toBeInTheDocument();
    });

    it('holds the page back behind a loading state while the workspace loads', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });

    it('renders an error instead of the page when the workspace fails to load', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceGate\.error\.title$/),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });
});
