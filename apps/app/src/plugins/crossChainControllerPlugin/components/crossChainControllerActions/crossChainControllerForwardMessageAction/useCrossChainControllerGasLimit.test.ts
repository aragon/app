import { act, renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    crossChainControllerService,
    GasLimitEstimationStatus,
    type IGasLimitEstimation,
} from '../../../api/crossChainControllerService';
import type {
    IGasLimitEstimationAction,
    IUseCrossChainControllerGasLimitParams,
} from './useCrossChainControllerGasLimit';
import { useCrossChainControllerGasLimit } from './useCrossChainControllerGasLimit';

describe('useCrossChainControllerGasLimit hook', () => {
    const estimateGasLimitSpy = jest.spyOn(
        crossChainControllerService,
        'estimateGasLimit',
    );

    const controllerAddress = '0x1111111111111111111111111111111111111111';
    const destinationChainId = 8453;
    const nestedAction: IGasLimitEstimationAction = {
        to: '0x4444444444444444444444444444444444444444',
        value: '0',
        data: '0xdeadbeef',
    };

    const generateEstimation = (
        estimation?: Partial<IGasLimitEstimation>,
    ): IGasLimitEstimation => ({
        status: GasLimitEstimationStatus.SUCCESS,
        requiredGas: '228100',
        runAt: 0,
        ...estimation,
    });

    beforeEach(() => {
        estimateGasLimitSpy.mockResolvedValue(generateEstimation());
    });

    afterEach(() => {
        estimateGasLimitSpy.mockReset();
    });

    const renderGasLimitHook = (
        paramsOverrides?: Partial<IUseCrossChainControllerGasLimitParams>,
    ) => {
        const onGasLimitChange = jest.fn();
        const { result, rerender } = renderHook(
            (props?: Partial<IUseCrossChainControllerGasLimitParams>) =>
                useCrossChainControllerGasLimit({
                    daoNetwork: Network.ETHEREUM_MAINNET,
                    controllerAddress,
                    destinationChainId,
                    nestedActions: [nestedAction],
                    onGasLimitChange,
                    ...paramsOverrides,
                    ...props,
                }),
            { wrapper: ReactQueryWrapper },
        );

        return { result, rerender, onGasLimitChange };
    };

    it('starts with no alert and no simulation url', () => {
        const { result } = renderGasLimitHook();

        expect(result.current.estimationAlert).toBeUndefined();
        expect(result.current.simulationUrl).toBeUndefined();
        expect(result.current.isEstimating).toBe(false);
    });

    it('estimates the gas limit and applies the client-side margin', async () => {
        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(estimateGasLimitSpy).toHaveBeenCalledWith({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    controllerAddress,
                },
                body: { destinationChainId, actions: [nestedAction] },
            }),
        );
        // The backend reports 228,100 with no margin; the 30% margin is this client's decision.
        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('296530'),
        );
    });

    it('does not resolve a gas limit when the requirement alone exceeds the cap', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ requiredGas: '3500000' }),
        );

        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert?.message).toEqual(
                expect.stringContaining('exceedsMax'),
            ),
        );
        // Only the clear that precedes every calculation, never a resolved limit.
        expect(onGasLimitChange).toHaveBeenCalledTimes(1);
        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
    });

    it('clears the previous gas limit before recalculating, so an outcome with no usable limit leaves nothing submittable', async () => {
        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());
        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('296530'),
        );

        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({
                status: GasLimitEstimationStatus.REVERTED,
                requiredGas: undefined,
            }),
        );
        onGasLimitChange.mockClear();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert?.message).toEqual(
                expect.stringContaining('reverted'),
            ),
        );
        expect(onGasLimitChange).toHaveBeenCalledTimes(1);
        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
    });

    it('reports the revert reason when the actions fail in simulation', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({
                status: GasLimitEstimationStatus.REVERTED,
                requiredGas: undefined,
                revertReason: 'ERC20: insufficient balance',
            }),
        );

        const { result } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert?.message).toEqual(
                expect.stringContaining('reverted'),
            ),
        );
    });

    it('exposes the simulation url from the last estimation', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ simulationUrl: 'https://tenderly.co/x' }),
        );

        const { result } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.simulationUrl).toEqual(
                'https://tenderly.co/x',
            ),
        );
    });

    it('clears a resolved gas limit when the destination chain changes', async () => {
        const { result, rerender, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());
        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('296530'),
        );

        onGasLimitChange.mockClear();
        rerender({ destinationChainId: 42_161 });

        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
    });

    it('clears a resolved gas limit when the nested actions change', async () => {
        const { result, rerender, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());
        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('296530'),
        );

        onGasLimitChange.mockClear();
        rerender({ nestedActions: [{ ...nestedAction, data: '0xfeedface' }] });

        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
    });

    it('throws when estimating without a resolved network or destination', () => {
        const { result } = renderGasLimitHook({
            destinationChainId: undefined,
        });

        expect(() => result.current.handleEstimateGasLimit()).toThrow();
    });
});
