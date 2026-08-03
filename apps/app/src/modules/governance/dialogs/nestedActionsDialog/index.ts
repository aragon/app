import dynamic from 'next/dynamic';

export const NestedActionsDialog = dynamic(() =>
    import('./nestedActionsDialog').then((mod) => mod.NestedActionsDialog),
);

export type {
    INestedActionsDialogParams,
    INestedActionsDialogProps,
} from './nestedActionsDialog.api';
