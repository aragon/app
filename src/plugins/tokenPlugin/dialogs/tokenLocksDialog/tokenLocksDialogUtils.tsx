import { DateTime } from 'luxon';
import type { ITokenLock } from '../../api/tokenService';
import type { EscrowSettings } from '../../types';
import type { LockStatus } from './tokenLocksDialog';

class TokenLocksDialogUtils {
    getLockStatusAndTiming(lock: ITokenLock): { status: LockStatus; timeLeft?: number } {
        const { lockExit } = lock;

        const now = DateTime.now().toSeconds();

        if (!lockExit.status) {
            return { status: 'active' };
        }

        if (lockExit.exitDateAt != null && now < lockExit.exitDateAt) {
            return { status: 'cooldown', timeLeft: lockExit.exitDateAt - now };
        }

        return { status: 'available' };
    }

    getMultiplierAndVotingPower(lock: ITokenLock) {
        const { amount, votingPower } = lock;

        return { votingPower: Number(votingPower), multiplier: Number(votingPower) / Number(amount) };
    }

    getMinLockTime(lock: ITokenLock, votingEscrow: EscrowSettings): number {
        const { minLockTime } = votingEscrow;
        const { epochStartAt } = lock;
        const activeAt = epochStartAt;
        // TODO: is it activeAt + minLockTime or lockedAt + minLockTime? (we don't have lockedAt coming from backend?)
        // now when there is no warmup period, it makes sense to use activeAt + minLockTime, but do check!
        const minLockTimeAt = activeAt + minLockTime;

        return minLockTimeAt;
    }
}

export const tokenLocksDialogUtils = new TokenLocksDialogUtils();
