import dynamic from 'next/dynamic';

export const MpcEditPolicyDialog = dynamic(() =>
    import('./mpcEditPolicyDialog').then((mod) => mod.MpcEditPolicyDialog),
);

export type {
    IMpcEditPolicyDialogParams,
    IMpcEditPolicyDialogProps,
} from './mpcEditPolicyDialog';
