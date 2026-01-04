import dynamic from 'next/dynamic';

export const CreatePolicyDetailsDialog = dynamic(() =>
    import('./createPolicyDetailsDialog').then(
        (mod) => mod.CreatePolicyDetailsDialog,
    ),
);
export type { ICreatePolicyDetailsDialogProps } from './createPolicyDetailsDialog';
