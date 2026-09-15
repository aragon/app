import type { IUseSafeMultisigBodyStateReturn } from '../../hooks/useSafeMultisigBodyState';

/**
 * Default body state: a Safe read that succeeded, on a stage that can still be reported on, with
 * nothing queued. Cases add only the part they exercise.
 */
export const generateSafeBodyState = (
    state?: Partial<IUseSafeMultisigBodyStateReturn>,
): IUseSafeMultisigBodyStateReturn => ({
    safeInfo: undefined,
    isLoading: false,
    isError: false,
    isRateLimited: false,
    isStale: false,
    pendingReport: undefined,
    settledResultType: undefined,
    isStageCurrent: true,
    canStillAffectOutcome: true,
    isExecutableNow: false,
    isCurrentNonceFree: true,
    transactionsAhead: 0,
    signers: [],
    hasConnectedWalletSigned: false,
    approvalsAmount: 0,
    minApprovals: 0,
    membersCount: 0,
    ...state,
});
