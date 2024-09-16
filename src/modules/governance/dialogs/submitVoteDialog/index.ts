import dynamic from 'next/dynamic';

export const SubmitVoteDialog = dynamic(() => import('./submitVoteDialog').then((mod) => mod.SubmitVoteDialog));

export type { ISubmitVoteDialogProps, ISubmitVoteParams } from './submitVoteDialog';
