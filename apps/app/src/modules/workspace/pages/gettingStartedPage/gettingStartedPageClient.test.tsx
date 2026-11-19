import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import * as workspaceService from '../../api/workspaceService';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { GettingStartedPageClient } from './gettingStartedPageClient';

describe('<GettingStartedPageClient /> component', () => {
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService.workspaceService,
        'getWorkspaceList',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const openMock = jest.fn();
    const replaceMock = jest.fn();

    beforeEach(() => {
        getWorkspaceListSpy.mockResolvedValue([]);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openMock }),
        );
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        getWorkspaceListSpy.mockReset();
        useDialogContextSpy.mockReset();
        useRouterSpy.mockReset();
        openMock.mockReset();
        replaceMock.mockReset();
    });

    const createTestComponent = () => (
        <ReactQueryWrapper>
            <GukModulesProvider>
                <GettingStartedPageClient />
            </GukModulesProvider>
        </ReactQueryWrapper>
    );

    it('renders the add-accounts step alone', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'app.workspace.gettingStartedPage.steps.ACCOUNTS.title',
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'app.workspace.gettingStartedPage.steps.METADATA.title',
            }),
        ).not.toBeInTheDocument();
    });

    it('opens the publish dialog with the default workspace name on submit', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /app\.workspace\.gettingStartedPage\.submitLabel/,
            }),
        );

        await waitFor(() =>
            expect(openMock).toHaveBeenCalledWith(
                WorkspaceDialogId.PUBLISH_WORKSPACE,
                expect.objectContaining({
                    params: expect.objectContaining({
                        // The skipped metadata step still submits its fields: a workspace stored without `links`
                        // (built from `resources`) crashes every workspace page that reads it.
                        values: expect.objectContaining({
                            name: 'My workspace',
                            description: '',
                            resources: [],
                        }),
                    }),
                }),
            ),
        );
    });

    it('sends a user who already holds a workspace to the workspace entry', async () => {
        getWorkspaceListSpy.mockResolvedValue([{ id: 'existing' }] as Awaited<
            ReturnType<
                typeof workspaceService.workspaceService.getWorkspaceList
            >
        >);

        render(createTestComponent());

        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith('/workspace'),
        );
    });
    it('creates the workspace without accounts through the skip action', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /app\.workspace\.gettingStartedPage\.addAccountsLater/,
            }),
        );

        await waitFor(() =>
            expect(openMock).toHaveBeenCalledWith(
                WorkspaceDialogId.PUBLISH_WORKSPACE,
                expect.objectContaining({
                    params: expect.objectContaining({
                        values: expect.objectContaining({ accounts: [] }),
                    }),
                }),
            ),
        );
    });
});
