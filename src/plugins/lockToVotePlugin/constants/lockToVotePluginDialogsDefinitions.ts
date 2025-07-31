import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVoteLockUnlockDialog } from '../dialogs/lockToVoteLockUnlockDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<LockToVotePluginDialogId, IDialogComponentDefinitions> = {
    [LockToVotePluginDialogId.LOCK_UNLOCK]: {
        Component: LockToVoteLockUnlockDialog,
    },
};
