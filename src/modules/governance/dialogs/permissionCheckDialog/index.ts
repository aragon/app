import dynamic from 'next/dynamic';

export const PermissionCheckDialog = dynamic(() =>
    import('./permissionCheckDialog').then((mod) => mod.PermissionCheckDialog),
);
export type { IPermissionCheckDialogParams, IPermissionCheckDialogProps } from './permissionCheckDialog';
