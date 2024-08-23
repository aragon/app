import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { ReactNode } from 'react';
import type { SendTransactionParameters } from 'wagmi/actions';
import type { ITransactionStatusMeta, ITransactionStatusStep } from '../transactionStatus';

// Return type for the prepareTransaction property of the TransactionDialog component
export type TransactionDialogPrepareReturn = SendTransactionParameters;

// Default steps of the TransactionDialog component
export enum TransactionDialogStep {
    PREPARE = 'PREPARE',
    APPROVE = 'APPROVE',
    CONFIRM = 'CONFIRM',
}

export interface ITransactionDialogStep<TCustomStepId> extends ITransactionStatusStep<TCustomStepId> {
    /**
     * Action to be triggered to advance the custom step.
     */
    action?: () => void;
}

export interface ITransactionDialogProps<TCustomStepId = string> {
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
    customSteps?: Array<ITransactionDialogStep<TCustomStepId>>;
    /**
     * Stepper utilities for the transaction state.
     */
    stepper: IUseStepperReturn<ITransactionStatusMeta, TCustomStepId | TransactionDialogStep>;
    /**
     * Callback to be used for preparing the transaction to send to the wallet.
     */
    prepareTransaction: () => Promise<TransactionDialogPrepareReturn>;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}
