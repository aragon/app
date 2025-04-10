import dynamic from 'next/dynamic';

export const SetupStageTimingDialog = dynamic(() =>
    import('./setupStageTimingDialog').then((mod) => mod.SetupStageTimingDialog),
);

export type { ISetupStageTimingDialogParams, ISetupStageTimingDialogProps } from './setupStageTimingDialog';

export type { ISetupStageTimingForm } from './setupStageTimingDialogDefinitions';
