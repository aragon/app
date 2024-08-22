import { useStepper } from '@/shared/hooks/useStepper';
import { DialogContent, DialogFooter, Heading } from '@aragon/ods';
import { type UseMutationResult } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { TransactionStatus, type ITransactionStatusStepMeta } from '../transactionStatus';

export type TransactionDialogStep = UseMutationResult & {
    /**
     * ID of the step.
     */
    id: string;
    /**
     * Labels of the step depending on the step status.
     */
    stateLabel?: ITransactionStatusStepMeta['stateLabel'];
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
     * Children of the component.
     */
    children?: ReactNode;
}

export const TransactionDialog: React.FC<ITransactionDialogProps> = (props) => {
    const { title, description, steps = [], submitLabel, children } = props;
    const stepper = useStepper();

    const handleNextStep = () => {
        //
    };

    const handleCancel = () => {
        //
    };

    return (
        <>
            <DialogContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Heading size="h2">{title}</Heading>
                    <p className="text-sm font-normal leading-normal text-neutral-800">{description}</p>
                </div>
                {children}
                <TransactionStatus.Container activeStep={stepper.activeStep}>
                    {steps.map((step, index) => (
                        <TransactionStatus.Step
                            key={step.id}
                            id={step.id}
                            order={index}
                            meta={{ label: submitLabel, stateLabel: step.stateLabel }}
                        />
                    ))}
                    <TransactionStatus.Step
                        id="prepare"
                        order={steps.length}
                        meta={{ label: 'Prepare transaction', stateLabel: { error: 'Unable to prepare transaction' } }}
                    />
                    <TransactionStatus.Step
                        id="approve"
                        order={steps.length + 1}
                        meta={{ label: 'Approve transaction', stateLabel: { error: 'Rejected by wallet' } }}
                    />
                    <TransactionStatus.Step
                        id="confirm"
                        order={steps.length + 2}
                        meta={{ label: 'Onchain confirmation' }}
                    />
                </TransactionStatus.Container>
            </DialogContent>
            <DialogFooter
                primaryAction={{ label: 'Publish proposal', onClick: handleNextStep }}
                secondaryAction={{ label: 'Cancel', onClick: handleCancel }}
            />
        </>
    );
};
