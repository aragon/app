import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import {
    type ITransactionInfo,
    TransactionStatusInfo,
} from '../transactionStatusInfo';
import type { ITransactionStatusStepMeta } from '../transactionStatusStep';

export interface ITransactionStatusContainerProps<
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
> extends ComponentProps<'ul'> {
    /**
     * Information about the stepper steps and state.
     */
    steps: IUseStepperReturn<TMeta, TStepId>['steps'];
    /**
     * Information about the stepper in the current transaction dialog.
     */
    transactionInfo?: ITransactionInfo;
}

export const TransactionStatusContainer = <
    TMeta extends ITransactionStatusStepMeta,
    TStepId extends string,
>(
    props: ITransactionStatusContainerProps<TMeta, TStepId>,
) => {
    const { className, children, transactionInfo, ...otherProps } = props;

    return (
        <ul
            className={classNames(
                'flex flex-col gap-related--8-12 rounded-xl border border-surface-secondary bg-surface-primary p-inset-surface text-sm shadow-surface-default md:text-base',
                className,
            )}
            {...otherProps}
        >
            {transactionInfo != null && (
                <TransactionStatusInfo
                    {...transactionInfo}
                    className="mb-tight--4-8"
                />
            )}
            {children}
        </ul>
    );
};
