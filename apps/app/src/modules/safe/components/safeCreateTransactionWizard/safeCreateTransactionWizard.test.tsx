import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as proposalActionsEditor from '@/modules/governance/components/proposalActionsEditor';
import * as useSimulateActionsDropdown from '@/modules/governance/hooks/useSimulateActionsDropdown';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { FormWrapper, generateDialogContext } from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { SafeDialogId } from '../../constants/safeDialogId';
import {
    type ISafeCreateTransactionWizardProps,
    SafeCreateTransactionWizard,
} from './safeCreateTransactionWizard';
import { safeCreateTransactionWizardId } from './safeCreateTransactionWizardDefinitions';

describe('<SafeCreateTransactionWizard /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const proposalActionsEditorSpy = jest.spyOn(
        proposalActionsEditor,
        'ProposalActionsEditor',
    );
    const containerSpy = jest.spyOn(WizardPage, 'Container');
    const stepSpy = jest.spyOn(WizardPage, 'Step');
    const trackSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');
    const useSimulateActionsDropdownSpy = jest.spyOn(
        useSimulateActionsDropdown,
        'useSimulateActionsDropdown',
    );

    const safeAddress = '0x0000000000000000000000000000000000000001';
    const network = Network.ETHEREUM_SEPOLIA;
    const actions = [generateProposalAction()];

    const openMock = jest.fn();

    /**
     * The wizard container submits whatever actions the form holds, so the test stands in for it with a form that
     * submits the given ones.
     */
    const mockContainer = (submittedActions = actions) =>
        containerSpy.mockImplementation((props) => (
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    props.onSubmit?.({ actions: submittedActions });
                }}
            >
                {props.children}
                <button type="submit">{props.submitLabel}</button>
            </form>
        ));

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openMock }),
        );
        proposalActionsEditorSpy.mockReturnValue(<div>actions editor</div>);
        stepSpy.mockImplementation((props) => <div>{props.children}</div>);
        trackSpy.mockImplementation(() => undefined);
        useSimulateActionsDropdownSpy.mockReturnValue(undefined);
        mockContainer();
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        proposalActionsEditorSpy.mockReset();
        containerSpy.mockReset();
        stepSpy.mockReset();
        trackSpy.mockReset();
        useSimulateActionsDropdownSpy.mockReset();
        openMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeCreateTransactionWizardProps>,
        formActions: unknown[] = [],
    ) => {
        const completeProps: ISafeCreateTransactionWizardProps = {
            network,
            safeAddress,
            ...props,
        };

        return (
            <FormWrapper defaultValues={{ actions: formActions }}>
                <SafeCreateTransactionWizard {...completeProps} />
            </FormWrapper>
        );
    };

    it('composes the actions for the network of the Safe, outside any DAO, with the Safe as the account running them', () => {
        render(createTestComponent());

        expect(screen.getByText('actions editor')).toBeInTheDocument();
        expect(proposalActionsEditorSpy).toHaveBeenCalledWith(
            { network, accountAddress: safeAddress },
            undefined,
        );
    });

    it('offers no next step until there is an action', () => {
        render(createTestComponent());

        expect(stepSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ disableNext: true }),
            undefined,
        );
    });

    it('offers to simulate the Safe transaction on the network of the Safe before creating it', () => {
        const dropdownItems = [
            { label: 'simulate', onClick: jest.fn() },
            { label: 'skip', formId: safeCreateTransactionWizardId },
        ];
        useSimulateActionsDropdownSpy.mockReturnValue(dropdownItems);

        render(createTestComponent(undefined, actions));

        expect(useSimulateActionsDropdownSpy).toHaveBeenLastCalledWith({
            network,
            target: { type: 'safe', safeAddress },
            formId: safeCreateTransactionWizardId,
        });
        expect(stepSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ nextDropdownItems: dropdownItems }),
            undefined,
        );
    });

    it('enables the next step once there is an action', () => {
        render(createTestComponent(undefined, actions));

        expect(stepSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ disableNext: undefined }),
            undefined,
        );
    });

    it('opens the create dialog of the Safe with the composed actions', async () => {
        const onCreated = jest.fn();
        render(createTestComponent({ onCreated }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.safe.safeCreateTransactionWizard.submitLabel',
            }),
        );

        expect(openMock).toHaveBeenCalledWith(SafeDialogId.CREATE_TRANSACTION, {
            params: {
                network,
                safeAddress,
                actions,
                prepareActions: {},
                onCreated,
            },
        });
        expect(trackSpy).toHaveBeenCalledWith('wizard_submit', {
            flow: 'safe_create_transaction',
            actionCount: actions.length,
        });
    });
});
