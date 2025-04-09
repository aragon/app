import dynamic from 'next/dynamic';

export const PublishProposalDialog = dynamic(() =>
    import('./publishProposalDialog').then((mod) => mod.PublishProposalDialog),
);
export type {
    IProposalCreate,
    IPublishProposalDialogParams,
    IPublishProposalDialogProps,
} from './publishProposalDialog';
