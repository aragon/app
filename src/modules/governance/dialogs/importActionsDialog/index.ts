import dynamic from 'next/dynamic';

export const ImportActionsDialog = dynamic(() =>
    import('./importActionsDialog').then((mod) => mod.ImportActionsDialog),
);
export type { IImportActionsDialogParams, IImportActionsDialogProps } from './importActionsDialog';
