import { ReactQueryWrapper } from '@/shared/testUtils';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ISession } from '../../domain';
import { walletConnectService } from '../../walletConnectService';
import { useDisconnectApp } from './useDisconnectApp';

describe('useDisconnectApp mutation', () => {
    const disconnectAppSpy = jest.spyOn(walletConnectService, 'disconnectApp');

    afterEach(() => {
        disconnectAppSpy.mockReset();
    });

    it('disconnects to the app using the specified session', async () => {
        const session = {} as ISession;
        disconnectAppSpy.mockResolvedValue();
        const { result } = renderHook(() => useDisconnectApp(), { wrapper: ReactQueryWrapper });
        act(() => result.current.mutate({ session }));
        await waitFor(() => expect(disconnectAppSpy).toHaveBeenCalledWith({ session }));
    });
});
