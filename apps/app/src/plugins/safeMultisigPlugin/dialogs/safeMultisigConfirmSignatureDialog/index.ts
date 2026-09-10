import dynamic from 'next/dynamic';

export const SafeMultisigConfirmSignatureDialog = dynamic(() =>
    import('./safeMultisigConfirmSignatureDialog').then(
        (mod) => mod.SafeMultisigConfirmSignatureDialog,
    ),
);

export type {
    ISafeMultisigConfirmSignatureDialogParams,
    ISafeMultisigConfirmSignatureDialogProps,
} from './safeMultisigConfirmSignatureDialog';
