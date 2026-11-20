import { renderHook } from '@testing-library/react';
import * as ipfsMutations from '@/shared/api/ipfsService/mutations';
import { useResolveWorkspaceAvatar } from './useResolveWorkspaceAvatar';

describe('useResolveWorkspaceAvatar hook', () => {
    const usePinFileSpy = jest.spyOn(ipfsMutations, 'usePinFile');
    const pinFileSpy = jest.fn();

    beforeEach(() => {
        usePinFileSpy.mockReturnValue({
            mutateAsync: pinFileSpy,
        } as unknown as ReturnType<typeof ipfsMutations.usePinFile>);
        pinFileSpy.mockResolvedValue({ IpfsHash: 'pinned-cid' });
    });

    afterEach(() => {
        usePinFileSpy.mockReset();
        pinFileSpy.mockReset();
    });

    it('pins a newly selected file and resolves its IPFS URI', async () => {
        const file = new File([], 'avatar.png');
        const { result } = renderHook(() => useResolveWorkspaceAvatar());

        await expect(
            result.current({ file, url: 'blob:avatar' }),
        ).resolves.toEqual('ipfs://pinned-cid');
        expect(pinFileSpy).toHaveBeenCalledWith({ body: file });
    });

    it('keeps the URI of an avatar carried over from the stored workspace', async () => {
        const { result } = renderHook(() => useResolveWorkspaceAvatar());

        await expect(
            result.current({
                url: 'https://aragon-1.mypinata.cloud/ipfs/stored-cid?img-width=256&img-height=256',
            }),
        ).resolves.toEqual('ipfs://stored-cid');
        expect(pinFileSpy).not.toHaveBeenCalled();
    });

    it('resolves undefined when there is no avatar', async () => {
        const { result } = renderHook(() => useResolveWorkspaceAvatar());

        await expect(result.current(undefined)).resolves.toBeUndefined();
    });
});
