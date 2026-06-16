import dynamic from 'next/dynamic';

export const ExecuteDialog = dynamic(() =>
    import('./executeDialog').then((mod) => mod.ExecuteDialog),
);

export type {
    IExecuteDialogParams,
    IExecuteDialogProps,
} from './executeDialog';
