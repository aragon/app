import { ReactQueryWrapper } from '@/shared/testUtils';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as pinJsonAction from '../../actions';
import { usePinJson } from './usePinJson';

describe('usePinJson mutation', () => {
    const pinJsonActionSpy = jest.spyOn(pinJsonAction, 'pinJsonAction');

    afterEach(() => {
        pinJsonActionSpy.mockReset();
    });

    it('pins the specified data on IPFS and returns the hash', async () => {
        const data = { key: 'value' };
        const ipfsHash = 'qwao42347uroif78';
        const ipfsResult = { IpfsHash: ipfsHash };
        pinJsonActionSpy.mockResolvedValue(ipfsResult);
        const { result } = renderHook(() => usePinJson(), { wrapper: ReactQueryWrapper });
        act(() => result.current.mutate({ body: data }));
        await waitFor(() => expect(result.current.data).toEqual(ipfsResult));
    });
});
