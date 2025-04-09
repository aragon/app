import dynamic from 'next/dynamic';

export const GovernanceStageTimingFieldDialog = dynamic(() =>
    import('./setupStageTimingDialog').then((mod) => mod.SetupStageTimingDialog),
);

export type { ISetupStageTimingDialogParams, ISetupStageTimingDialogProps } from './setupStageTimingDialog';

export type { ISetupStageTimingForm } from './setupStageTimingDialogDefinitions';
