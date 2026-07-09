import dynamic from 'next/dynamic';

export const ExecuteActionsDialog = dynamic(() =>
    import('./executeActionsDialog').then((mod) => mod.ExecuteActionsDialog),
);
export type * from './executeActionsDialog.api';
