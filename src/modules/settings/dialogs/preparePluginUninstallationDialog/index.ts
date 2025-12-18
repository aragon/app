import dynamic from 'next/dynamic';

export const PreparePluginUninstallationDialog = dynamic(() =>
    import('./preparePluginUninstallationDialog').then((mod) => mod.PreparePluginUninstallationDialog)
);
export type {
    IPreparePluginUninstallationDialogParams,
    IPreparePluginUninstallationDialogProps,
} from './preparePluginUninstallationDialog';
