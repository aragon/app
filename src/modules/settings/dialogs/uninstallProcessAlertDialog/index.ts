import dynamic from 'next/dynamic';

export const UninstallProcessAlertDialog = dynamic(() =>
    import('./uninstallProcessAlertDialog').then((mod) => mod.UninstallProcessAlertDialog),
);
export type {
    IUninstallProcessAlertDialogParams,
    IUninstallProcessAlertDialogProps,
} from './uninstallProcessAlertDialog';
