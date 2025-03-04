import dynamic from 'next/dynamic';

export const UninstallCreateProcessDialog = dynamic(() =>
    import('./uninstallCreateProcessDialog').then((mod) => mod.UninstallCreateProcessDialog),
);

export type { IUninstallCreateProcessDialogProps } from './uninstallCreateProcessDialog';
