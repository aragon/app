import dynamic from 'next/dynamic';

export const AragonProfileIntroDialog = dynamic(() =>
    import('./aragonProfileIntroDialog').then(
        (mod) => mod.AragonProfileIntroDialog,
    ),
);
