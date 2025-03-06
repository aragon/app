import dynamic from 'next/dynamic';

export const AdminUninstallSelectProcessDialog = dynamic(() =>
    import('./adminUninstallSelectProcessDialog').then((mod) => mod.AdminUninstallSelectProcessDialog),
);
export type { IAdminUninstallSelectProcessDialogProps } from './adminUninstallSelectProcessDialog';
