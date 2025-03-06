import dynamic from 'next/dynamic';

export const AdminUninstallCreateProcessDialog = dynamic(() =>
    import('./adminUninstallCreateProcessDialog').then((mod) => mod.AdminUninstallCreateProcessDialog),
);

export type { IAdminUninstallCreateProcessDialogProps } from './adminUninstallCreateProcessDialog';
