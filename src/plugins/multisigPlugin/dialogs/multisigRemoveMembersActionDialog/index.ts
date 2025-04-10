import dynamic from 'next/dynamic';

export const MultisigRemoveMembersActionDialog = dynamic(() =>
    import('./multisigRemoveMembersActionDialog').then((mod) => mod.MultisigRemoveMembersActionDialog),
);
export type {
    IMultisigRemoveMembersActionDialogParams,
    IMultisigRemoveMembersActionDialogProps,
} from './multisigRemoveMembersActionDialog';
