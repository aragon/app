import dynamic from 'next/dynamic';

export const VoteDialog = dynamic(() =>
    import('./sppReportProposalResultDialog').then((mod) => mod.SppReportProposalResultDialog),
);

export type {
    ISppReportProposalResultDialogParams,
    ISppReportProposalResultDialogProps,
} from './sppReportProposalResultDialog';
