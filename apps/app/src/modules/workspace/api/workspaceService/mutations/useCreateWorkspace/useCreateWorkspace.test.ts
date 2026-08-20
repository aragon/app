import { act, renderHook, waitFor } from '@testing-library/react';
import { generateWorkspace } from '@/modules/workspace/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceService } from '../../workspaceService';
import { useCreateWorkspace } from './useCreateWorkspace';

describe('useCreateWorkspace mutation', () => {
    const createWorkspaceSpy = jest.spyOn(workspaceService, 'createWorkspace');

    afterEach(() => {
        createWorkspaceSpy.mockReset();
    });

    it('creates the workspace and returns it', async () => {
        const workspace = generateWorkspace({ name: 'test-workspace' });
        const params = {
            body: {
                creator: '0x5F1680d0c2c5E9d3615a036FbDc7432E7bf246FB',
                network: Network.ETHEREUM_MAINNET,
                name: 'test-workspace',
                targets: ['0x974E865B1BB24AF2a9ef8204AdEA9251Cc7C5FD9'],
            },
        };
        createWorkspaceSpy.mockResolvedValue(workspace);
        const { result } = renderHook(() => useCreateWorkspace(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));
        await waitFor(() => expect(result.current.data).toEqual(workspace));
        expect(createWorkspaceSpy).toHaveBeenCalledWith(params);
    });
});
