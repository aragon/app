import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as proposalActionsEditor from '@/modules/governance/components/proposalActionsEditor';
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

describe('<SafeCreateTransactionWizard /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const proposalActionsEditorSpy = jest.spyOn(
        proposalActionsEditor,
        'ProposalActionsEditor',
    );
    const containerSpy = jest.spyOn(WizardPage, 'Container');
    const stepSpy = jest.spyOn(WizardPage, 'Step');
    const trackSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

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
        mockContainer();
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        proposalActionsEditorSpy.mockReset();
        containerSpy.mockReset();
        stepSpy.mockReset();
        trackSpy.mockReset();
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

    it('composes the actions for the network of the Safe, outside any DAO', () => {
        render(createTestComponent());

        expect(screen.getByText('actions editor')).toBeInTheDocument();
        expect(proposalActionsEditorSpy).toHaveBeenCalledWith(
            { network },
            undefined,
        );
    });

    it('offers no simulation and no next step until there is an action', () => {
        render(createTestComponent());

        expect(stepSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ disableNext: true }),
            undefined,
        );
        expect(stepSpy.mock.lastCall?.[0]).not.toHaveProperty(
            'nextDropdownItems',
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
