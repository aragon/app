import dynamic from 'next/dynamic';

export const PublishWorkspaceDialog = dynamic(() =>
    import('./publishWorkspaceDialog').then(
        (mod) => mod.PublishWorkspaceDialog,
    ),
);
export type {
    IPublishWorkspaceDialogParams,
    IPublishWorkspaceDialogProps,
} from './publishWorkspaceDialog';
