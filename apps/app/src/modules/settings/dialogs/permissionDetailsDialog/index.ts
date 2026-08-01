import dynamic from 'next/dynamic';

export const PermissionDetailsDialog = dynamic(() =>
    import('./permissionDetailsDialog').then(
        (mod) => mod.PermissionDetailsDialog,
    ),
);
export type {
    IPermissionDetailsDialogParams,
    IPermissionDetailsDialogProps,
} from './permissionDetailsDialog';
