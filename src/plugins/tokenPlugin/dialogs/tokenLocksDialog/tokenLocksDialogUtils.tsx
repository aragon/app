import { DateTime } from 'luxon';
import { formatUnits } from 'viem';
import type { IMemberLock } from '../../api/tokenService';
import type { ITokenPluginSettings, ITokenPluginSettingsEscrowSettings } from '../../types';

class TokenLocksDialogUtils {
    getLockStatus = (lock: IMemberLock) => {
        const { lockExit } = lock;
        const { status, exitDateAt } = lockExit;

        const now = DateTime.now().toSeconds();

        const isActive = !status;
        const inCooldown = exitDateAt != null && now < exitDateAt;

        if (isActive) {
            return 'active';
        }

        if (inCooldown) {
            return 'cooldown';
        }

        return 'available';
    };

    getVotingPower = (lock: IMemberLock, settings: ITokenPluginSettings) => {
        const { amount, epochStartAt } = lock;
        const { token, votingEscrow } = settings;
        const { slope, maxTime } = votingEscrow!;
        const bias = 1000000000000000000; // TODO: get this from the backend

        const activeTime = Math.round(DateTime.now().toSeconds() - epochStartAt);
        const processedActiveTime = Math.max(activeTime, maxTime);

        const slopeAmount = BigInt(amount) * BigInt(slope);
        const biasAmount = BigInt(amount) * BigInt(bias);

        const votingPower = (slopeAmount * BigInt(processedActiveTime) + biasAmount) / BigInt(1e18);

        return formatUnits(votingPower, token.decimals);
    };

    getMultiplier = (lock: IMemberLock, settings: ITokenPluginSettings) => {
        const { amount } = lock;
        const votingPower = this.getVotingPower(lock, settings);
        const multiplier = BigInt(votingPower) / BigInt(amount);

        return multiplier;
    };

    getMinLockTime = (lock: IMemberLock, settings: ITokenPluginSettingsEscrowSettings): number => {
        const { minLockTime } = settings;
        const { epochStartAt } = lock;
        const minLockTimeAt = epochStartAt + minLockTime;

        return minLockTimeAt;
    };
}

export const tokenLocksDialogUtils = new TokenLocksDialogUtils();
