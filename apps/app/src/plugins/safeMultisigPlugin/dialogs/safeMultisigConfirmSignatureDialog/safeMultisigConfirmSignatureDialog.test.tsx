import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { SafeMultisigPluginDialogId } from '../../constants';
import {
    type ISafeMultisigConfirmSignatureDialogParams,
    type ISafeMultisigConfirmSignatureDialogProps,
    SafeMultisigConfirmSignatureDialog,
} from './safeMultisigConfirmSignatureDialog';

jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
        Content: (props: {
            description?: string;
            children?: React.ReactNode;
        }) => (
            <div>
                <p>{props.description}</p>
                {props.children}
            </div>
        ),
        Footer: (props: {
            primaryAction: { label: string; onClick?: () => void };
            secondaryAction?: { label: string; onClick?: () => void };
        }) => (
            <div>
                {props.secondaryAction != null && (
                    <button
                        onClick={props.secondaryAction.onClick}
                        type="button"
                    >
                        {props.secondaryAction.label}
                    </button>
                )}
                <button onClick={props.primaryAction.onClick} type="button">
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
});

describe('<SafeMultisigConfirmSignatureDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const close = jest.fn();
    const onConfirm = jest.fn();

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        close.mockReset();
        onConfirm.mockReset();
    });

    const createTestComponent = (
        params?: Partial<ISafeMultisigConfirmSignatureDialogParams>,
    ) => {
        const completeParams: ISafeMultisigConfirmSignatureDialogParams = {
            proposalTitle: 'Fund the treasury',
            safeAddress: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
            signerAddress: '0x0000000000000000000000000000000000000011',
            network: Network.ETHEREUM_MAINNET,
            isVeto: false,
            willExecute: false,
            onConfirm,
            ...params,
        };

        const completeProps: ISafeMultisigConfirmSignatureDialogProps = {
            location: {
                id: SafeMultisigPluginDialogId.CONFIRM_SIGNATURE,
                params: completeParams,
            },
        };

        return <SafeMultisigConfirmSignatureDialog {...completeProps} />;
    };

    it('states what is being signed and that the signature is free', () => {
        render(createTestComponent());

        expect(screen.getByText('Fund the treasury')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.gasless',
            ),
        ).toBeInTheDocument();
    });

    it('names the veto effect rather than a neutral signature for a veto body', () => {
        render(createTestComponent({ isVeto: true }));

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.veto.title',
            ),
        ).toBeInTheDocument();
    });

    it('omits the nonce when queueing a report whose nonce is not allocated yet', () => {
        render(createTestComponent());

        // Naming a nonce that the submit-time read may not use would be worse than saying nothing.
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.details.nonce',
            ),
        ).not.toBeInTheDocument();
    });

    it('shows the nonce when countersigning a queued report', () => {
        render(createTestComponent({ nonce: '6' }));

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.details.nonce',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('closes before signing so the wallet prompt is not stacked behind the dialog', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.approval.action',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onConfirm).toHaveBeenCalled();
    });

    it('does not sign when the owner cancels', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog.cancel',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
