import { ActionSimulation } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { safeProtocolKitUtils } from '@/modules/safe/utils/safeProtocolKitUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { Network } from '@/shared/api/daoService';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
} from '@/shared/testUtils';
import * as actionSimulationService from '../../api/actionSimulationService';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { ISimulateActionsDialogParams } from './simulateActionsDialog';
import { SimulateActionsDialog } from './simulateActionsDialog';

// In the app, dialogs are rendered inside DialogRoot which wraps them with <Dialog.Root />.
// In unit tests we render the dialog component directly, so we mock Dialog.* primitives to avoid Radix context errors.
jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');

    const Dialog = {
        Header: (props: { title: string; onClose?: () => void }) => (
            <div>
                <div>{props.title}</div>
                <button onClick={props.onClose} type="button">
                    close
                </button>
            </div>
        ),
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: { label: string; onClick?: () => void };
        }) => (
            <button onClick={props.primaryAction.onClick} type="button">
                {props.primaryAction.label}
            </button>
        ),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        Dialog,
        ActionSimulation: jest.fn(() => null),
    };
});

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@/shared/components/dialogProvider', () => ({
    useDialogContext: jest.fn(),
}));

const mockProposalMutate = jest.fn();
const mockDirectExecuteMutate = jest.fn();
const mockSafeMutate = jest.fn();

jest.mock('../../api/actionSimulationService', () => ({
    useSimulateProposalActions: jest.fn(),
    useSimulateDirectExecuteActions: jest.fn(),
    useSimulateSafeActions: jest.fn(),
}));

describe('<SimulateActionsDialog /> component', () => {
    const useDialogContextMock =
        dialogProvider.useDialogContext as unknown as jest.Mock;
    const useTranslationsMock =
        translationsProvider.useTranslations as unknown as jest.Mock;
    const useProposalSimulationMock = jest.mocked(
        actionSimulationService.useSimulateProposalActions,
    );
    const useDirectExecuteSimulationMock = jest.mocked(
        actionSimulationService.useSimulateDirectExecuteActions,
    );
    const useSafeSimulationMock = jest.mocked(
        actionSimulationService.useSimulateSafeActions,
    );
    const initReadOnlySpy = jest.spyOn(safeProtocolKitUtils, 'initReadOnly');
    const buildTransactionCallSpy = jest.spyOn(
        safeProtocolKitUtils,
        'buildTransactionCall',
    );

    beforeEach(() => {
        useTranslationsMock.mockReturnValue({ t: (key: string) => key });
        useDialogContextMock.mockReturnValue({ close: jest.fn() });
        useProposalSimulationMock.mockReturnValue(
            generateReactQueryMutationResultIdle({
                mutate: mockProposalMutate,
            }),
        );
        useDirectExecuteSimulationMock.mockReturnValue(
            generateReactQueryMutationResultIdle({
                mutate: mockDirectExecuteMutate,
            }),
        );
        useSafeSimulationMock.mockReturnValue(
            generateReactQueryMutationResultIdle({ mutate: mockSafeMutate }),
        );
    });

    afterEach(() => {
        useDialogContextMock.mockReset();
        useTranslationsMock.mockReset();
        mockProposalMutate.mockClear();
        mockDirectExecuteMutate.mockClear();
        useProposalSimulationMock.mockReset();
        useDirectExecuteSimulationMock.mockReset();
        mockSafeMutate.mockClear();
        useSafeSimulationMock.mockReset();
        initReadOnlySpy.mockReset();
        buildTransactionCallSpy.mockReset();
        jest.mocked(ActionSimulation).mockClear();
    });

    const createLocation = (
        params?: Partial<ISimulateActionsDialogParams>,
    ): IDialogLocation<ISimulateActionsDialogParams> =>
        ({
            id: 'SIMULATE_ACTIONS_TEST',
            params: {
                network:
                    'ethereum' as unknown as ISimulateActionsDialogParams['network'],
                target: { type: 'plugin', pluginAddress: '0xplugin' },
                actions: [{ to: '0xto', data: '0xdata', value: BigInt(0) }],
                ...params,
            },
        }) as IDialogLocation<ISimulateActionsDialogParams>;

    const renderComponent = (
        location: IDialogLocation<ISimulateActionsDialogParams>,
    ) => render(<SimulateActionsDialog location={location} />);

    it.each([
        ['proposal', undefined],
        ['direct execution', '0xdao'],
    ])(
        'shows the limit text for %s when the budget is finished',
        (_mode, daoAddress) => {
            const target: ISimulateActionsDialogParams['target'] =
                daoAddress == null
                    ? { type: 'plugin', pluginAddress: '0xplugin' }
                    : { type: 'dao', daoAddress, from: '0xwallet' };
            const close = jest.fn();
            useDialogContextMock.mockReturnValue({ close });
            const simulation = {
                isError: true,
                isPending: false,
                status: 'error',
                error: new AragonBackendServiceError(
                    'simulationBudgetExhausted',
                    'Limit reached',
                    429,
                ),
            };
            if (daoAddress == null) {
                useProposalSimulationMock.mockReturnValue(
                    simulation as ReturnType<
                        typeof actionSimulationService.useSimulateProposalActions
                    >,
                );
            } else {
                useDirectExecuteSimulationMock.mockReturnValue(
                    simulation as ReturnType<
                        typeof actionSimulationService.useSimulateDirectExecuteActions
                    >,
                );
            }
            renderComponent(createLocation({ target }));

            expect(ActionSimulation).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'app.governance.simulateActionsDialog.limitReached',
                }),
                undefined,
            );
            const continueButton = screen.getByRole('button', {
                name: 'app.governance.simulateActionsDialog.action.error',
            });
            fireEvent.click(continueButton);
            expect(close).toHaveBeenCalledWith(
                GovernanceDialogId.SIMULATE_ACTIONS,
            );
        },
    );

    it.each([
        ['tooBusy', 503, 'unavailable'],
        ['simulationBudgetCheckFailed', 503, 'unavailable'],
        ['simulationFailed', 502, 'error'],
        ['badSimulationRequest', 400, 'error'],
    ])('shows the %s error as %s', (code, status, errorKey) => {
        useProposalSimulationMock.mockReturnValue({
            isError: true,
            isPending: false,
            status: 'error',
            error: new AragonBackendServiceError(code, 'Unavailable', status),
        } as ReturnType<
            typeof actionSimulationService.useSimulateProposalActions
        >);
        renderComponent(createLocation());

        expect(ActionSimulation).toHaveBeenCalledWith(
            expect.objectContaining({
                error: `app.governance.simulateActionsDialog.${errorKey}`,
            }),
            undefined,
        );
        expect(
            screen.getByRole('button', {
                name: 'app.governance.simulateActionsDialog.action.error',
            }),
        ).toBeEnabled();
    });

    it('offers continue anyway when the actions would fail', () => {
        const close = jest.fn();
        useDialogContextMock.mockReturnValue({ close });
        useProposalSimulationMock.mockReturnValue(
            generateReactQueryMutationResultSuccess({
                data: generateSimulationResult({ status: 'failed' }),
            }),
        );
        renderComponent(createLocation());

        fireEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.simulateActionsDialog.action.error',
            }),
        );
        expect(close).toHaveBeenCalledWith(GovernanceDialogId.SIMULATE_ACTIONS);
    });

    it('simulates via the direct-execute mutation with the from address in the body for a DAO target', () => {
        useDialogContextMock.mockReturnValue({ close: jest.fn() });

        const location = createLocation({
            target: { type: 'dao', daoAddress: '0xdao', from: '0xwallet' },
        });
        renderComponent(location);

        expect(mockDirectExecuteMutate).toHaveBeenCalledWith({
            urlParams: { network: 'ethereum', daoAddress: '0xdao' },
            body: {
                from: '0xwallet',
                actions: [{ to: '0xto', data: '0xdata', value: '0' }],
            },
        });
        expect(mockProposalMutate).not.toHaveBeenCalled();
    });

    it('simulates via the proposal mutation for a plugin target', () => {
        useDialogContextMock.mockReturnValue({ close: jest.fn() });

        const location = createLocation({
            target: { type: 'plugin', pluginAddress: '0xplugin' },
        });
        renderComponent(location);

        expect(mockProposalMutate).toHaveBeenCalledWith({
            urlParams: { network: 'ethereum', pluginAddress: '0xplugin' },
            body: {
                actions: [{ to: '0xto', data: '0xdata', value: '0' }],
            },
        });
        expect(mockDirectExecuteMutate).not.toHaveBeenCalled();
    });

    it('builds the Safe transaction with a read-only protocol kit and simulates it for a Safe target', async () => {
        const protocolKit = { kit: true };
        const transactionCall = {
            to: '0xmultisend',
            value: '0',
            data: '0x8d80ff0a',
            operation: 1 as const,
        };
        initReadOnlySpy.mockResolvedValue(protocolKit as never);
        buildTransactionCallSpy.mockResolvedValue(transactionCall);
        const actions = [
            { to: '0xto', data: '0xdata', value: BigInt(1) },
            { to: '0xother', data: '0x', value: BigInt(0) },
        ];

        renderComponent(
            createLocation({
                network: Network.ETHEREUM_SEPOLIA,
                target: { type: 'safe', safeAddress: '0xsafe' },
                actions: actions as ISimulateActionsDialogParams['actions'],
            }),
        );

        expect(ActionSimulation).toHaveBeenLastCalledWith(
            expect.objectContaining({ isLoading: true }),
            undefined,
        );
        await waitFor(() =>
            expect(mockSafeMutate).toHaveBeenCalledWith({
                urlParams: {
                    network: Network.ETHEREUM_SEPOLIA,
                    safeAddress: '0xsafe',
                },
                body: transactionCall,
            }),
        );
        expect(initReadOnlySpy).toHaveBeenCalledWith({
            chainId: networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
            safeAddress: '0xsafe',
        });
        expect(buildTransactionCallSpy).toHaveBeenCalledWith({
            protocolKit,
            calls: actions,
        });
        expect(mockProposalMutate).not.toHaveBeenCalled();
        expect(mockDirectExecuteMutate).not.toHaveBeenCalled();
    });

    it('shows simulation as unavailable and lets the user continue when the Safe transaction cannot be built', async () => {
        initReadOnlySpy.mockRejectedValue(new Error('no client'));

        renderComponent(
            createLocation({ target: { type: 'safe', safeAddress: '0xsafe' } }),
        );

        await waitFor(() =>
            expect(ActionSimulation).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    error: 'app.governance.simulateActionsDialog.unavailable',
                    isLoading: false,
                }),
                undefined,
            ),
        );
        expect(mockSafeMutate).not.toHaveBeenCalled();
        expect(
            screen.getByRole('button', {
                name: 'app.governance.simulateActionsDialog.action.error',
            }),
        ).toBeInTheDocument();
    });

    it('closes only itself after requesting wizard form submit (does not call close() without id)', () => {
        const close = jest.fn();
        useDialogContextMock.mockReturnValue({ close });

        const formId = 'createProposalWizard';
        const form = document.createElement('form');
        form.id = formId;
        document.body.appendChild(form);
        const requestSubmitMock = jest.fn();
        form.requestSubmit = requestSubmitMock;

        const location = createLocation({ formId });
        renderComponent(location);

        fireEvent.click(
            screen.getByText(
                'app.governance.simulateActionsDialog.action.success',
            ),
        );

        expect(requestSubmitMock).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledWith(GovernanceDialogId.SIMULATE_ACTIONS);
        expect(close).not.toHaveBeenCalledWith();
    });

    it('closes only itself when used without formId', () => {
        const close = jest.fn();
        useDialogContextMock.mockReturnValue({ close });

        const location = createLocation({ formId: undefined });
        renderComponent(location);

        fireEvent.click(
            screen.getByText(
                'app.governance.simulateActionsDialog.action.success',
            ),
        );

        expect(close).toHaveBeenCalledWith(GovernanceDialogId.SIMULATE_ACTIONS);
        expect(close).not.toHaveBeenCalledWith();
    });
});
