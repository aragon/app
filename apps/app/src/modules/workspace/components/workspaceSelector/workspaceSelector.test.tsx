import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import {
    type IWorkspaceSelectorProps,
    WorkspaceSelector,
} from './workspaceSelector';

describe('<WorkspaceSelector /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const pushMock = jest.fn();
    const importWorkspaceSpy = jest.spyOn(workspaceService, 'importWorkspace');
    const alertSpy = jest.spyOn(window, 'alert');

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'first',
        name: 'First Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
        ...workspace,
    });

    const firstWorkspace = buildWorkspace();
    const secondWorkspace = buildWorkspace({
        id: 'second',
        name: 'Second Workspace',
    });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(firstWorkspace);
        getWorkspaceListSpy.mockResolvedValue([
            firstWorkspace,
            secondWorkspace,
        ]);
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue('/workspace/first/all/proposals');
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getWorkspaceListSpy.mockReset();
        useRouterSpy.mockReset();
        usePathnameSpy.mockReset();
        pushMock.mockReset();
        importWorkspaceSpy.mockReset();
        alertSpy.mockReset();
    });

    let queryClient: QueryClient;

    const createTestComponent = (props?: Partial<IWorkspaceSelectorProps>) => {
        queryClient = new QueryClient(queryClientConfig);

        const completeProps: IWorkspaceSelectorProps = {
            workspaceId: firstWorkspace.id,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={queryClient}>
                    <WorkspaceSelector {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const openDropdown = async () =>
        userEvent.click(
            await screen.findByRole('button', { name: /First Workspace/ }),
        );

    it('displays the current workspace on the trigger', async () => {
        render(createTestComponent());

        expect(
            await screen.findByRole('button', { name: /First Workspace/ }),
        ).toBeInTheDocument();
    });

    it('lists every workspace followed by the create workspace item', async () => {
        getWorkspaceListSpy.mockResolvedValue([
            firstWorkspace,
            secondWorkspace,
            buildWorkspace({ id: 'third', name: 'Third Workspace' }),
        ]);
        render(createTestComponent());

        await openDropdown();

        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(5);
        expect(items[0]).toHaveTextContent('First Workspace');
        expect(items[1]).toHaveTextContent('Second Workspace');
        expect(items[2]).toHaveTextContent('Third Workspace');
        expect(items[3]).toHaveTextContent(/workspaceSelector\.create$/);
        expect(items[4]).toHaveTextContent(/workspaceSelector\.import$/);
    });

    it('opens the overview of the selected workspace', async () => {
        render(createTestComponent());

        await openDropdown();
        await userEvent.click(await screen.findByText('Second Workspace'));

        expect(pushMock).toHaveBeenCalledWith('/workspace/second/all/overview');
    });

    it('opens the create workspace wizard with the current page to return to', async () => {
        render(createTestComponent());

        await openDropdown();
        await userEvent.click(
            await screen.findByText(/workspaceSelector\.create$/),
        );

        expect(pushMock).toHaveBeenCalledWith(
            '/create/workspace?returnTo=%2Fworkspace%2Ffirst%2Fall%2Fproposals',
        );
    });

    describe('workspace import', () => {
        const getFileInput = () =>
            screen.getByLabelText('app.workspace.workspaceSelector.import');

        // jsdom implements no `Blob.text`, which the browser reads the file with.
        const buildFile = (content: string) => {
            const file = new File([content], 'workspace.json', {
                type: 'application/json',
            });
            file.text = () => Promise.resolve(content);

            return file;
        };

        it('opens the file picker from the import workspace item', async () => {
            render(createTestComponent());
            const clickSpy = jest.spyOn(getFileInput(), 'click');

            await openDropdown();
            await userEvent.click(
                await screen.findByText(/workspaceSelector\.import$/),
            );

            expect(clickSpy).toHaveBeenCalledTimes(1);
        });

        it('imports the selected file and opens the imported workspace', async () => {
            const imported = buildWorkspace({
                id: 'imported',
                name: 'Imported',
            });
            importWorkspaceSpy.mockResolvedValue(imported);
            render(createTestComponent());

            await userEvent.upload(getFileInput(), buildFile('{"version":1}'));

            await waitFor(() =>
                expect(importWorkspaceSpy).toHaveBeenCalledWith(
                    '{"version":1}',
                ),
            );
            await waitFor(() =>
                expect(pushMock).toHaveBeenCalledWith(
                    '/workspace/imported/all/overview',
                ),
            );
        });

        it('lists the imported workspace', async () => {
            const imported = buildWorkspace({
                id: 'imported',
                name: 'Imported Workspace',
            });
            importWorkspaceSpy.mockResolvedValue(imported);
            render(createTestComponent());
            await openDropdown();
            expect(
                await screen.findByRole('menuitem', {
                    name: /Second Workspace/,
                }),
            ).toBeInTheDocument();
            await userEvent.keyboard('{Escape}');

            getWorkspaceListSpy.mockResolvedValue([
                firstWorkspace,
                secondWorkspace,
                imported,
            ]);
            await userEvent.upload(getFileInput(), buildFile('{"version":1}'));
            await waitFor(() => expect(pushMock).toHaveBeenCalled());
            await openDropdown();

            expect(
                await screen.findByRole('menuitem', {
                    name: /Imported Workspace/,
                }),
            ).toBeInTheDocument();
        });

        it('alerts and stays on the page when the file cannot be imported', async () => {
            importWorkspaceSpy.mockRejectedValue(new Error('invalid'));
            alertSpy.mockImplementation(jest.fn());
            render(createTestComponent());

            await userEvent.upload(getFileInput(), buildFile('{'));

            await waitFor(() =>
                expect(importWorkspaceSpy).toHaveBeenCalledWith('{'),
            );
            await waitFor(() =>
                expect(alertSpy).toHaveBeenCalledWith(
                    'app.workspace.workspaceSelector.importError',
                ),
            );
            expect(pushMock).not.toHaveBeenCalled();
        });
    });
});
