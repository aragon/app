import { act, renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import type { ISession } from '../../domain';
import { walletConnectService } from '../../walletConnectService';
import { useConnectApp } from './useConnectApp';

describe('useConnectApp mutation', () => {
    const connectAppSpy = jest.spyOn(walletConnectService, 'connectApp');

    afterEach(() => {
        connectAppSpy.mockReset();
    });

    it('connects to the app using the specified URI and returns the new session', async () => {
        const session = {} as ISession;
        const uri = 'wc:xxx';
        const address = '0x123';
        const network = Network.ETHEREUM_SEPOLIA;
        connectAppSpy.mockResolvedValue(session);
        const { result } = renderHook(() => useConnectApp(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate({ uri, address, network }));
        await waitFor(() => expect(result.current.data).toEqual(session));
        expect(connectAppSpy).toHaveBeenCalledWith({ uri, address, network });
    });
});
