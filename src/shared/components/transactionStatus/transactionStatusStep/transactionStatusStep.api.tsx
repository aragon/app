import { type IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type { IconType } from '@aragon/ods';
import { type ComponentProps } from 'react';

export type TransactionStatusState = 'pending' | 'error' | 'warning' | 'idle' | 'success';

export interface ITransactionStatusMetaAddon {
    /**
     * Icon of the addon.
     */
    icon?: IconType;
    /**
     * Text of the addon.
     */
    text: string;
    /**
     * Link of the addon.
     */
    href?: string;
}

export interface ITransactionStatusMeta {
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
     * Addon displayed beside the step label.
     */
    addon?: ITransactionStatusMetaAddon;
}

export interface ITransactionStatusStep<TStepId = string> extends IStepperStep<ITransactionStatusMeta, TStepId> {}

export interface ITransactionStatusStepProps
    extends Omit<ITransactionStatusStep, 'meta'>,
        ITransactionStatusMeta,
        Omit<ComponentProps<'div'>, 'id'> {
    /**
     * Callback to register the step.
     */
    registerStep?: IUseStepperReturn<ITransactionStatusMeta>['registerStep'];
}
