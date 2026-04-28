import dynamic from 'next/dynamic';

export const ProposalAuditDialog = dynamic(() =>
    import('./proposalAuditDialog').then((mod) => mod.ProposalAuditDialog),
);

export type {
    IProposalAuditDialogParams,
    IProposalAuditDialogProps,
} from './proposalAuditDialog';
