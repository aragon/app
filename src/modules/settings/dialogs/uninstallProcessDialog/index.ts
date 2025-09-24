import dynamic from 'next/dynamic';

export const UninstallProcessDialog = dynamic(() =>
    import('./uninstallProcessDialog').then((mod) => mod.UninstallProcessDialog),
);
export type { IUninstallProcessDialogParams, IUninstallProcessDialogProps } from './uninstallProcessDialog';
