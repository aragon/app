import dynamic from 'next/dynamic';

export const GovernanceStageTimingFieldDialog = dynamic(() =>
    import('./governanceStageTimingFieldDialog').then((mod) => mod.GovernanceStageTimingFieldDialog),
);
export type {
    IGovernanceStageTimingFieldDialogParams,
    IGovernanceStageTimingFieldDialogProps,
} from './governanceStageTimingFieldDialog';
