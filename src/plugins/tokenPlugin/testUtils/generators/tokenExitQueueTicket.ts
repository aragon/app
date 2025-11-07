import type { ITokenExitQueueTicket } from '../../types';

/**
 * Generates a test ticket for token-exit-queue with dynamic fees.
 * @param ticket - Optional partial ticket to override defaults.
 * @returns A complete ITokenExitQueueTicket object.
 */
export const generateTokenExitQueueTicket = (ticket?: Partial<ITokenExitQueueTicket>): ITokenExitQueueTicket => {
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);

    // Calculate slope for dynamic fee (5% to 1% over 28 days)
    // slope = (maxFee - minFee) / (cooldown - minCooldown) in 1e18 precision
    const maxFeeScaled = (BigInt(500) * BigInt(1e18)) / BigInt(10_000);
    const minFeeScaled = (BigInt(100) * BigInt(1e18)) / BigInt(10_000);
    const timeRange = thirtyDaysInSeconds - twoDaysInSeconds;
    const slope = (maxFeeScaled - minFeeScaled) / BigInt(timeRange);

    return {
        holder: '0x1234567890123456789012345678901234567890',
        queuedAt: now - twoDaysInSeconds, // Queued 2 days ago
        minCooldown: twoDaysInSeconds,
        cooldown: thirtyDaysInSeconds,
        feePercent: 500, // 5% in basis points
        minFeePercent: 100, // 1% in basis points
        slope,
        ...ticket,
    };
};

/**
 * Generates a test ticket with tiered fee configuration.
 * @param ticket - Optional partial ticket to override defaults.
 * @returns A complete ITokenExitQueueTicket object with tiered fees.
 */
export const generateTokenExitQueueTicketWithTieredFees = (
    ticket?: Partial<ITokenExitQueueTicket>,
): ITokenExitQueueTicket => {
    const tenDaysInSeconds = 10 * 24 * 60 * 60;
    const oneDayInSeconds = 24 * 60 * 60;
    const fiveDaysInSeconds = 5 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);

    return {
        holder: '0x1234567890123456789012345678901234567890',
        queuedAt: now - oneDayInSeconds,
        minCooldown: fiveDaysInSeconds,
        cooldown: tenDaysInSeconds,
        feePercent: 500, // 5% initial fee
        minFeePercent: 50, // 0.5% final fee
        slope: BigInt(0), // No slope for tiered
        ...ticket,
    };
};

/**
 * Generates a test ticket with fixed fee configuration.
 * @param ticket - Optional partial ticket to override defaults.
 * @returns A complete ITokenExitQueueTicket object with fixed fee.
 */
export const generateTokenExitQueueTicketWithFixedFee = (
    ticket?: Partial<ITokenExitQueueTicket>,
): ITokenExitQueueTicket => {
    const fiveDaysInSeconds = 5 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);

    return {
        holder: '0x1234567890123456789012345678901234567890',
        queuedAt: now - fiveDaysInSeconds,
        minCooldown: fiveDaysInSeconds,
        cooldown: fiveDaysInSeconds,
        feePercent: 200, // 2% fixed fee
        minFeePercent: 200, // Same as feePercent
        slope: BigInt(0), // No slope for fixed
        ...ticket,
    };
};
