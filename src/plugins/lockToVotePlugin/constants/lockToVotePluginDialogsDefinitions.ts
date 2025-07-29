import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenLockUnlockDialog } from '../dialogs/tokenLockUnlockDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<LockToVotePluginDialogId, IDialogComponentDefinitions> = {
    [LockToVotePluginDialogId.LOCK_UNLOCK]: {
        Component: TokenLockUnlockDialog,
    },
};
