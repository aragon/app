import dynamic from 'next/dynamic';

export const MultisigChangeMembersActionDetails = dynamic(() =>
    import('./multisigChangeMembersActionDetails').then(
        (mod) => mod.MultisigChangeMembersActionDetails,
    ),
);

export type { IMultisigChangeMembersActionDetailsProps } from './multisigChangeMembersActionDetails';
