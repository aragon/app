import dynamic from 'next/dynamic';

export const PermissionCheckDialog = dynamic(() =>
    import('./executeCheckDialog').then((mod) => mod.ExecuteCheckDialog),
);
export type { IExecuteCheckDialogParams, IExecuteCheckDialogProps } from './executeCheckDialog';
