import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import * as blockNavigationContext from '@/shared/components/blockNavigationContext';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import {
    type IWorkspaceEditPageClientProps,
    WorkspaceEditPageClient,
} from './workspaceEditPageClient';

describe('<WorkspaceEditPageClient /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useBlockNavigationContextSpy = jest.spyOn(
        blockNavigationContext,
        'useBlockNavigationContext',
    );
    const openSpy = jest.fn();

    const workspace: IWorkspace = {
        id: 'demo',
        name: 'Demo Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
    };

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openSpy }),
        );
        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: false,
            setIsBlocked: jest.fn(),
        });
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useDialogContextSpy.mockReset();
        useBlockNavigationContextSpy.mockReset();
        openSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceEditPageClientProps>,
    ) => {
        const completeProps: IWorkspaceEditPageClientProps = {
            workspaceId: workspace.id,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceEditPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const clickNext = async () =>
        userEvent.click(
            screen.getByRole('button', { name: /wizard.footer.next/ }),
        );

    it('renders nothing until the workspace resolves, the gate above owning that state', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('opens the wizard on the details step, filled in from the workspace', async () => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        render(createTestComponent());

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: /workspaceEditPage.steps.METADATA.title/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: /createWorkspaceForm.metadata.name.label/,
            }),
        ).toHaveValue('Demo Workspace');
    });

    it('opens the wizard on the initial step when set', async () => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        render(
            createTestComponent({
                initialStep: WorkspaceWizardStep.ACCOUNTS,
            }),
        );

        expect(
            await screen.findByRole('heading', {
                level: 1,
                name: /workspaceEditPage.steps.ACCOUNTS.title/,
            }),
        ).toBeInTheDocument();
    });

    it('opens the update dialog with the edited values once the last step is submitted', async () => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        render(createTestComponent());

        const nameInput = await screen.findByRole('textbox', {
            name: /createWorkspaceForm.metadata.name.label/,
        });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Renamed');
        await clickNext();
        await clickNext();

        // The workspace holds no account, which the edit wizard accepts as is.
        expect(
            screen.queryByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).not.toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceEditPage.submitLabel/,
            }),
        );

        await waitFor(() =>
            expect(openSpy).toHaveBeenCalledWith(
                WorkspaceDialogId.PUBLISH_WORKSPACE,
                {
                    params: {
                        values: expect.objectContaining({ name: 'Renamed' }),
                        workspaceId: workspace.id,
                    },
                },
            ),
        );
    });
});
