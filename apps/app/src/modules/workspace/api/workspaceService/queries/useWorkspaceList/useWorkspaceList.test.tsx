import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import type { ReactNode } from 'react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, WorkspaceRegistryScope } from '../../domain';
import { workspaceService } from '../../workspaceService';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';
import { useWorkspaceList } from './useWorkspaceList';

describe('useWorkspaceList query', () => {
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );

    const buildWorkspace = (id: string) => ({ id }) as IWorkspace;

    const renderWithClient = (client: QueryClient) =>
        renderHook(() => useWorkspaceList(), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <ReactQueryWrapper client={client}>
                    {children}
                </ReactQueryWrapper>
            ),
        });

    afterEach(() => {
        useParamsSpy.mockReset();
        getWorkspaceListSpy.mockReset();
    });

    it('lists the persistent registry outside a demo workspace route', async () => {
        const workspaces = [buildWorkspace('mine')];
        useParamsSpy.mockReturnValue({ workspaceId: 'mine' });
        getWorkspaceListSpy.mockResolvedValue(workspaces);

        const { result } = renderWithClient(new QueryClient());

        await waitFor(() => expect(result.current.data).toEqual(workspaces));
        expect(getWorkspaceListSpy).toHaveBeenCalledWith(
            WorkspaceRegistryScope.PERSISTENT,
        );
    });

    it('lists the demo registry on a demo workspace route', async () => {
        useParamsSpy.mockReturnValue({ workspaceId: 'aragon-demo' });
        getWorkspaceListSpy.mockResolvedValue([buildWorkspace('aragon-demo')]);

        const { result } = renderWithClient(new QueryClient());

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getWorkspaceListSpy).toHaveBeenCalledWith(
            WorkspaceRegistryScope.DEMO,
        );
    });

    it('never answers with a cached demo list once the demo is left', async () => {
        const client = new QueryClient({
            defaultOptions: { queries: { staleTime: 60_000 } },
        });
        client.setQueryData(
            workspaceServiceKeys.workspaceList(WorkspaceRegistryScope.DEMO),
            [buildWorkspace('aragon-demo')],
        );
        const workspaces = [buildWorkspace('mine')];
        useParamsSpy.mockReturnValue({});
        getWorkspaceListSpy.mockResolvedValue(workspaces);

        const { result } = renderWithClient(client);

        expect(result.current.data).toBeUndefined();
        await waitFor(() => expect(result.current.data).toEqual(workspaces));
    });
});
