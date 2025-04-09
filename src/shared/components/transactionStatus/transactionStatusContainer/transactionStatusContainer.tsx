import type { IUseStepperReturn } from '@/shared/hooks/useStepper';
import classNames from 'classnames';
import { type ComponentProps } from 'react';
import { type ITransactionInfo, TransactionStatusInfo } from '../transactionStatusInfo';
import { type ITransactionStatusStepMeta } from '../transactionStatusStep';

export interface ITransactionStatusContainerProps<
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
> extends ComponentProps<'ul'> {
    /**
     * Information about the stepper steps and state.
     */
    steps: IUseStepperReturn<TMeta, TStepId>['steps'];
    /**
     * The current step index.
     */
    transactionInfo?: ITransactionInfo;
}

export const TransactionStatusContainer = <TMeta extends ITransactionStatusStepMeta, TStepId extends string>(
    props: ITransactionStatusContainerProps<TMeta, TStepId>,
) => {
    const { className, children, transactionInfo, ...otherProps } = props;

    return (
        <ul
            className={classNames(
                'flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-0 p-4 text-sm shadow-neutral md:gap-3 md:p-6 md:text-base',
                className,
            )}
            {...otherProps}
        >
            {transactionInfo != null && (
                <TransactionStatusInfo
                    title={transactionInfo.title}
                    current={transactionInfo.current}
                    total={transactionInfo.total}
                    className="mb-1 md:mb-2"
                />
            )}
            {children}
        </ul>
    );
};
