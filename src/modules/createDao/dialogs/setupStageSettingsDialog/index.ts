import dynamic from 'next/dynamic';

export const SetupStageSettingsDialog = dynamic(() =>
    import('./setupStageSettingsDialog').then((mod) => mod.SetupStageSettingsDialog),
);

export type { ISetupStageSettingsDialogParams, ISetupStageSettingsProps } from './setupStageSettingsDialog';

export type { ISetupStageSettingsForm } from './setupStageSettingsDialogDefinitions';
