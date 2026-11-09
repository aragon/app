import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
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
        expect(result.current.estimationAlert?.message).toEqual(
            expect.stringContaining('simulated'),
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

    it('clamps a buffered estimate to the usable 3,000,000 cap and warns about the reduced margin', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ requiredGas: '2500000' }),
        );

        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('3000000'),
        );
        expect(result.current.estimationAlert?.message).toEqual(
            expect.stringContaining('marginReduced'),
        );
    });

    it('names the controller minimum instead of a recommended margin when the buffered estimate falls below the floor', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ requiredGas: '140160' }),
        );

        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        // 140,160 x 1.3 = 182,208, below the 200,000 floor, so the floor sets the limit and a
        // recommended-margin total would not be the number the field holds.
        await waitFor(() =>
            expect(onGasLimitChange).toHaveBeenCalledWith('200000'),
        );
        expect(result.current.estimationAlert?.message).toEqual(
            expect.stringContaining('minimumApplied'),
        );
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

    it('reports the limit when the gas budget is finished and leaves the field empty', async () => {
        estimateGasLimitSpy.mockRejectedValue(
            new AragonBackendServiceError(
                'crossChainGasBudgetExhausted',
                'Limit reached',
                429,
            ),
        );

        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert).toEqual({
                message:
                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.limitReached',
                variant: 'critical',
            }),
        );
        expect(onGasLimitChange).toHaveBeenCalledTimes(1);
        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
    });

    it.each([
        ['tooBusy', 503, 'unavailable'],
        ['simulationBudgetCheckFailed', 503, 'unavailable'],
        ['crossChainSimulationFailed', 502, 'error'],
        ['badSimulationRequest', 400, 'error'],
    ])('shows the %s error as %s', async (code, status, errorKey) => {
        estimateGasLimitSpy.mockRejectedValue(
            new AragonBackendServiceError(code, 'Unavailable', status),
        );

        const { result } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert).toEqual({
                message: `app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.${errorKey}`,
                variant: 'critical',
            }),
        );
    });

    it('applies a stale estimate and says which run it comes from', async () => {
        const staleSince = Date.parse('2026-11-04T10:00:00.000Z');
        const formattedDate = formatterUtils.formatDate(staleSince, {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        });
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ staleSince, runAt: staleSince + 659_000 }),
        );

        const { result, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert).toEqual({
                message: `app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.stale (date=${formattedDate})`,
                variant: 'warning',
            }),
        );
        expect(onGasLimitChange).toHaveBeenLastCalledWith('296530');
    });

    it('shows the revert reason before the stale note', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({
                status: GasLimitEstimationStatus.REVERTED,
                requiredGas: undefined,
                revertReason: 'ERC20: insufficient balance',
                staleSince: Date.parse('2026-11-04T10:00:00.000Z'),
            }),
        );

        const { result } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());

        await waitFor(() =>
            expect(result.current.estimationAlert).toEqual({
                message:
                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.reverted (reason=ERC20: insufficient balance)',
                variant: 'critical',
            }),
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

    it('ignores an in-flight estimation result once the destination chain changes before it resolves', async () => {
        let resolveEstimation: (estimation: IGasLimitEstimation) => void = () =>
            undefined;
        estimateGasLimitSpy.mockReturnValue(
            new Promise((resolve) => {
                resolveEstimation = resolve;
            }),
        );

        const { result, rerender, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());
        onGasLimitChange.mockClear();

        rerender({ destinationChainId: 42_161 });
        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
        onGasLimitChange.mockClear();

        await act(async () => resolveEstimation(generateEstimation()));

        expect(onGasLimitChange).not.toHaveBeenCalled();
    });

    it('ignores an in-flight estimation result once the nested actions change before it resolves', async () => {
        let resolveEstimation: (estimation: IGasLimitEstimation) => void = () =>
            undefined;
        estimateGasLimitSpy.mockReturnValue(
            new Promise((resolve) => {
                resolveEstimation = resolve;
            }),
        );

        const { result, rerender, onGasLimitChange } = renderGasLimitHook();

        act(() => result.current.handleEstimateGasLimit());
        onGasLimitChange.mockClear();

        rerender({ nestedActions: [{ ...nestedAction, data: '0xfeedface' }] });
        expect(onGasLimitChange).toHaveBeenCalledWith(undefined);
        onGasLimitChange.mockClear();

        await act(async () => resolveEstimation(generateEstimation()));

        expect(onGasLimitChange).not.toHaveBeenCalled();
    });

    it('throws when estimating without a resolved network or destination', () => {
        const { result } = renderGasLimitHook({
            destinationChainId: undefined,
        });

        expect(() => result.current.handleEstimateGasLimit()).toThrow();
    });
});
