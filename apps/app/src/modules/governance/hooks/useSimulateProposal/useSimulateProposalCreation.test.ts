import { renderHook } from '@testing-library/react';
import { BaseError, ExecutionRevertedError } from 'viem';
import * as wagmi from 'wagmi';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';
import { useSimulateProposalCreation } from './useSimulateProposalCreation';

describe('useSimulateProposalCreation hook', () => {
    const useCallSpy = jest.spyOn(wagmi, 'useCall');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const buildTransactionSpy = jest.spyOn(
        publishProposalDialogUtils,
        'buildTransaction',
    );

    const walletAddress = '0xabc0000000000000000000000000000000000001';

    const buildResult = (
        values: Partial<Record<keyof wagmi.UseCallReturnType, unknown>>,
    ) =>
        ({
            isLoading: false,
            isError: false,
            isSuccess: false,
            error: null,
            ...values,
        }) as wagmi.UseCallReturnType;

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: walletAddress,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        buildTransactionSpy.mockReturnValue({
            to: '0x123',
            data: '0x',
            value: BigInt(0),
        });
        useCallSpy.mockReturnValue(buildResult({}));
    });

    afterEach(() => {
        useCallSpy.mockReset();
        useWalletAccountSpy.mockReset();
        buildTransactionSpy.mockReset();
    });

    const renderSimulation = () =>
        renderHook(() =>
            useSimulateProposalCreation({
                plugin: generateDaoPlugin(),
                network: Network.ETHEREUM_MAINNET,
            }),
        );

    it('returns a loading state without a result while the simulation is in progress', () => {
        useCallSpy.mockReturnValue(buildResult({ isLoading: true }));

        const { result } = renderSimulation();

        expect(result.current.isLoading).toBeTruthy();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.result).toBeUndefined();
    });

    it('returns result success when the call succeeds', () => {
        useCallSpy.mockReturnValue(buildResult({ isSuccess: true }));

        const { result } = renderSimulation();

        expect(result.current.result).toBe('success');
        expect(result.current.isError).toBeFalsy();
    });

    it('returns result failure without a request error when the call reverts', () => {
        const error = new BaseError('reverted', {
            cause: new ExecutionRevertedError({}),
        });
        useCallSpy.mockReturnValue(buildResult({ isError: true, error }));

        const { result } = renderSimulation();

        expect(result.current.result).toBe('failure');
        expect(result.current.isError).toBeFalsy();
    });

    it('returns a request error for a non-revert BaseError', () => {
        const error = new BaseError('RPC unavailable');
        useCallSpy.mockReturnValue(buildResult({ isError: true, error }));

        const { result } = renderSimulation();

        expect(result.current.isError).toBeTruthy();
        expect(result.current.result).toBeUndefined();
    });

    it('returns a request error for a non-BaseError error', () => {
        const error = new Error('boom');
        useCallSpy.mockReturnValue(buildResult({ isError: true, error }));

        const { result } = renderSimulation();

        expect(result.current.isError).toBeTruthy();
        expect(result.current.result).toBeUndefined();
    });

    it('disables the query when the wallet address is missing', () => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });

        renderHook(() =>
            useSimulateProposalCreation({
                plugin: generateDaoPlugin(),
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(useCallSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it('disables the query when the network is missing', () => {
        renderHook(() =>
            useSimulateProposalCreation({ plugin: generateDaoPlugin() }),
        );

        expect(useCallSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });
});
