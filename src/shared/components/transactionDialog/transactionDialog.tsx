import { useStepper } from '@/shared/hooks/useStepper';
import { DialogContent, DialogFooter, Heading } from '@aragon/ods';
import { useMutation } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { SendTransactionParameters } from 'wagmi/actions';
import { useDialogContext } from '../dialogProvider';
import { TransactionStatus, type ITransactionStatusMeta, type ITransactionStatusStep } from '../transactionStatus';

export type TransactionDialogTransaction = SendTransactionParameters;

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
    steps?: ITransactionStatusStep[];
    /**
     * Callback to be used for preparing the transaction to send to the wallet.
     */
    prepareTransaction: () => Promise<TransactionDialogTransaction>;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TransactionDialog: React.FC<ITransactionDialogProps> = (props) => {
    const { title, description, steps = [], submitLabel, children, prepareTransaction } = props;

    const { close } = useDialogContext();

    const stepper = useStepper<ITransactionStatusMeta>({
        initialActiveStep: steps.length > 0 ? steps[0].id : 'prepare',
    });
    const { activeStep } = stepper;

    const { sendTransaction, status: sendTransactonStatus, data: transactionHash } = useSendTransaction();

    const { status: waitTransactionStatus, isLoading: isWaitTransactionLoading } = useWaitForTransactionReceipt({
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
        if (
            activeStep === 'prepare' &&
            prepareTransactionStatus !== 'error' &&
            prepareTransactionStatus !== 'success'
        ) {
            // Automatically trigger the prepare-transaction callback when the prepare step is active
            prepareTx();
        }
    }, [prepareTx, activeStep, prepareTransactionStatus]);

    return (
        <>
            <DialogContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container stepper={stepper}>
                    {steps.map((step) => (
                        <TransactionStatus.Step key={step.id} id={step.id} order={step.order} meta={step.meta} />
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
                            state:
                                waitTransactionStatus === 'pending'
                                    ? isWaitTransactionLoading
                                        ? 'pending'
                                        : 'idle'
                                    : waitTransactionStatus,
                        }}
                    />
                </TransactionStatus.Container>
            </DialogContent>
            <DialogFooter
                primaryAction={{ label: submitLabel, onClick: handleNextStep }}
                secondaryAction={{ label: 'Cancel', onClick: close }}
            />
        </>
    );
};
