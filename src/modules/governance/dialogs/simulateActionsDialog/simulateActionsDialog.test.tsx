import * as dialogProvider from '@/shared/components/dialogProvider';
import { type IDialogLocation } from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { fireEvent, render, screen } from '@testing-library/react';
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
                <button type="button" onClick={props.onClose}>
                    close
                </button>
            </div>
        ),
        Content: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
        Footer: (props: { primaryAction: { label: string; onClick?: () => void } }) => (
            <button type="button" onClick={props.primaryAction.onClick}>
                {props.primaryAction.label}
            </button>
        ),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        Dialog,
        ActionSimulation: () => <div data-testid="action-simulation" />,
    };
});

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@/shared/components/dialogProvider', () => ({
    useDialogContext: jest.fn(),
}));

jest.mock('../../api/actionSimulationService', () => ({
    useSimulateActions: () => ({
        mutate: jest.fn(),
        isError: false,
        isPending: false,
        status: 'success',
        data: { status: 'success', runAt: 123, url: 'https://tenderly.co/simulation/123' },
    }),
}));

describe('<SimulateActionsDialog /> component', () => {
    const useDialogContextMock = dialogProvider.useDialogContext as unknown as jest.Mock;
    const useTranslationsMock = translationsProvider.useTranslations as unknown as jest.Mock;

    beforeEach(() => {
        useTranslationsMock.mockReturnValue({ t: (key: string) => key });
    });

    afterEach(() => {
        useDialogContextMock.mockReset();
        useTranslationsMock.mockReset();
    });

    const createLocation = (
        params?: Partial<ISimulateActionsDialogParams>,
    ): IDialogLocation<ISimulateActionsDialogParams> =>
        ({
            id: 'SIMULATE_ACTIONS_TEST',
            params: {
                network: 'ethereum' as unknown as ISimulateActionsDialogParams['network'],
                pluginAddress: '0xplugin',
                actions: [{ to: '0xto', data: '0xdata', value: BigInt(0) }],
                ...params,
            },
        }) as IDialogLocation<ISimulateActionsDialogParams>;

    const renderComponent = (location: IDialogLocation<ISimulateActionsDialogParams>) => {
        return render(<SimulateActionsDialog location={location} />);
    };

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

        fireEvent.click(screen.getByText('app.governance.simulateActionsDialog.action.success'));

        expect(requestSubmitMock).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledWith(GovernanceDialogId.SIMULATE_ACTIONS);
        expect(close).not.toHaveBeenCalledWith();
    });

    it('closes only itself when used without formId', () => {
        const close = jest.fn();
        useDialogContextMock.mockReturnValue({ close });

        const location = createLocation({ formId: undefined });
        renderComponent(location);

        fireEvent.click(screen.getByText('app.governance.simulateActionsDialog.action.success'));

        expect(close).toHaveBeenCalledWith(GovernanceDialogId.SIMULATE_ACTIONS);
        expect(close).not.toHaveBeenCalledWith();
    });
});
