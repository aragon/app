import { DateTime } from 'luxon';
import { formatUnits } from 'viem';
import type { IGaugeVoterPluginSettings } from '../../../../gaugeVoterPlugin/types/gaugeVoterPlugin';
import type { IMemberLock } from '../../../api/tokenService';
import type { ITokenPluginSettingsEscrowSettings } from '../../../types';

/**
 * Status of a voting escrow lock.
 * - 'active': Lock is active and earning voting power
 * - 'cooldown': Lock has been queued for exit but cooldown period not yet elapsed
 * - 'available': Lock position is capable to be exited, could still be in 'cooldown' period with increased fees to exit
 */
export type TokenLockStatus = 'active' | 'cooldown' | 'available';

/**
 * Utility class for calculating voting escrow lock status, voting power, and multipliers.
 */
class TokenLockUtils {
    /**
     * Determines the current status of a lock based on exit queue state and time elapsed.
     * @param lock - The member lock to check status for.
     * @returns The current status of the lock.
     */
    getLockStatus = (lock: IMemberLock): TokenLockStatus => {
        const { lockExit } = lock;
        const { status, queuedAt, minCooldown } = lockExit;

        const now = DateTime.now().toSeconds();

        if (!status) {
            return 'active';
        }

        const unlockAt =
            queuedAt != null && minCooldown != null
                ? queuedAt + minCooldown
                : null;

        if (unlockAt == null) {
            return 'cooldown';
        }

        return now >= unlockAt ? 'available' : 'cooldown';
    };

    /**
     * Calculates the current voting power of a lock. Returns '0' if lock is not active.
     * @param lock - The member lock to calculate voting power for.
     * @param settings - Token plugin settings containing voting escrow parameters.
     * @returns Formatted voting power as a string.
     */
    getLockVotingPower = (
        lock: IMemberLock,
        settings: IGaugeVoterPluginSettings,
    ) => {
        const { amount, epochStartAt } = lock;
        const status = this.getLockStatus(lock);

        const activeTime = Math.round(
            DateTime.now().toSeconds() - epochStartAt,
        );
        const votingPower = this.calculateVotingPower(
            amount,
            activeTime,
            settings,
        );

        return status === 'active' ? votingPower : '0';
    };

    /**
     * Calculates voting power based on locked amount and time elapsed.
     * Formula: (amount * slope * min(time, maxTime) + amount * bias) / 1e18
     * @param amount - Locked token amount in wei as string.
     * @param time - Time elapsed since epoch start in seconds.
     * @param settings - Token plugin settings containing slope, bias, and maxTime.
     * @returns Formatted voting power as a string.
     */
    calculateVotingPower = (
        amount: string,
        time: number,
        settings: IGaugeVoterPluginSettings,
    ) => {
        const { token, votingEscrow } = settings;
        const { slope, maxTime, bias } = votingEscrow!;

        // TODO: remove when backend fixed!
        if (slope == null || maxTime == null || bias == null) {
            return '0';
        }

        const processedTime = Math.min(time, maxTime);

        const slopeAmount = BigInt(amount) * BigInt(slope);
        const biasAmount = BigInt(amount) * BigInt(bias);

        const votingPower =
            (slopeAmount * BigInt(processedTime) + biasAmount) / BigInt(1e18);

        return formatUnits(votingPower, token.decimals);
    };

    /**
     * Calculates the voting power multiplier for a lock based on time locked (votingPower / lockedAmount).
     * The multiplier increases with lock duration, rewarding longer-term commitment.
     * @param lock - The member lock to calculate multiplier for.
     * @param settings - Token plugin settings containing slope, bias, and maxTime parameters.
     * @returns Multiplier as a number (e.g., 1.5 means 1.5x voting power relative to locked amount).
     */
    getMultiplier = (
        lock: IMemberLock,
        settings: IGaugeVoterPluginSettings,
    ) => {
        const { amount } = lock;

        const votingPower = this.getLockVotingPower(lock, settings);
        const parsedAmount = formatUnits(
            BigInt(amount),
            settings.token.decimals,
        );

        return Number(votingPower) / Number(parsedAmount);
    };

    /**
     * Calculates the minimum timestamp when a lock can be queued for exit.
     * @param lock - The member lock.
     * @param settings - Escrow settings containing minLockTime.
     * @returns Unix timestamp when minimum lock time is reached.
     */
    getMinLockTime = (
        lock: IMemberLock,
        settings: ITokenPluginSettingsEscrowSettings,
    ): number => {
        const { minLockTime } = settings;
        const { epochStartAt } = lock;
        const minLockTimeAt = epochStartAt + minLockTime;

        return minLockTimeAt;
    };
}

export const tokenLockUtils = new TokenLockUtils();
