import dynamic from 'next/dynamic';

export const ExecuteCheckDialog = dynamic(() => import('./executeCheckDialog').then((mod) => mod.ExecuteCheckDialog));
export type { IExecuteCheckDialogParams, IExecuteCheckDialogProps } from './executeCheckDialog';
