import dynamic from 'next/dynamic';

export const VoteDialog = dynamic(() => import('./voteDialog').then((mod) => mod.VoteDialog));

export type { IVoteDialogProps } from './voteDialog';

export * from './voteDialog.api';
