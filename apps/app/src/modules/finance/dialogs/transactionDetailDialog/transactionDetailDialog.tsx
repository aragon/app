'use client';

import { invariant, TransactionDetail } from '@aragon/gov-ui-kit';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { IDao } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import type { ITransactionExecution } from '../../api/financeService';
import { TransactionExecutionDetails } from '../../components/transactionExecutionDetails';

export interface ITransactionDetailDialogParams {
    /**
     * DAO that owns the transaction.
     */
    dao: IDao;
    /**
     * Execution transaction to display.
     */
    transaction: ITransactionExecution;
}

export interface ITransactionDetailDialogProps
    extends IDialogComponentProps<ITransactionDetailDialogParams> {}

export const TransactionDetailDialog: React.FC<
    ITransactionDetailDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TransactionDetailDialog: required parameters must be set.',
    );

    const { dao, transaction } = location.params;

    const { close } = useDialogContext();

    const pathname = usePathname();
    const initialPathnameRef = useRef(pathname);

    // Close the dialog when navigating away (e.g. clicking the proposal link).
    useEffect(() => {
        if (pathname !== initialPathnameRef.current) {
            close(location.id);
        }
    }, [pathname, close, location.id]);

    return (
        <TransactionDetail.Root onClose={() => close(location.id)}>
            <TransactionExecutionDetails dao={dao} transaction={transaction} />
        </TransactionDetail.Root>
    );
};
