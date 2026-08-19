import dynamic from 'next/dynamic';

export const MpcAddMemberDialog = dynamic(() =>
    import('./mpcAddMemberDialog').then((mod) => mod.MpcAddMemberDialog),
);

export type {
    IMpcAddMemberDialogParams,
    IMpcAddMemberDialogProps,
} from './mpcAddMemberDialog';
