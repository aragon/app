import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import type { IconType } from '@aragon/ods';
import { createContext, useContext } from 'react';

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
     * Label displayed depending on the current state, defaults to label.
     */
    stateLabel?: Partial<Record<TransactionStatusState, string>>;
    /**
     * Addon displayed beside the step label.
     */
    addon?: ITransactionStatusMetaAddon;
}

const transactionStatusContext = createContext<IUseStepperReturn<ITransactionStatusMeta> | null>(null);

export const TransactionStatusProvider = transactionStatusContext.Provider;

export const useTransactionStatusContext = () => {
    const values = useContext(transactionStatusContext);

    if (values == null) {
        throw new Error(
            'useTransactionStatusContext: hook must be used inside a TransactionStatusProvider to work propertly.',
        );
    }

    return values;
};
