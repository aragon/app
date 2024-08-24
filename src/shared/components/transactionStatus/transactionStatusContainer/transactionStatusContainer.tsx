import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import classNames from 'classnames';
import { type ComponentProps } from 'react';
import { type ITransactionStatusStepMeta } from '../transactionStatusStep';

export interface ITransactionStatusContainerProps<TMeta extends ITransactionStatusStepMeta, TStepId = string>
    extends ComponentProps<'div'> {
    /**
     * Information about the stepper steps and state.
     */
    steps: IUseStepperReturn<TMeta, TStepId>['steps'];
}

export const TransactionStatusContainer = <TMeta extends ITransactionStatusStepMeta, TStepId extends string>(
    props: ITransactionStatusContainerProps<TMeta, TStepId>,
) => {
    const { steps, className, children, ...otherProps } = props;

    const hasError = steps.some((step) => step.meta.state === 'error');
    const isSuccess = steps.every((step) => step.meta.state === 'success');

    return (
        <div
            className={classNames(
                'flex flex-col gap-3 rounded-xl border bg-neutral-0 p-4 md:gap-4 md:p-6',
                { 'border-critical-300 shadow-critical': hasError },
                { 'border-success-300 shadow-success': isSuccess },
                { 'border-primary-100 shadow-primary': !hasError && !isSuccess },
                className,
            )}
            {...otherProps}
        >
            {children}
        </div>
    );
};
