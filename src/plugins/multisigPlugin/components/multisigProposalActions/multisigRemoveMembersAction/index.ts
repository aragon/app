import dynamic from 'next/dynamic';

export const MultisigRemoveMembersAction = dynamic(() =>
    import('./multisigRemoveMembersAction').then((mod) => mod.MultisigRemoveMembersAction),
);

export type {
    IMultisigRemoveMembersActionFormData,
    IMultisigRemoveMembersActionProps,
} from './multisigRemoveMembersAction';
