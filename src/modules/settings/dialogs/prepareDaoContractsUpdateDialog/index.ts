import dynamic from 'next/dynamic';

export const PrepareDaoContractsUpdateDialog = dynamic(() =>
    import('./prepareDaoContractsUpdateDialog').then((mod) => mod.PrepareDaoContractsUpdateDialog),
);
export type {
    IPrepareDaoContractsUpdateDialogParams,
    IPrepareDaoContractsUpdateProps,
} from './prepareDaoContractsUpdateDialog';
