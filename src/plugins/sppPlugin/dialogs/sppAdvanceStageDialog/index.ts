import dynamic from 'next/dynamic';

export const SppAdvanceStageDialog = dynamic(() =>
    import('./sppAdvanceStageDialog').then((mod) => mod.SppAdvanceStageDialog),
);
export type { ISppAdvanceStageDialogParams, ISppAdvanceStageDialogProps } from './sppAdvanceStageDialog';
