import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import classNames from 'classnames';
import React, { Children, type ComponentProps } from 'react';
import type { ITransactionStatusMeta } from '../transactionStatusStep';

export interface ITransactionStatusContainerProps<TStepId = string> extends ComponentProps<'div'> {
    /**
     * Information about the stepper steps and state.
     */
    stepper: IUseStepperReturn<ITransactionStatusMeta, TStepId>;
}

export const TransactionStatusContainer = <TStepId extends string>(
    props: ITransactionStatusContainerProps<TStepId>,
) => {
    const { stepper, className, children, ...otherProps } = props;

    const processedChildren = Children.toArray(children);

    const hasError = stepper.steps.some((step) => step.meta.state === 'error');
    const isSuccess = stepper.steps.every((step) => step.meta.state === 'success');

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
            {processedChildren.map((child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { ...child.props, registerStep: stepper.registerStep })
                    : child,
            )}
        </div>
    );
};
