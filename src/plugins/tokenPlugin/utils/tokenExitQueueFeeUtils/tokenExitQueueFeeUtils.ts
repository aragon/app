import {
    TokenExitQueueFeeMode,
    type ITokenExitQueueTicket,
    type ITokenPluginSettingsEscrowSettings,
} from '../../types';
import type {
    ICalculateFeeAtTimeParams,
    ICalculateReceiveAmountParams,
    IChartDataPoint,
    IGetChartDataPointsParams,
} from './tokenExitQueueFeeUtils.api';

/**
 * Utility class for calculating and managing dynamic exit queue fees.
 */
class TokenExitQueueFeeUtils {
    /**
     * Maximum fee percentage in basis points (100%).
     */
    readonly MAX_FEE_PERCENT = 10_000;

    /**
     * Internal precision used for fee calculations (matches contract).
     */
    readonly INTERNAL_PRECISION = BigInt(1e18);

    /**
     * Determines the fee mode based on ticket parameters.
     * @param ticket - The ticket containing fee parameters.
     * @returns The fee mode (FIXED, DYNAMIC, or TIERED).
     */
    determineFeeMode = (ticket: ITokenExitQueueTicket): TokenExitQueueFeeMode => {
        // Fixed: minFeePercent === feePercent
        if (ticket.minFeePercent === ticket.feePercent) {
            return TokenExitQueueFeeMode.FIXED;
        }

        // Tiered: slope === 0
        if (ticket.slope === BigInt(0)) {
            return TokenExitQueueFeeMode.TIERED;
        }

        // Dynamic: linear decay
        return TokenExitQueueFeeMode.DYNAMIC;
    };

    /**
     * Calculates the fee percentage at a specific time elapsed since queuing.
     * This mirrors the contract's _getScaledTimeBasedFee logic.
     * @param params - Parameters containing time elapsed and ticket.
     * @returns Fee percentage (0-100).
     */
    calculateFeeAtTime = (params: ICalculateFeeAtTimeParams): number => {
        const { timeElapsed, ticket } = params;

        const scaledMaxFee = (BigInt(ticket.feePercent) * this.INTERNAL_PRECISION) / BigInt(this.MAX_FEE_PERCENT);
        const scaledMinFee = (BigInt(ticket.minFeePercent) * this.INTERNAL_PRECISION) / BigInt(this.MAX_FEE_PERCENT);

        // Fixed fee system (no decay, no tiers)
        if (ticket.minFeePercent === ticket.feePercent) {
            return this.scaledFeeToPercent(scaledMaxFee);
        }

        // Tiered system (no slope)
        if (ticket.slope === BigInt(0)) {
            const fee = timeElapsed >= ticket.minCooldown ? scaledMinFee : scaledMaxFee;
            return this.scaledFeeToPercent(fee);
        }

        // Dynamic system (linear decay using stored slope)
        if (timeElapsed <= ticket.minCooldown) {
            return this.scaledFeeToPercent(scaledMaxFee);
        }

        if (timeElapsed >= ticket.cooldown) {
            return this.scaledFeeToPercent(scaledMinFee);
        }

        // Calculate fee reduction using high-precision slope
        const timeInDecay = BigInt(Math.floor(timeElapsed - ticket.minCooldown));
        const feeReduction = ticket.slope * timeInDecay;

        // Ensure we don't go below minimum fee
        if (feeReduction >= scaledMaxFee - scaledMinFee) {
            return this.scaledFeeToPercent(scaledMinFee);
        }

        const scaledFee = scaledMaxFee - feeReduction;
        return this.scaledFeeToPercent(scaledFee);
    };

    /**
     * Converts a scaled fee (1e18 precision) to percentage (0-100).
     * @param scaledFee - Fee in 1e18 precision.
     * @returns Fee as percentage (0-100).
     */
    private scaledFeeToPercent = (scaledFee: bigint): number => {
        const roundedScaledFee = scaledFee * BigInt(this.MAX_FEE_PERCENT) + this.INTERNAL_PRECISION / BigInt(2);
        const basisPoints = Number(roundedScaledFee / this.INTERNAL_PRECISION);
        return basisPoints / 100;
    };

    /**
     * Checks if the fee dialog should be shown based on fee configuration.
     * Accepts either plugin settings or a ticket-like object.
     * @param config - Object containing feePercent and minFeePercent in basis points.
     * @returns True if fees are configured (> 0), false otherwise.
     */
    shouldShowFeeDialog = (
        config:
            | Pick<ITokenPluginSettingsEscrowSettings, 'feePercent' | 'minFeePercent'>
            | {
                  feePercent?: number | null;
                  minFeePercent?: number | null;
              },
    ): boolean => {
        const feePercent = config.feePercent ?? 0;
        const minFeePercent = config.minFeePercent ?? 0;

        return feePercent > 0 || minFeePercent > 0;
    };

    /**
     * Generates chart data points for visualizing fee decay over time.
     * @param params - Parameters containing ticket and current time.
     * @returns Array of chart data points.
     */
    getChartDataPoints = (params: IGetChartDataPointsParams): IChartDataPoint[] => {
        const { ticket, pointCount = 6 } = params;

        const mode = this.determineFeeMode(ticket);

        // Don't generate chart data for fixed fee mode
        if (mode === TokenExitQueueFeeMode.FIXED) {
            return [];
        }

        // Tiered fees only have two states (early vs normal exit). Ensure we include minCooldown breakpoint.
        if (mode === TokenExitQueueFeeMode.TIERED) {
            const times = new Set<number>();
            const baseStep = pointCount > 1 ? ticket.cooldown / (pointCount - 1) : ticket.cooldown;

            for (let i = 0; i < pointCount; i++) {
                const raw = i * baseStep;
                const clamped = i === pointCount - 1 ? ticket.cooldown : raw;
                times.add(clamped);
            }

            times.add(0);
            times.add(ticket.minCooldown);
            times.add(ticket.cooldown);

            const sortedTimes = Array.from(times).sort((a, b) => a - b);

            return sortedTimes.map((elapsedSeconds) => ({
                elapsedSeconds,
                feePercent: this.calculateFeeAtTime({ timeElapsed: elapsedSeconds, ticket }),
            }));
        }

        const secondsStep = ticket.cooldown / (pointCount - 1);

        const points: IChartDataPoint[] = [];

        for (let i = 0; i < pointCount; i++) {
            const pointSeconds = i * secondsStep;
            const normalizedPointSeconds = i === pointCount - 1 ? ticket.cooldown : pointSeconds;
            const feePercent = this.calculateFeeAtTime({ timeElapsed: normalizedPointSeconds, ticket });

            points.push({
                elapsedSeconds: normalizedPointSeconds,
                feePercent,
            });
        }

        return points;
    };

    /**
     * Calculates the net receive amount after deducting the fee.
     * @param params - Parameters containing locked amount and fee percentage.
     * @returns Net receive amount (in wei).
     */
    calculateReceiveAmount = (params: ICalculateReceiveAmountParams): bigint => {
        const { lockedAmount, feePercentage } = params;

        // Convert fee percentage to basis points
        const feeBasisPoints = Math.round((feePercentage * this.MAX_FEE_PERCENT) / 100);

        // Calculate fee amount
        const feeAmount = (lockedAmount * BigInt(feeBasisPoints)) / BigInt(this.MAX_FEE_PERCENT);

        // Return net amount
        return lockedAmount - feeAmount;
    };

    /**
     * Formats a fee percentage from basis points to display string.
     * @param basisPoints - Fee in basis points (0-10000).
     * @returns Formatted percentage string (e.g., "5%").
     */
    formatFeePercent = (basisPoints: number): string => {
        const percent = (basisPoints / this.MAX_FEE_PERCENT) * 100;
        return `${percent.toFixed(percent < 1 ? 2 : percent < 10 ? 1 : 0)}%`;
    };
}

export const tokenExitQueueFeeUtils = new TokenExitQueueFeeUtils();
