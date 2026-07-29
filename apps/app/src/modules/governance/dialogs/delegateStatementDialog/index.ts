import dynamic from 'next/dynamic';

export const DelegateStatementDialog = dynamic(() =>
    import('./delegateStatementDialog').then(
        (mod) => mod.DelegateStatementDialog,
    ),
);

export type { IDelegateStatementDialogParams } from './delegateStatementDialog.api';
