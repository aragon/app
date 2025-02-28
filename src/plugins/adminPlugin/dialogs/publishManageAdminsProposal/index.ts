import dynamic from 'next/dynamic';

export const PublishManageAdminsProposalDialog = dynamic(() =>
    import('./publishManageAdminsProposal').then((mod) => mod.PublishManageAdminsProposalDialog),
);

export type {
    IPublishManageAdminsProposalDialogParams,
    IPublishManageAdminsProposalDialogProps,
} from './publishManageAdminsProposal';
