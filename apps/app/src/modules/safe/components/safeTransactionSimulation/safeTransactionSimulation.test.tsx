import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { actionSimulationService } from '@/modules/governance/api/actionSimulationService';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type ISafeTransactionSimulationProps,
    SafeTransactionSimulation,
} from './safeTransactionSimulation';

describe('<SafeTransactionSimulation /> component', () => {
    const getLastSafeTransactionSimulationSpy = jest.spyOn(
        actionSimulationService,
        'getLastSafeTransactionSimulation',
    );
    const simulateSafeTransactionSpy = jest.spyOn(
        actionSimulationService,
        'simulateSafeTransaction',
    );

    const urlParams = {
        network: Network.ETHEREUM_SEPOLIA,
        safeAddress: '0x5F2c8A1b9D3e7C4a6B0d2E8f1A3c5B7d9E0f2A4c',
        safeTxHash: '0xabc',
    };
    const translationKey = 'app.safe.safeTransactionSimulation';
    const elevenMinutes = 11 * 60 * 1000;

    const notFoundError = new AragonBackendServiceError(
        AragonBackendServiceError.notFoundCode,
        'Not found',
        404,
    );

    afterEach(() => {
        getLastSafeTransactionSimulationSpy.mockReset();
        simulateSafeTransactionSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeTransactionSimulationProps>,
    ) => {
        const completeProps: ISafeTransactionSimulationProps = {
            ...urlParams,
            actionCount: 2,
            ...props,
        };

        // Like the app's client, failed reads are not retried.
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        // The kit provider brings its own query client, so the test client is nested inside it.
        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={queryClient}>
                    <SafeTransactionSimulation {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const getSimulateButton = () =>
        screen.findByRole('button', { name: /Simulate/ });

    it('renders nothing on a network Tenderly does not support', () => {
        const { container } = render(
            createTestComponent({ network: Network.CITREA_MAINNET }),
        );

        expect(container).toBeEmptyDOMElement();
        expect(getLastSafeTransactionSimulationSpy).not.toHaveBeenCalled();
    });

    it('offers the simulation of a transaction never simulated, without an error', async () => {
        getLastSafeTransactionSimulationSpy.mockRejectedValue(notFoundError);
        render(createTestComponent());

        expect(await getSimulateButton()).toBeEnabled();
        expect(screen.getByText('2 actions')).toBeInTheDocument();

        // The button shows while the read is pending, so the absence of an error is only checked once it settled.
        await waitFor(() =>
            expect(getLastSafeTransactionSimulationSpy).toHaveBeenCalled(),
        );
        await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
        expect(
            screen.queryByText(`${translationKey}.lastSimulationError`),
        ).not.toBeInTheDocument();
        expect(getLastSafeTransactionSimulationSpy).toHaveBeenCalledWith({
            urlParams,
        });
    });

    it('simulates the transaction and shows the run as the last simulation', async () => {
        getLastSafeTransactionSimulationSpy.mockRejectedValue(notFoundError);
        simulateSafeTransactionSpy.mockResolvedValue(
            generateSimulationResult({
                runAt: Date.now(),
                status: 'failed',
            }),
        );
        render(createTestComponent());

        await userEvent.click(await getSimulateButton());

        expect(simulateSafeTransactionSpy).toHaveBeenCalledWith({
            urlParams,
        });
        expect(await screen.findByText('Likely to fail')).toBeInTheDocument();
        // The run just made cannot be repeated within 10 minutes.
        expect(
            screen.queryByRole('button', { name: /Simulate/ }),
        ).not.toBeInTheDocument();
    });

    it('does not offer a new simulation within 10 minutes of the last run', async () => {
        getLastSafeTransactionSimulationSpy.mockResolvedValue(
            generateSimulationResult({ runAt: Date.now() - 60_000 }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText('Likely to succeed'),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Simulate/ }),
        ).not.toBeInTheDocument();
    });

    it('offers a new simulation once the last run is older than 10 minutes', async () => {
        getLastSafeTransactionSimulationSpy.mockResolvedValue(
            generateSimulationResult({ runAt: Date.now() - elevenMinutes }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText('Likely to succeed'),
        ).toBeInTheDocument();
        expect(await getSimulateButton()).toBeEnabled();
    });

    it('reports a last simulation that could not be read', async () => {
        getLastSafeTransactionSimulationSpy.mockRejectedValue(
            new AragonBackendServiceError('internal', 'Server error', 500),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(`${translationKey}.lastSimulationError`),
        ).toBeInTheDocument();
    });

    it.each([
        {
            label: 'refused because the Tenderly budget is exhausted',
            error: new AragonBackendServiceError(
                AragonBackendServiceError.simulationBudgetExhaustedCode,
                'Budget exhausted',
                429,
            ),
            errorKey: 'limitReached',
        },
        {
            label: 'refused because the backend is busy',
            error: new AragonBackendServiceError(
                AragonBackendServiceError.tooBusyCode,
                'Too busy',
                503,
            ),
            errorKey: 'unavailable',
        },
        {
            label: 'refused because the budget could not be checked',
            error: new AragonBackendServiceError(
                AragonBackendServiceError.simulationBudgetCheckFailedCode,
                'Budget check failed',
                503,
            ),
            errorKey: 'unavailable',
        },
        {
            label: 'that never reached the backend',
            error: new TypeError('Failed to fetch'),
            errorKey: 'unavailable',
        },
        {
            label: 'that failed for another reason',
            error: new AragonBackendServiceError(
                'internal',
                'Server error',
                500,
            ),
            errorKey: 'simulationError',
        },
    ])('reports a simulation $label', async ({ error, errorKey }) => {
        getLastSafeTransactionSimulationSpy.mockRejectedValue(notFoundError);
        simulateSafeTransactionSpy.mockRejectedValue(error);
        render(createTestComponent());

        await userEvent.click(await getSimulateButton());

        expect(
            await screen.findByText(`${translationKey}.${errorKey}`),
        ).toBeInTheDocument();
    });
});
