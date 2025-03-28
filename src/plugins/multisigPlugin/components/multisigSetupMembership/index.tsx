import dynamic from 'next/dynamic';

export const MultisigSetupMembership = dynamic(() =>
    import('./multisigSetupMembership').then((mod) => mod.MultisigSetupMembership),
);

export type { IMultisigSetupMembershipForm, IMultisigSetupMembershipProps } from './multisigSetupMembership.api';
