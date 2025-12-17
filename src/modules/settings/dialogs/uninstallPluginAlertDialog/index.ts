import dynamic from 'next/dynamic';

export const UninstallPluginAlertDialog = dynamic(() =>
    import('./uninstallPluginAlertDialog').then((mod) => mod.UninstallPluginAlertDialog)
);
export type {
    IUninstallPluginAlertDialogParams,
    IUninstallPluginAlertDialogProps,
} from './uninstallPluginAlertDialog';
