import dynamic from 'next/dynamic';

export const TokenExecuteProposal = dynamic(() =>
    import('./tokenExecuteProposal').then((mod) => mod.TokenExecuteProposal),
);
export type { ITokenExecuteProposalProps } from './tokenExecuteProposal';
