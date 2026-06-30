import dynamic from 'next/dynamic';

export const VotingPowerConditionSlot = dynamic(() =>
    import('./votingPowerConditionSlot').then(
        (mod) => mod.VotingPowerConditionSlot,
    ),
);
