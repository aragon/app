import type { Network } from '@/shared/api/daoService';
import type { TransactionType } from '@/shared/api/transactionService';
import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { ReactNode } from 'react';
import type { TransactionReceipt } from 'viem';
import type { ITransactionInfo, ITransactionStatusStepMeta } from '../transactionStatus';

export interface IBuildTransactionDialogSuccessLinkHref {
    /**
     * Receipt of the transaction used for building the success link.
     */
    receipt: TransactionReceipt;
    /**
     * Slug of the proposal only passed if the transaction type is creating a proposal.
     */
    slug?: string;
}

// Static or dynamic link based displayed as success transaction link.
export type TransactionDialogSuccessLinkHref = string | ((params: IBuildTransactionDialogSuccessLinkHref) => string);

export interface ITransactionDialogActionParams {
    /**
     * Callback to be triggered if an error occurs to properly monitor the transaction status.
     */
    onError: (error: unknown) => void;
}

// Default steps of the TransactionDialog component
export enum TransactionDialogStep {
    PREPARE = 'PREPARE',
    APPROVE = 'APPROVE',
    CONFIRM = 'CONFIRM',
    INDEXING = 'INDEXING',
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
    href?: TransactionDialogSuccessLinkHref;
    /**
     * Callback triggered on success link click.
     */
    onClick?: (receipt: TransactionReceipt) => void;
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
    successLink?: ITransactionDialogSuccessLink;
    /**
     * Custom steps needed for the transaction.
     */
    customSteps?: Array<ITransactionDialogStep<TCustomStepId>>;
    /**
     * Information about the stepper in the current transaction dialog.
     */
    transactionInfo?: ITransactionInfo;
    /**
     * Stepper utilities for the transaction state.
     */
    stepper: IUseStepperReturn<ITransactionDialogStepMeta, TCustomStepId | TransactionDialogStep>;
    /**
     * Callback to be used for preparing the transaction to send to the wallet.
     */
    prepareTransaction: () => Promise<ITransactionRequest>;
    /**
     * Callback called on cancel button click.
     */
    onCancelClick?: () => void;
    /**
     * Callback called when the transaction has been successfully included on the block.
     */
    onSuccess?: (receipt: TransactionReceipt) => void;
    /**
     * The Network the user must be connected to for the transaction.
     * @default Network.ETHEREUM_MAINNET
     */
    network?: Network;
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * Type of the transaction to determine whether or not to show the indexing step.
     */
    transactionType?: TransactionType;
    /**
     * Fallback URL shown when the indexing step takes too long.
     */
    indexingFallbackUrl?: string;
}
