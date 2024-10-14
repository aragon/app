import dynamic from 'next/dynamic';

export const SppVotingTerminal = dynamic(() => import('./sppVotingTerminal').then((mod) => mod.SppVotingTerminal));
export type { ISppVotingTerminalProps } from './sppVotingTerminal';
