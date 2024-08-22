import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import classNames from 'classnames';
import { type ComponentProps } from 'react';
import { type ITransactionStatusMeta, TransactionStatusProvider } from '../transactionStatusProvider';

export interface ITransactionStatusContainerProps extends ComponentProps<'div'> {
    /**
     * Information about the stepper steps and state.
     */
    stepper: IUseStepperReturn<ITransactionStatusMeta>;
}

export const TransactionStatusContainer: React.FC<ITransactionStatusContainerProps> = (props) => {
    const { stepper, className, ...otherProps } = props;

    const hasError = stepper.steps.some((step) => step.meta.state === 'error');
    const isSuccess = stepper.steps.every((step) => step.meta.state === 'success');

    return (
        <TransactionStatusProvider value={stepper}>
            <div
                className={classNames(
                    'flex flex-col gap-3 rounded-xl border border-primary-100 bg-neutral-0 p-4 md:gap-4 md:p-6',
                    { 'shadow-critical': hasError },
                    { 'shadow-success': isSuccess },
                    { 'shadow-primary': !hasError && !isSuccess },
                    className,
                )}
                {...otherProps}
            />
        </TransactionStatusProvider>
    );
};
