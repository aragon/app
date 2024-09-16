import dynamic from 'next/dynamic';

export const MultisigApproveProposal = dynamic(() =>
    import('./multisigApproveProposal').then((mod) => mod.MultisigApproveProposal),
);
export { type IMultisigApproveProposalProps } from './multisigApproveProposal';
