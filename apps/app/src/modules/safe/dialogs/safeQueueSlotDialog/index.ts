import dynamic from 'next/dynamic';

export const SafeQueueSlotDialog = dynamic(() =>
    import('./safeQueueSlotDialog').then((mod) => mod.SafeQueueSlotDialog),
);
export type {
    ISafeQueueSlotDialogParams,
    ISafeQueueSlotDialogProps,
    SafeQueueSlotMode,
} from './safeQueueSlotDialog';
