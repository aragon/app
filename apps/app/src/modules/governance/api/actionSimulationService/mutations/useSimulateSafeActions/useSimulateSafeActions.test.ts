import { act, renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { safeProtocolKitUtils } from '@/modules/safe/utils/safeProtocolKitUtils';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateSafeActions } from './useSimulateSafeActions';

describe('useSimulateSafeActions mutation', () => {
    const simulateSafeActionsSpy = jest.spyOn(
        actionSimulationService,
        'simulateSafeActions',
    );
    const initReadOnlySpy = jest.spyOn(safeProtocolKitUtils, 'initReadOnly');
    const buildTransactionCallSpy = jest.spyOn(
        safeProtocolKitUtils,
        'buildTransactionCall',
    );

    const network = Network.ETHEREUM_SEPOLIA;
    const safeAddress = '0xsafe';
    const actions = [
        { to: '0xto', data: '0xdata', value: BigInt(1) },
        { to: '0xother', data: '0x', value: BigInt(0) },
    ];

    afterEach(() => {
        simulateSafeActionsSpy.mockReset();
        initReadOnlySpy.mockReset();
        buildTransactionCallSpy.mockReset();
    });

    it('builds the Safe transaction with a read-only protocol kit and simulates it', async () => {
        const protocolKit = { kit: true };
        const transactionCall = {
            to: '0xmultisend',
            value: '0',
            data: '0x8d80ff0a',
            operation: 1 as const,
        };
        const simulationResult = generateSimulationResult();
        initReadOnlySpy.mockResolvedValue(protocolKit as never);
        buildTransactionCallSpy.mockResolvedValue(transactionCall);
        simulateSafeActionsSpy.mockResolvedValue(simulationResult);

        const { result } = renderHook(() => useSimulateSafeActions(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate({ network, safeAddress, actions }));

        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(initReadOnlySpy).toHaveBeenCalledWith({
            chainId: networkDefinitions[network].id,
            safeAddress,
        });
        expect(buildTransactionCallSpy).toHaveBeenCalledWith({
            protocolKit,
            calls: actions,
        });
        expect(simulateSafeActionsSpy).toHaveBeenCalledWith({
            urlParams: { network, safeAddress },
            body: transactionCall,
        });
    });

    it('fails without simulating when the Safe transaction cannot be built', async () => {
        const buildError = new Error('no client');
        initReadOnlySpy.mockRejectedValue(buildError);

        const { result } = renderHook(() => useSimulateSafeActions(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate({ network, safeAddress, actions }));

        await waitFor(() => expect(result.current.error).toBe(buildError));
        expect(simulateSafeActionsSpy).not.toHaveBeenCalled();
    });
});
