import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import classNames from 'classnames';
import { type ComponentProps } from 'react';
import { type ITransactionStatusStepMeta } from '../transactionStatusStep';

export interface ITransactionStatusContainerProps<
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
> extends ComponentProps<'ul'> {
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
    const hasWarnings = steps.some((step) => step.meta.state === 'warning');
    const isLoading = steps.some((step) => step.meta.state === 'pending');

    const lastStep = steps.length > 0 ? steps[steps.length - 1] : undefined;
    const isSuccess = lastStep?.meta.state === 'success';

    return (
        <ul
            className={classNames(
                'flex flex-col gap-3 rounded-xl border bg-neutral-0 p-4 text-sm md:gap-4 md:p-6 md:text-base',
                { 'border-critical-300 shadow-critical': hasError },
                { 'border-success-300 shadow-success': isSuccess },
                { 'border-warning-300 shadow-warning': hasWarnings },
                { 'border-primary-100 shadow-primary': isLoading },
                { 'border-neutral-100 shadow-neutral': !hasError && !isSuccess && !hasWarnings && !isLoading },
                className,
            )}
            {...otherProps}
        >
            {children}
        </ul>
    );
};
