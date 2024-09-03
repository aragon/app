import dynamic from 'next/dynamic';

export const PublishProposalExitDialog = dynamic(() =>
    import('./publishProposalExitDialog').then((mod) => mod.PublishProposalExitDialog),
);
export type { IPublishProposalExitDialogParams, IPublishProposalExitDialogProps } from './publishProposalExitDialog';
