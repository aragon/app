import dynamic from 'next/dynamic';

export const AdminUninstallProcessDialogSelect = dynamic(() =>
    import('./adminUninstallProcessDialogSelect').then((mod) => mod.AdminUninstallProcessDialogSelect),
);

export type { IAdminUninstallProcessDialogSelectProps } from './adminUninstallProcessDialogSelect';
