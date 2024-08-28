import dynamic from 'next/dynamic';

export const PublishProposalDialog = dynamic(() =>
    import('./publishProposalDialog').then((mod) => mod.PublishProposalDialog),
);
export type { IPublishProposalDialogParams, IPublishProposalDialogProps } from './publishProposalDialog';
