import dynamic from 'next/dynamic';

export const PublishProposalDialog = dynamic(() =>
    import('./publishProcessDialog').then((mod) => mod.PublishProposalDialog),
);
export type { IPublishProposalDialogParams, IPublishProposalDialogProps } from './publishProcessDialog';
