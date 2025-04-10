import dynamic from 'next/dynamic';

export const AdvanceStageDialog = dynamic(() => import('./advanceStageDialog').then((mod) => mod.AdvanceStageDialog));
export type { IAdvanceStageDialogParams, IAdvanceStageDialogProps } from './advanceStageDialog';
