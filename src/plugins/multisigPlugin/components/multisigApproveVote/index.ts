import dynamic from 'next/dynamic';

export const MultisigApproveVote = dynamic(() =>
    import('./multisigApproveVote').then((mod) => mod.MultisigApproveVote),
);
export { type IMultisigApproveVoteProps } from './multisigApproveVote';
