import dynamic from 'next/dynamic';

export const PreparePolicyDialog = dynamic(() => import('./preparePolicyDialog').then((mod) => mod.PreparePolicyDialog));
export type {
    IPreparePolicyDialogParams,
    IPreparePolicyDialogProps,
} from './preparePolicyDialog';
