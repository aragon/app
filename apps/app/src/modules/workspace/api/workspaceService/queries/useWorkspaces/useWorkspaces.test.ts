import { renderHook, waitFor } from '@testing-library/react';
import { generateWorkspace } from '@/modules/workspace/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceService } from '../../workspaceService';
import { useWorkspaces } from './useWorkspaces';

describe('useWorkspaces query', () => {
    const getWorkspacesSpy = jest.spyOn(workspaceService, 'getWorkspaces');

    afterEach(() => {
        getWorkspacesSpy.mockReset();
    });

    it('fetches the workspaces of the specified creator', async () => {
        const params = {
            queryParams: {
                creator: '0x123',
                network: Network.ETHEREUM_MAINNET,
            },
        };
        const workspaces = [generateWorkspace({ id: 'workspace-1' })];
        getWorkspacesSpy.mockResolvedValue(workspaces);
        const { result } = renderHook(() => useWorkspaces(params), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data).toEqual(workspaces));
        expect(getWorkspacesSpy).toHaveBeenCalledWith(params);
    });
});
