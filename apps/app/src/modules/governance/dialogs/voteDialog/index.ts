import dynamic from 'next/dynamic';

export const VoteDialog = dynamic(() =>
    import('./voteDialog').then((mod) => mod.VoteDialog),
);

export type {
    IVoteDialogOption,
    IVoteDialogParams,
    IVoteDialogProps,
} from './voteDialog';
