import { renderHook, waitFor } from '@testing-library/react';
import { encodeAbiParameters, toHex } from 'viem';
import { mainnet } from 'viem/chains';
import { packetToBytes } from 'viem/ens';
import * as wagmiActions from 'wagmi/actions';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { ensTransactionUtils } from '../utils/ensTransactionUtils';
import { useEnsResolverRecords } from './useEnsResolverRecords';

jest.mock('@/modules/application/constants/wagmi', () => ({
    wagmiConfig: { mocked: true },
}));

const ENS_NAME = 'alice.aragon.eth';
const ADDR = '0xBFb942193086728e4e724a50D129A48165077943';
const CONTENTHASH = '0xe3010170';
const MIRROR_RESOLVER = '0x394D8EB4a4fDF599384DeAb25F31d111d755c398';

describe('useEnsResolverRecords', () => {
    const getWritableResolverSpy = jest.spyOn(
        ensTransactionUtils,
        'getWritableResolver',
    );
    const readContractSpy = jest.spyOn(wagmiActions, 'readContract');

    afterEach(() => {
        getWritableResolverSpy.mockReset();
        readContractSpy.mockReset();
    });

    it('reads addr and contenthash through the Universal Resolver', async () => {
        getWritableResolverSpy.mockResolvedValue({
            address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
            isV2: false,
        });
        readContractSpy
            .mockResolvedValueOnce([
                encodeAbiParameters([{ type: 'address' }], [ADDR]),
                MIRROR_RESOLVER,
            ])
            .mockResolvedValueOnce([
                encodeAbiParameters([{ type: 'bytes' }], [CONTENTHASH]),
                MIRROR_RESOLVER,
            ]);

        const { result } = renderHook(() => useEnsResolverRecords(ENS_NAME), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({
            addr: ADDR,
            contenthash: CONTENTHASH,
        });
        expect(readContractSpy.mock.calls[0][1]).toMatchObject({
            address: mainnet.contracts.ensUniversalResolver.address,
            functionName: 'resolve',
            args: [toHex(packetToBytes(ENS_NAME)), expect.any(String)],
        });
    });

    it('returns null when the name has no writable resolver', async () => {
        getWritableResolverSpy.mockResolvedValue(null);

        const { result } = renderHook(() => useEnsResolverRecords(ENS_NAME), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeNull();
        expect(readContractSpy).not.toHaveBeenCalled();
    });

    it('skips the query when the name is null', () => {
        const { result } = renderHook(() => useEnsResolverRecords(null), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current.fetchStatus).toBe('idle');
        expect(getWritableResolverSpy).not.toHaveBeenCalled();
    });
});
