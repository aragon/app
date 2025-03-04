import dynamic from 'next/dynamic';

export const UninstallSelectProcessDialog = dynamic(() =>
    import('./uninstallSelectProcessDialog').then((mod) => mod.UninstallSelectProcessDialog),
);
export type { IUninstallSelectProcessDialogProps } from './uninstallSelectProcessDialog';
