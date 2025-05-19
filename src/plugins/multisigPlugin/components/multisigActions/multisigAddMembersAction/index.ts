import dynamic from 'next/dynamic';

export const MultisigAddMembersAction = dynamic(() =>
    import('./multisigAddMembersAction').then((mod) => mod.MultisigAddMembersAction),
);

export type { IMultisigAddMembersActionProps } from './multisigAddMembersAction';
