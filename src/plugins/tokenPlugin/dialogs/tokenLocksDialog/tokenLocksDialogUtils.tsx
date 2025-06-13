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

    getLockVotingPower = (lock: IMemberLock, settings: ITokenPluginSettings) => {
        const { amount, epochStartAt } = lock;
        const activeTime = Math.round(DateTime.now().toSeconds() - epochStartAt);

        return this.calculateVotingPower(amount, activeTime, settings);
    };

    calculateVotingPower = (amount: string, time: number, settings: ITokenPluginSettings) => {
        const { token, votingEscrow } = settings;
        const { slope, maxTime } = votingEscrow!;
        const bias = 1000000000000000000; // TODO: get this from the backend

        const processedTime = Math.min(time, maxTime);

        const slopeAmount = BigInt(amount) * BigInt(slope);
        const biasAmount = BigInt(amount) * BigInt(bias);

        const votingPower = (slopeAmount * BigInt(processedTime) + biasAmount) / BigInt(1e18);

        return formatUnits(votingPower, token.decimals);
    };

    getMultiplier = (lock: IMemberLock, settings: ITokenPluginSettings) => {
        const { amount } = lock;

        const votingPower = this.getLockVotingPower(lock, settings);
        const parsedAmount = formatUnits(BigInt(amount), settings.token.decimals);

        return Number(votingPower) / Number(parsedAmount);
    };

    getMinLockTime = (lock: IMemberLock, settings: ITokenPluginSettingsEscrowSettings): number => {
        const { minLockTime } = settings;
        const { epochStartAt } = lock;
        const minLockTimeAt = epochStartAt + minLockTime;

        return minLockTimeAt;
    };
}

export const tokenLocksDialogUtils = new TokenLocksDialogUtils();
