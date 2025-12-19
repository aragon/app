import dynamic from 'next/dynamic';

export const AdminVotingTerminal = dynamic(() =>
    import('./adminVotingTerminal').then((mod) => mod.AdminVotingTerminal),
);
