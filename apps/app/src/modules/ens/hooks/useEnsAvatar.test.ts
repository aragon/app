import { ensUtils } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useEnsAvatar } from './useEnsAvatar';

describe('useEnsAvatar hook', () => {
    const useWagmiEnsAvatarSpy = jest.spyOn(wagmi, 'useEnsAvatar');

    beforeEach(() => {
        useWagmiEnsAvatarSpy.mockReturnValue({
            data: null,
            error: null,
        } as unknown as ReturnType<typeof wagmi.useEnsAvatar>);
    });

    afterEach(() => {
        useWagmiEnsAvatarSpy.mockReset();
    });

    it('resolves the avatar through the kit avatar gateways', () => {
        renderHook(() => useEnsAvatar('alice.aragon.eth'));
        expect(useWagmiEnsAvatarSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'alice.aragon.eth',
                assetGatewayUrls: ensUtils.avatarGatewayUrls,
            }),
        );
    });

    it('skips the wagmi query when no name is given', () => {
        renderHook(() => useEnsAvatar(undefined));
        expect(useWagmiEnsAvatarSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                name: undefined,
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });
});
