import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import * as useResolveWorkspaceAvatarModule from '../../hooks/useResolveWorkspaceAvatar';
import {
    type IWorkspaceEditDetailsDialogProps,
    WorkspaceEditDetailsDialog,
} from './workspaceEditDetailsDialog';

describe('<WorkspaceEditDetailsDialog /> component', () => {
    const closeSpy = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const updateWorkspaceDetailsSpy = jest.spyOn(
        workspaceService,
        'updateWorkspaceDetails',
    );

    let workspace: IWorkspace;

    beforeEach(async () => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeSpy }),
        );
        workspace = await workspaceService.createWorkspace({
            body: {
                name: 'Demo',
                description: 'A demo workspace',
                avatar: null,
                links: [{ name: 'Site', url: 'https://example.org' }],
                accounts: [],
                targets: [],
            },
        });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        updateWorkspaceDetailsSpy.mockClear();
        closeSpy.mockClear();
        localStorage.clear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceEditDetailsDialogProps>,
    ) => {
        const completeProps: IWorkspaceEditDetailsDialogProps = {
            location: {
                id: 'WORKSPACE_EDIT_DETAILS',
                params: { workspaceId: workspace.id },
            },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <WorkspaceEditDetailsDialog {...completeProps} />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const getNameInput = () =>
        screen.findByRole('textbox', {
            name: /createWorkspaceForm.metadata.name.label/,
        });
    const getSaveButton = () =>
        screen.getByRole('button', {
            name: /workspaceEditDetailsDialog.action.save/,
        });

    it('prefills the form with the stored workspace details', async () => {
        render(createTestComponent());

        expect(await getNameInput()).toHaveValue('Demo');
        expect(
            screen.getByRole('textbox', {
                name: /createWorkspaceForm.metadata.description.label/,
            }),
        ).toHaveValue('A demo workspace');
    });

    it('saves the edited details and closes the dialog', async () => {
        render(createTestComponent());

        const nameInput = await getNameInput();
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Renamed');
        await userEvent.click(getSaveButton());

        await waitFor(() =>
            expect(updateWorkspaceDetailsSpy).toHaveBeenCalledWith({
                urlParams: { id: workspace.id },
                body: {
                    name: 'Renamed',
                    description: 'A demo workspace',
                    avatar: null,
                    links: [{ name: 'Site', url: 'https://example.org' }],
                },
            }),
        );
        await waitFor(() =>
            expect(closeSpy).toHaveBeenCalledWith('WORKSPACE_EDIT_DETAILS'),
        );
        await expect(
            workspaceService.getWorkspace({ urlParams: { id: workspace.id } }),
        ).resolves.toMatchObject({ name: 'Renamed' });
    });

    it('disables saving while the name is empty', async () => {
        render(createTestComponent());

        await userEvent.clear(await getNameInput());

        expect(getSaveButton()).toBeDisabled();
    });

    it('closes without saving on cancel', async () => {
        render(createTestComponent());
        await getNameInput();

        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceEditDetailsDialog.action.cancel/,
            }),
        );

        expect(closeSpy).toHaveBeenCalledWith('WORKSPACE_EDIT_DETAILS');
        expect(updateWorkspaceDetailsSpy).not.toHaveBeenCalled();
    });

    it('shows an error and stays open when the details cannot be saved', async () => {
        updateWorkspaceDetailsSpy.mockRejectedValueOnce(new Error('storage'));
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceEditDetailsDialog.action.save/,
            }),
        );

        expect(
            await screen.findByText(
                'app.workspace.workspaceEditDetailsDialog.error.title',
            ),
        ).toBeInTheDocument();
        expect(closeSpy).not.toHaveBeenCalled();
    });

    it('disables saving while the avatar is being uploaded', async () => {
        const useResolveWorkspaceAvatarSpy = jest
            .spyOn(useResolveWorkspaceAvatarModule, 'useResolveWorkspaceAvatar')
            .mockReturnValue(() => new Promise(() => undefined));
        render(createTestComponent());
        await getNameInput();

        await userEvent.click(getSaveButton());

        await waitFor(() => expect(getSaveButton()).toBeDisabled());
        expect(updateWorkspaceDetailsSpy).not.toHaveBeenCalled();
        useResolveWorkspaceAvatarSpy.mockRestore();
    });

    it('stacks the fields of each link with a remove button', async () => {
        render(createTestComponent());
        await getNameInput();

        expect(
            screen.getByRole('button', {
                name: /resourcesInput.item.removeResource/,
            }),
        ).toBeInTheDocument();
    });
});
