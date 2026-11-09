import { ActionSimulation } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
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

jest.mock('../../api/actionSimulationService', () => ({
    useSimulateProposalActions: jest.fn(),
    useSimulateDirectExecuteActions: jest.fn(),
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
    });

    afterEach(() => {
        useDialogContextMock.mockReset();
        useTranslationsMock.mockReset();
        mockProposalMutate.mockClear();
        mockDirectExecuteMutate.mockClear();
        useProposalSimulationMock.mockReset();
        useDirectExecuteSimulationMock.mockReset();
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
                from: '0xplugin',
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
            renderComponent(createLocation({ daoAddress }));

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

    it('simulates via the direct-execute mutation with the from address in the body when daoAddress is set', () => {
        useDialogContextMock.mockReturnValue({ close: jest.fn() });

        const location = createLocation({
            from: '0xwallet',
            daoAddress: '0xdao',
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

    it('simulates via the proposal mutation with the from address as pluginAddress when daoAddress is not set', () => {
        useDialogContextMock.mockReturnValue({ close: jest.fn() });

        const location = createLocation({
            from: '0xplugin',
            daoAddress: undefined,
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
