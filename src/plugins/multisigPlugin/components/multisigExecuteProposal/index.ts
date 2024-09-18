import dynamic from 'next/dynamic';

export const MultisigExecuteProposal = dynamic(() =>
    import('./multisigExecuteProposal').then((mod) => mod.MultisigExecuteProposal),
);

export type { IMultisigExecuteProposalProps } from './multisigExecuteProposal';
