import dynamic from 'next/dynamic';

export const ReportProposalResultDialog = dynamic(() =>
    import('./reportProposalResultDialog').then((mod) => mod.ReportProposalResultDialog),
);

export type { IReportProposalResultDialogParams, IReportProposalResultDialogProps } from './reportProposalResultDialog';
