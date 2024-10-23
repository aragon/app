import { type IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type { IconType } from '@aragon/gov-ui-kit';
import { type ComponentProps } from 'react';

export type TransactionStatusState = 'pending' | 'error' | 'warning' | 'idle' | 'success';

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

export interface ITransactionStatusStep<
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
> extends IStepperStep<TMeta, TStepId> {}

export interface ITransactionStatusStepProps<
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
> extends ITransactionStatusStep<TMeta, TStepId>,
        Omit<ComponentProps<'li'>, 'id'> {
    /**
     * Callback to register the step.
     */
    registerStep?: IUseStepperReturn<TMeta, TStepId>['registerStep'];
}
