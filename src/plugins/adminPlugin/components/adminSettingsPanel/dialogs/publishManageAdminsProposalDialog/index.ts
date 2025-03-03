import dynamic from 'next/dynamic';

export const PublishManageAdminsProposalDialog = dynamic(() =>
    import('./publishManageAdminsProposalDialog').then((mod) => mod.PublishManageAdminsProposalDialog),
);

export type {
    IPublishManageAdminsProposalDialogProps,
} from './publishManageAdminsProposalDialog';
