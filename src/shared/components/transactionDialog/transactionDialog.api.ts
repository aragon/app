import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type { ReactNode } from 'react';
import type { TransactionReceipt } from 'viem';
import type { SendTransactionParameters } from 'wagmi/actions';
import type { ITransactionStatusStepMeta } from '../transactionStatus';

// Return type for the prepareTransaction property of the TransactionDialog component
export type TransactionDialogPrepareReturn = SendTransactionParameters;

// Static or dynamic link based on the transaction receipt.
export type TransactionDialogSuccessLinkHref = string | ((receipt: TransactionReceipt) => string);

export interface ITransactionDialogActionParams {
    /**
     * Callback to be triggered if an error occurs to propertly monitor the transaction status.
     */
    onError: (error: unknown) => void;
}

// Default steps of the TransactionDialog component
export enum TransactionDialogStep {
    PREPARE = 'PREPARE',
    APPROVE = 'APPROVE',
    CONFIRM = 'CONFIRM',
}

export interface ITransactionDialogStepMeta extends ITransactionStatusStepMeta {
    /**
     * Action to be triggered to advance the transaction step.
     */
    action?: (params: ITransactionDialogActionParams) => void;
    /**
     * Automatically triggers the action when the step is active.
     */
    auto?: boolean;
}

export interface ITransactionDialogStep<TCustomStepId extends string = string>
    extends IStepperStep<ITransactionDialogStepMeta, TCustomStepId> {}

export interface ITransactionDialogSuccessLink {
    /**
     * Label of the success link.
     */
    label: string;
    /**
     * URL of the success link.
     */
    href: TransactionDialogSuccessLinkHref;
}

export interface ITransactionDialogProps<TCustomStepId extends string = string> {
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
     * Label for the submit button used when the transaction has been successful.
     */
    successLink: ITransactionDialogSuccessLink;
    /**
     * Custom steps needed for the transaction.
     */
    customSteps?: Array<ITransactionDialogStep<TCustomStepId>>;
    /**
     * Stepper utilities for the transaction state.
     */
    stepper: IUseStepperReturn<ITransactionDialogStepMeta, TCustomStepId | TransactionDialogStep>;
    /**
     * Callback to be used for preparing the transaction to send to the wallet.
     */
    prepareTransaction: () => Promise<TransactionDialogPrepareReturn>;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}
