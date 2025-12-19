import { renderHook, waitFor } from '@testing-library/react';
import { smartContractService } from '@/modules/governance/api/smartContractService';
import { generateSmartContractAbi } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { useIsSafeContract } from '.';

describe('useIsSafeContract hook', () => {
    const getAbiSpy = jest.spyOn(smartContractService, 'getAbi');

    afterEach(() => {
        getAbiSpy.mockReset();
    });

    const validAddress = '0x1234567890123456789012345678901234567890';
    const network = Network.ETHEREUM_MAINNET;

    it('returns false immediately for invalid addresses', () => {
        const { result } = renderHook(
            () => useIsSafeContract({ address: 'invalid', network }),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        expect(result.current.data).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(getAbiSpy).not.toHaveBeenCalled();
    });

    it('returns false immediately when address is undefined', () => {
        const { result } = renderHook(
            () => useIsSafeContract({ address: undefined, network }),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        expect(result.current.data).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(getAbiSpy).not.toHaveBeenCalled();
    });

    it('returns true when contract name contains Safe indicators', async () => {
        const testCases = ['SafeProxy', 'GnosisSafe', 'Safe', 'Gnosis Safe'];

        for (const contractName of testCases) {
            getAbiSpy.mockResolvedValue(
                generateSmartContractAbi({
                    name: contractName,
                    address: validAddress,
                    network,
                }),
            );

            const { result } = renderHook(
                () => useIsSafeContract({ address: validAddress, network }),
                {
                    wrapper: ReactQueryWrapper,
                },
            );

            await waitFor(() => expect(result.current.isLoading).toBe(false));

            expect(result.current.data).toBe(true);
        }
    });

    it('returns false when contract name does not contain Safe indicators', async () => {
        getAbiSpy.mockResolvedValue(
            generateSmartContractAbi({
                name: 'SomeOtherContract',
                address: validAddress,
                network,
            }),
        );

        const { result } = renderHook(
            () => useIsSafeContract({ address: validAddress, network }),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe(false);
    });

    it('returns true for case-insensitive Safe indicators', async () => {
        getAbiSpy.mockResolvedValue(
            generateSmartContractAbi({
                name: 'safeproxy',
                address: validAddress,
                network,
            }),
        );

        const { result } = renderHook(
            () => useIsSafeContract({ address: validAddress, network }),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toBe(true);
    });

    it('respects enabled option when set to false', () => {
        const { result } = renderHook(
            () =>
                useIsSafeContract(
                    { address: validAddress, network },
                    { enabled: false },
                ),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeFalsy();
        expect(getAbiSpy).not.toHaveBeenCalled();
    });
});
