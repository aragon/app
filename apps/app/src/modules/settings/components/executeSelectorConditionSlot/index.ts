import dynamic from 'next/dynamic';

export const ExecuteSelectorConditionSlot = dynamic(() =>
    import('./executeSelectorConditionSlot').then(
        (mod) => mod.ExecuteSelectorConditionSlot,
    ),
);
