import type { IStepperStep } from '@/shared/utils/stepperUtils';
import type { IconType } from '@aragon/ods';

export type TransactionStatusState = 'pending' | 'error' | 'warning' | 'idle' | 'success';

export interface ITransactionStatusStepMetaInfo {
    /**
     * Icon of the step info.
     */
    icon?: IconType;
    /**
     * Text of the step info.
     */
    text: string;
}

export interface ITransactionStatusStepMetaLink {
    /**
     * URL of the link.
     */
    href: string;
    /**
     * Label of the link.
     */
    label: string;
}

export interface ITransactionStatusStepMeta {
    /**
     * Label of the step.
     */
    label: string;
    /**
     * State of the step, defaults to 'idle' if step is active and to 'success' if it is a previous step.
     */
    state?: TransactionStatusState;
    /**
     * Label displayed depending on the current state, defaults to label.
     */
    stateLabel?: Partial<Record<TransactionStatusState, string>>;
    /**
     * Step info displayed beside the label.
     */
    info?: ITransactionStatusStepMetaLink | ITransactionStatusStepMetaInfo;
}

export interface ITransactionStatusStep extends IStepperStep<ITransactionStatusStepMeta> {}

export interface ITransactionStatusStepProps extends ITransactionStatusStep {}

export const TransactionStatusStep: React.FC<ITransactionStatusStepProps> = () => {
    return <div />;
};
