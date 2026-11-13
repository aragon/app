import dynamic from 'next/dynamic';

export const SafeCreateDialog = dynamic(() =>
    import('./safeCreateDialog').then((mod) => mod.SafeCreateDialog),
);
export type {
    ISafeCreateDialogParams,
    ISafeCreateDialogProps,
} from './safeCreateDialog';
