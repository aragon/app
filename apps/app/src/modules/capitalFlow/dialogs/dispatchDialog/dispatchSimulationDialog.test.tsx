import { Dialog } from '@aragon/gov-ui-kit';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService, Network } from '@/shared/api/daoService';
import {
    PolicyInterfaceType,
    PolicyStrategyType,
} from '@/shared/api/daoService/domain/daoPolicy';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { generateDialogContext } from '@/shared/testUtils';
import { SimulationFlowVisualization } from '../../components/simulationFlowVisualization';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IProcessedSimulation } from '../../utils/simulationTypes';
import {
    DispatchSimulationDialog,
    type IDispatchSimulationDialogParams,
} from './dispatchSimulationDialog';

jest.mock('@aragon/gov-ui-kit', () => {
    const actual =
        jest.requireActual<typeof import('@aragon/gov-ui-kit')>(
            '@aragon/gov-ui-kit',
        );
    return {
        ...actual,
        Dialog: {
            Header: (props: { title: string }) => <div>{props.title}</div>,
            Content: (props: { children: React.ReactNode }) => (
                <div>{props.children}</div>
            ),
            Footer: jest.fn(
                (props: {
                    primaryAction: {
                        label: string;
                        disabled?: boolean;
                        onClick: () => void;
                    };
                }) => (
                    <button
                        disabled={props.primaryAction.disabled}
                        onClick={props.primaryAction.onClick}
                        type="button"
                    >
                        {props.primaryAction.label}
                    </button>
                ),
            ),
        },
    };
});

jest.mock('@/modules/application/hooks/useWalletAccount');
jest.mock('@/shared/components/dialogProvider');
jest.mock('@/shared/components/translationsProvider');
jest.mock('@/shared/hooks/useDaoChain');
jest.mock('../../components/simulationFlowVisualization', () => ({
    SimulationFlowVisualization: jest.fn(() => null),
}));

describe('<DispatchSimulationDialog /> component', () => {
    const simulateDispatchSpy = jest.spyOn(daoService, 'simulateDispatch');
    const close = jest.fn();
    const open = jest.fn();
    const params: IDispatchSimulationDialogParams = {
        network: Network.ETHEREUM_MAINNET,
        policy: {
            address: '0x1111111111111111111111111111111111111111',
            interfaceType: PolicyInterfaceType.ROUTER,
            strategy: { type: PolicyStrategyType.ROUTER },
            release: '1',
            build: '1',
            blockTimestamp: 0,
            transactionHash: '0x123',
        },
    };
    const failedSimulation: IProcessedSimulation = {
        status: 'failed',
        error: 'Insufficient balance',
        summaryGroups: [],
    };
    const continueLabel = 'app.capitalFlow.dispatchSimulationDialog.continue';
    const renderComponent = () =>
        render(
            <DispatchSimulationDialog
                location={{
                    id: CapitalFlowDialogId.DISPATCH_SIMULATION,
                    params,
                }}
            />,
        );

    beforeEach(() => {
        jest.mocked(useWalletAccount).mockReturnValue({
            address: '0x2222222222222222222222222222222222222222',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        jest.mocked(useTranslations).mockReturnValue({
            t: (key: string) => key,
        });
        jest.mocked(useDialogContext).mockReturnValue(
            generateDialogContext({ close, open }),
        );
        jest.mocked(useDaoChain).mockReturnValue({
            chainId: 1,
            network: params.network,
            networkDefinition: undefined,
            buildEntityUrl: jest.fn(),
            isLoading: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        simulateDispatchSpy.mockReset();
    });

    it('blocks continue when dispatch would fail', async () => {
        simulateDispatchSpy.mockResolvedValue(failedSimulation);
        renderComponent();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.capitalFlow.dispatchSimulationDialog.reverted',
        );
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Insufficient balance',
        );
        expect(
            screen.getByRole('button', { name: continueLabel }),
        ).toBeDisabled();
        const onContinue = jest.mocked(Dialog.Footer).mock.lastCall![0]
            .primaryAction!.onClick as () => void;
        act(onContinue);
        expect(open).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
        expect(SimulationFlowVisualization).not.toHaveBeenCalled();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();

        const retry = screen.getByRole('button', {
            name: 'app.capitalFlow.dispatchSimulationDialog.retry',
        });
        expect(retry).toBeEnabled();
        fireEvent.click(retry);
        await waitFor(() =>
            expect(simulateDispatchSpy).toHaveBeenCalledTimes(2),
        );
    });

    it('links the failed simulation on Tenderly', async () => {
        const tenderlyUrl = 'https://dashboard.tenderly.co/simulation/123';
        simulateDispatchSpy.mockResolvedValue({
            ...failedSimulation,
            tenderlyUrl,
        });
        renderComponent();

        expect(
            await screen.findByRole('link', {
                name: 'app.capitalFlow.simulationFlowVisualization.tenderlyLink',
            }),
        ).toHaveAttribute('href', tenderlyUrl);
    });

    it('shows the limit when the budget is finished', async () => {
        simulateDispatchSpy.mockRejectedValue(
            new AragonBackendServiceError(
                'simulationBudgetExhausted',
                'Limit reached',
                429,
            ),
        );
        renderComponent();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.capitalFlow.dispatchSimulationDialog.limitReached',
        );
        expect(
            screen.getByRole('button', { name: continueLabel }),
        ).toBeDisabled();
    });

    it.each([
        new AragonBackendServiceError('tooBusy', 'Busy', 503),
        new AragonBackendServiceError('simulationFailed', 'Failed', 502),
        new Error('Network error'),
    ])('shows unavailable for $message', async (error) => {
        simulateDispatchSpy.mockRejectedValue(error);
        renderComponent();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.capitalFlow.dispatchSimulationDialog.unavailable',
        );
        expect(
            screen.getByRole('button', { name: continueLabel }),
        ).toBeDisabled();
    });

    it('continues after a successful simulation', async () => {
        const simulation: IProcessedSimulation = {
            status: 'success',
            summaryGroups: [],
        };
        simulateDispatchSpy.mockResolvedValue(simulation);
        renderComponent();

        const continueButton = screen.getByRole('button', {
            name: continueLabel,
        });
        await waitFor(() => expect(continueButton).toBeEnabled());
        expect(SimulationFlowVisualization).toHaveBeenCalledWith(
            expect.objectContaining({ simulation }),
            undefined,
        );
        fireEvent.click(continueButton);
        expect(close).toHaveBeenCalledWith(
            CapitalFlowDialogId.DISPATCH_SIMULATION,
        );
        expect(open).toHaveBeenCalledWith(
            CapitalFlowDialogId.DISPATCH_TRANSACTION,
            {
                params: { ...params, showBackButton: false },
                stack: true,
            },
        );
    });
});
