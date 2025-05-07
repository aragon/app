import dynamic from 'next/dynamic';

export const UpdateDaoContractsListDialog = dynamic(() =>
    import('./updateDaoContractsListDialog').then((mod) => mod.UpdateDaoContractsListDialog),
);
export type {
    IUpdateDaoContractsListDialogParams,
    IUpdateDaoContractsListDialogProps,
} from './updateDaoContractsListDialog';
