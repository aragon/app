import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { WorkspaceAdminAccounts } from './workspaceAdminAccounts';
import {
    type IWorkspaceAdminPageClientProps,
    WorkspaceAdminPageClient,
} from './workspaceAdminPageClient';

jest.mock('./workspaceAdminAccounts', () => ({
    WorkspaceAdminAccounts: jest.fn(() => <div>accounts-mock</div>),
}));

describe('<WorkspaceAdminPageClient /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const exportWorkspaceSpy = jest.spyOn(workspaceService, 'exportWorkspace');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const openSpy = jest.fn();

    const workspace: IWorkspace = {
        id: 'demo',
        name: 'Demo',
        description: 'A demo workspace',
        avatar: null,
        links: [
            { name: 'Site', url: 'https://example.org' },
            { name: 'Forum', url: 'https://forum.example.org' },
        ],
        accounts: [],
        targets: [],
    };

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openSpy }),
        );
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        exportWorkspaceSpy.mockReset();
        useDialogContextSpy.mockReset();
        openSpy.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAdminPageClientProps>,
    ) => {
        const completeProps: IWorkspaceAdminPageClientProps = {
            workspaceId: 'demo',
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceAdminPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const renderWorkspace = async (value: IWorkspace = workspace) => {
        getWorkspaceSpy.mockResolvedValue(value);
        render(createTestComponent());
        await screen.findByRole('heading', {
            level: 1,
            name: 'app.workspace.workspaceAdminPage.title',
        });
    };

    it('renders nothing until the workspace resolves, the gate above owning that state', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the accounts of the workspace', async () => {
        await renderWorkspace();

        expect(screen.getByText('accounts-mock')).toBeInTheDocument();
        expect(WorkspaceAdminAccounts).toHaveBeenCalledWith(
            { workspace },
            undefined,
        );
    });

    describe('details', () => {
        it('displays the name, description and links of the workspace', async () => {
            await renderWorkspace();

            expect(screen.getByText('Demo')).toBeInTheDocument();
            expect(screen.getByText('A demo workspace')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Site/ })).toHaveAttribute(
                'href',
                'https://example.org',
            );
            expect(
                screen.getByRole('link', { name: /Forum/ }),
            ).toBeInTheDocument();
        });

        it('displays a placeholder for an empty description and no links row without links', async () => {
            await renderWorkspace({ ...workspace, description: '', links: [] });

            expect(
                screen.getByText(
                    'app.workspace.workspaceAdminPage.details.noDescription',
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByText(
                    'app.workspace.workspaceAdminPage.details.links',
                ),
            ).not.toBeInTheDocument();
        });

        it('displays every link, even when two links share a URL', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(jest.fn());
            await renderWorkspace({
                ...workspace,
                links: [
                    { name: 'Docs', url: 'https://example.org' },
                    { name: 'Home', url: 'https://example.org' },
                ],
            });

            expect(
                screen.getByRole('link', { name: /Docs/ }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('link', { name: /Home/ }),
            ).toBeInTheDocument();
            expect(consoleErrorSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('same key'),
                expect.anything(),
            );
            consoleErrorSpy.mockRestore();
        });

        it('opens the edit details dialog for the workspace', async () => {
            await renderWorkspace();

            await userEvent.click(
                screen.getByRole('button', {
                    name: 'app.workspace.workspaceAdminPage.details.edit',
                }),
            );

            expect(openSpy).toHaveBeenCalledWith(
                WorkspaceDialogId.EDIT_DETAILS,
                { params: { workspaceId: 'demo' } },
            );
        });
    });

    describe('storage', () => {
        // jsdom implements neither, so they are stubbed for this block and restored after it.
        const { createObjectURL, revokeObjectURL } = URL;
        const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click');

        beforeEach(() => {
            URL.createObjectURL = jest.fn(() => 'blob:workspace');
            URL.revokeObjectURL = jest.fn();
        });

        afterEach(() => {
            clickSpy.mockReset();
        });

        afterAll(() => {
            URL.createObjectURL = createObjectURL;
            URL.revokeObjectURL = revokeObjectURL;
            clickSpy.mockRestore();
        });

        it('displays the workspace as unpublished and stored locally', async () => {
            await renderWorkspace();

            expect(
                screen.getByText(
                    'app.workspace.workspaceAdminPage.storage.published.value',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.workspace.workspaceAdminPage.storage.sync.value',
                ),
            ).toBeInTheDocument();
        });

        it('downloads the workspace export as a JSON file named after the workspace', async () => {
            exportWorkspaceSpy.mockResolvedValue('{"version":1}');
            let download: string | undefined;
            clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
                download = this.download;
            });
            await renderWorkspace();

            await userEvent.click(
                screen.getByRole('button', {
                    name: 'app.workspace.workspaceAdminPage.storage.export',
                }),
            );

            await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
            expect(exportWorkspaceSpy).toHaveBeenCalledWith({
                urlParams: { id: 'demo' },
            });
            expect(download).toEqual('demo.json');
        });
    });
});
