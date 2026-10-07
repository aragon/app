import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import {
    generateSafeInfoResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { useIsSafeContract } from '.';

describe('useIsSafeContract hook', () => {
    const getSafeInfoSpy = jest.spyOn(safeService, 'getSafeInfo');

    afterEach(() => {
        getSafeInfoSpy.mockReset();
    });

    const validAddress = '0x1234567890123456789012345678901234567890';
    const network = Network.ETHEREUM_MAINNET;

    it('returns false immediately for invalid addresses', () => {
        const { result } = renderHook(
            () => useIsSafeContract({ address: 'invalid', network }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.data).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(getSafeInfoSpy).not.toHaveBeenCalled();
    });

    it('returns false immediately when address is undefined', () => {
        const { result } = renderHook(
            () => useIsSafeContract({ address: undefined, network }),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.data).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(getSafeInfoSpy).not.toHaveBeenCalled();
    });

    it('accepts an address whose Safe state can be read', async () => {
        getSafeInfoSpy.mockResolvedValue(
            generateSafeInfoResponse({
                owners: [validAddress],
                threshold: 1,
            }),
        );

        const { result } = renderHook(
            () => useIsSafeContract({ address: validAddress, network }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe(true);
    });

    /**
     * The defect this replaced: the check read the contract's ABI and substring-matched its name,
     * so `SafeMath` - or anything else merely containing "Safe" - could be attached as a governance
     * body. Owners and a threshold are an interface; a name is not.
     */
    it('rejects a contract that is not a Safe however it is named', async () => {
        getSafeInfoSpy.mockRejectedValue(new Error('not found'));

        const { result } = renderHook(
            () =>
                useIsSafeContract({
                    address: validAddress,
                    network,
                }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe(false);
        expect(result.current.isError).toBe(true);
    });

    it('rejects a response that carries no owners', async () => {
        // A shape that answers without an owner set cannot authorise anything, so treating it as a
        // Safe would attach a body that can never act.
        getSafeInfoSpy.mockResolvedValue(
            generateSafeInfoResponse({ owners: [], threshold: 0 }),
        );

        const { result } = renderHook(
            () => useIsSafeContract({ address: validAddress, network }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe(false);
    });

    it('does not read anything when disabled', () => {
        const { result } = renderHook(
            () =>
                useIsSafeContract(
                    { address: validAddress, network },
                    { enabled: false },
                ),
            { wrapper: ReactQueryWrapper },
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeFalsy();
        expect(getSafeInfoSpy).not.toHaveBeenCalled();
    });
});
