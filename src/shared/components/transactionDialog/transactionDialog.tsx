import { useStepper } from '@/shared/hooks/useStepper';
import { DialogContent, DialogFooter, Heading } from '@aragon/ods';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import type { Transaction } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useDialogContext } from '../dialogProvider';
import { TransactionStatus, type ITransactionStatusMeta } from '../transactionStatus';

export type TransactionDialogStep = Pick<UseMutationResult, 'status'> & {
    /**
     * ID of the step.
     */
    id: string;
    /**
     * Labels of the step depending on the step status.
     */
    stateLabel?: ITransactionStatusMeta['stateLabel'];
};

export interface ITransactionDialogProps {
    /**
     * Title of the dialog.
     */
    title: string;
    /**
     * Description of the dialog.
     */
    description: string;
    /**
     * Label for the submit button used as fallback when the specific step state label is not set.
     */
    submitLabel: string;
    /**
     * Custom steps needed for the transaction.
     */
    steps?: TransactionDialogStep[];
    /**
     * Callback to be used for preparing the transaction to send to the wallet.
     */
    prepareTransaction: () => Promise<Transaction>;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TransactionDialog: React.FC<ITransactionDialogProps> = (props) => {
    const { title, description, steps = [], submitLabel, children, prepareTransaction } = props;

    const { close } = useDialogContext();
    const stepper = useStepper<ITransactionStatusMeta>();

    const { sendTransaction, status: sendTransactonStatus, data: transactionHash } = useSendTransaction();

    const { status: waitTransactionStatus } = useWaitForTransactionReceipt({
        hash: transactionHash,
        query: { enabled: transactionHash != null },
    });

    const {
        mutate: prepareTx,
        status: prepareTransactionStatus,
        data: transaction,
    } = useMutation({
        mutationFn: prepareTransaction,
    });

    const handleNextStep = () => {
        if (transaction != null) {
            sendTransaction(transaction);
        }
    };

    useEffect(() => {
        if (prepareTransactionStatus !== 'error' && prepareTransactionStatus !== 'success') {
            // Trigger the prepare-transaction callback on dialog mount
            prepareTx();
        }
    }, [prepareTx, prepareTransactionStatus]);

    return (
        <>
            <DialogContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container stepper={stepper}>
                    {steps.map((step, index) => (
                        <TransactionStatus.Step
                            key={step.id}
                            id={step.id}
                            order={index}
                            meta={{ label: submitLabel, stateLabel: step.stateLabel, state: step.status }}
                        />
                    ))}
                    <TransactionStatus.Step
                        id="prepare"
                        order={steps.length}
                        meta={{
                            label: 'Prepare transaction',
                            stateLabel: { error: 'Unable to prepare transaction' },
                            state: prepareTransactionStatus,
                        }}
                    />
                    <TransactionStatus.Step
                        id="approve"
                        order={steps.length + 1}
                        meta={{
                            label: 'Approve transaction',
                            stateLabel: { error: 'Rejected by wallet' },
                            state: sendTransactonStatus,
                        }}
                    />
                    <TransactionStatus.Step
                        id="confirm"
                        order={steps.length + 2}
                        meta={{
                            label: 'Onchain confirmation',
                            stateLabel: { error: 'Confirmation failed' },
                            state: waitTransactionStatus,
                        }}
                    />
                </TransactionStatus.Container>
            </DialogContent>
            <DialogFooter
                primaryAction={{ label: 'Publish proposal', onClick: handleNextStep }}
                secondaryAction={{ label: 'Cancel', onClick: close }}
            />
        </>
    );
};
