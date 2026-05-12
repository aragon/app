import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useEnsName } from './useEnsName';

describe('useEnsName hook', () => {
    const useWagmiEnsNameSpy = jest.spyOn(wagmi, 'useEnsName');

    const mockEnsResult = (data: string | null | undefined) =>
        useWagmiEnsNameSpy.mockReturnValue({
            data,
            error: null,
            isLoading: false,
        } as unknown as ReturnType<typeof wagmi.useEnsName>);

    const validAddress = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5';

    afterEach(() => {
        useWagmiEnsNameSpy.mockReset();
    });

    it('returns the full ENS name by default', () => {
        mockEnsResult('alice.aragonx.eth');
        const { result } = renderHook(() => useEnsName(validAddress));
        expect(result.current.data).toBe('alice.aragonx.eth');
    });

    it('strips the aragon subdomain suffix when shortenAragonName is set', () => {
        mockEnsResult('alice.aragonx.eth');
        const { result } = renderHook(() =>
            useEnsName(validAddress, { shortenAragonName: true }),
        );
        expect(result.current.data).toBe('alice');
    });

    it('returns the ENS name as-is when it is not an aragon subdomain', () => {
        mockEnsResult('alice.eth');
        const { result } = renderHook(() =>
            useEnsName(validAddress, { shortenAragonName: true }),
        );
        expect(result.current.data).toBe('alice.eth');
    });

    it('passes through null when no ENS is resolved', () => {
        mockEnsResult(null);
        const { result } = renderHook(() =>
            useEnsName(validAddress, { shortenAragonName: true }),
        );
        expect(result.current.data).toBeNull();
    });

    it('skips the wagmi query when the address is invalid', () => {
        mockEnsResult(null);
        renderHook(() => useEnsName('not-an-address'));
        expect(useWagmiEnsNameSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                address: undefined,
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });
});
