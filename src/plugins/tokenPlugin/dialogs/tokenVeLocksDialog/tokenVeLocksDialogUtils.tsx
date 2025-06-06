import { DateTime } from 'luxon';
import { ITokenLock } from '../../api/tokenService';
import type { EscrowSettings } from '../../types';
import type { VeLockStatus } from './tokenVeLocksDialog';

class TokenVeLocksDialogUtils {
    getLockStatusAndTiming(lock: ITokenLock): { status: VeLockStatus; timeLeft?: number } {
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

    calcMultiplier(lock: ITokenLock, votingEscrow: EscrowSettings): number {
        const { maxTime, slope } = votingEscrow;
        const { epochStartAt, amount } = lock;
        // TODO: is this ok? Is amount a big number? How do we handle big number arithmetic?
        const lockedAmount = Number(amount);
        const now = DateTime.now().toSeconds();
        const activeAt = epochStartAt;
        const activePeriod = now - activeAt;
        const votingPower = Math.min(activePeriod, maxTime) * lockedAmount * slope;
        const multiplier = Math.max(votingPower / lockedAmount, 1);

        return multiplier;
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

export const tokenVeLocksDialogUtils = new TokenVeLocksDialogUtils();
