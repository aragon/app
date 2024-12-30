import dynamic from 'next/dynamic';

export const PublishProcessDialog = dynamic(() =>
    import('./publishProcessDialog').then((mod) => mod.PublishProcessDialog),
);
export type { IPublishProcessDialogParams, IPublishProcessDialogProps } from './publishProcessDialog';
