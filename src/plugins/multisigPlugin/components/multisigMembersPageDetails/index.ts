import dynamic from 'next/dynamic';

export const MultisigMembersPageDetails = dynamic(() =>
    import('./multisigMembersPageDetails').then((mod) => mod.MultisigMemberPageDetails),
);
export type { IMultisigMembersPageDetailsProps } from './multisigMembersPageDetails';
