import { renderHook, waitFor } from '@testing-library/react';
import {
    generateWorkspaceDetails,
    generateWorkspaceTarget,
} from '@/modules/workspace/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceService } from '../../workspaceService';
import { useWorkspace } from './useWorkspace';

describe('useWorkspace query', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');

    afterEach(() => {
        getWorkspaceSpy.mockReset();
    });

    it('fetches the details of the specified workspace', async () => {
        const params = { urlParams: { workspaceId: 'workspace-1' } };
        const workspace = generateWorkspaceDetails({
            targets: [generateWorkspaceTarget({ address: '0x123' })],
        });
        getWorkspaceSpy.mockResolvedValue(workspace);
        const { result } = renderHook(() => useWorkspace(params), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data).toEqual(workspace));
        expect(getWorkspaceSpy).toHaveBeenCalledWith(params);
    });
});
