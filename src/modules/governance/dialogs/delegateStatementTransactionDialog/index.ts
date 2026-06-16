import dynamic from 'next/dynamic';

export const DelegateStatementTransactionDialog = dynamic(() =>
    import('./delegateStatementTransactionDialog').then(
        (mod) => mod.DelegateStatementTransactionDialog,
    ),
);

export type { IDelegateStatementTransactionDialogParams } from './delegateStatementTransactionDialog.api';
