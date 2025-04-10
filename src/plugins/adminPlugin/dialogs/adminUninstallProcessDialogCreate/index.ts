import dynamic from 'next/dynamic';

export const AdminUninstallProcessDialogCreate = dynamic(() =>
    import('./adminUninstallProcessDialogCreate').then((mod) => mod.AdminUninstallProcessDialogCreate),
);

export type {
    IAdminUninstallProcessDialogCreateParams,
    IAdminUninstallProcessDialogCreateProps,
} from './adminUninstallProcessDialogCreate';
