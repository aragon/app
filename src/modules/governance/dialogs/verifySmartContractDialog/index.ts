import dynamic from 'next/dynamic';

export const VerifySmartContractDialog = dynamic(() =>
    import('./verifySmartContractDialog').then((mod) => mod.VerifySmartContractDialog),
);
export type {
    IVerifySmartContractDialogParams,
    IVerifySmartContractDialogProps,
    IVerifySmartContractFormData,
} from './verifySmartContractDialog';
