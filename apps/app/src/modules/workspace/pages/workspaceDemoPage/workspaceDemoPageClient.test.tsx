import { render, screen, waitFor } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { workspaceService } from '../../api/workspaceService';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

describe('<WorkspaceDemoPageClient /> component', () => {
    const importRegistrySpy = jest.spyOn(
        workspaceService,
        'importWorkspaceRegistry',
    );
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const updateWorkspaceSpy = jest.spyOn(workspaceService, 'updateWorkspace');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const replaceMock = jest.fn();

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
        getWorkspaceListSpy.mockResolvedValue([]);
        updateWorkspaceSpy.mockImplementation(async ({ urlParams, body }) => ({
            ...body,
            id: urlParams.id,
        }));
    });

    afterEach(() => {
        getWorkspaceListSpy.mockReset();
        updateWorkspaceSpy.mockReset();
        importRegistrySpy.mockReset();
        useRouterSpy.mockReset();
        replaceMock.mockReset();
    });

    it('merges the Aragon fixture and opens it through the regular workspace route', async () => {
        importRegistrySpy.mockResolvedValue([]);

        render(<WorkspaceDemoPageClient />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                '/workspace/aragon-demo/all/overview',
            ),
        );
        expect(importRegistrySpy).toHaveBeenCalledWith(
            expect.stringContaining(
                '0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
            ),
            true,
        );
    });

    it('preserves an existing demo workspace while marking it read-only', async () => {
        getWorkspaceListSpy.mockResolvedValue([
            {
                id: 'aragon-demo',
                name: 'Edited demo',
                description: '',
                avatar: null,
                links: [],
                accounts: [],
                targets: [],
            },
        ]);

        render(<WorkspaceDemoPageClient />);

        await waitFor(() =>
            expect(updateWorkspaceSpy).toHaveBeenCalledWith({
                urlParams: { id: 'aragon-demo' },
                body: {
                    name: 'Edited demo',
                    description: '',
                    avatar: null,
                    links: [],
                    accounts: [],
                    targets: [],
                    isDemo: true,
                },
            }),
        );
        expect(importRegistrySpy).not.toHaveBeenCalled();
        expect(replaceMock).toHaveBeenCalledWith(
            '/workspace/aragon-demo/all/overview',
        );
    });

    it('shows an error instead of navigating when the fixture cannot be installed', async () => {
        importRegistrySpy.mockRejectedValue(new Error('Storage unavailable'));

        render(<WorkspaceDemoPageClient />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.workspace.demo.error',
        );
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
