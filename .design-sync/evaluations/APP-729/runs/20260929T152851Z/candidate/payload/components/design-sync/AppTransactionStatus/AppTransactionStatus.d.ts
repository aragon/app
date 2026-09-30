import * as React from 'react';

/**
 * AppTransactionStatus — from @aragon/app@1.39.1 (apps/app/src/shared/components/transactionStatus/index.ts).
 */
export interface AppTransactionStatusProps {

}

import type { IconType } from '@aragon/gov-ui-kit';
import type { CSSProperties } from 'react';

export interface ITransactionStatusStepMeta {
    /**
     * Label of the step.
     */
    label: string;
    /**
     * State of the step.
     */
    state: TransactionStatusState;
    /**
     * Label displayed when state is error, defaults to label when not set.
     */
    errorLabel?: string;
    /**
     * Label displayed when state is warning, defaults to label when not set.
     */
    warningLabel?: string;
    /**
     * Addon displayed beside the step label.
     */
    addon?: ITransactionStatusStepMetaAddon;
}

export type TransactionStatusState =
    | 'pending'
    | 'error'
    | 'warning'
    | 'idle'
    | 'success';

export interface ITransactionStatusStepMetaAddon {
    /**
     * Icon of the addon.
     */
    icon?: IconType;
    /**
     * Label of the addon.
     */
    label: string;
    /**
     * Link of the addon.
     */
    href?: string;
}

export interface IStepperStep<TMeta = undefined, TStepId = string> {
    /**
     * ID of the step.
     */
    id: TStepId;
    /**
     * Order of the step inside the steps array.
     */
    order: number;
    /**
     * Metadata of the step.
     */
    meta: TMeta;
}

export interface ITransactionInfo {
    /**
     * Current title of the stepper.
     */
    title: string;
    /**
     * Current phase of the stepper based on the active dialog.
     */
    current?: number;
    /**
     * Total number of phases in the dialog flow.
     */
    total?: number;
}

export interface TransactionStatusContainerProps<TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta, TStepId extends string = string> {
  /** Information about the stepper steps and state. */
  steps: IStepperStep<TMeta, TStepId>[];
  /** Information about the stepper in the current transaction dialog. */
  transactionInfo?: ITransactionInfo;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface TransactionStatusStepProps<TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta, TStepId extends string = string> {
  /** Callback to register the step. */
  registerStep?: (step: IStepperStep<TMeta, TStepId>) => void;
  /** ID of the step. */
  id: TStepId;
  /** Order of the step inside the steps array. */
  order: number;
  /** Metadata of the step. */
  meta: TMeta;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
}

export declare const AppTransactionStatus: {
  Container: React.ComponentType<TransactionStatusContainerProps>;
  Step: React.ComponentType<TransactionStatusStepProps>;
};
