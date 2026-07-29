import { GaugeVoterExitQueueFeeMode } from '../../types/enum';
import { gaugeVoterExitQueueFeeUtils } from './gaugeVoterExitQueueFeeUtils';

describe('GaugeVoterExitQueueFeeUtils', () => {
    describe('determineFeeMode', () => {
        it('returns FIXED when minFeePercent equals feePercent', () => {
            const ticket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000, // 50%
                minFeePercent: 5000, // 50%
                slope: BigInt(100),
            };

            expect(gaugeVoterExitQueueFeeUtils.determineFeeMode(ticket)).toBe(
                GaugeVoterExitQueueFeeMode.FIXED,
            );
        });

        it('returns TIERED when slope is zero', () => {
            const ticket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000, // 50%
                minFeePercent: 1000, // 10%
                slope: BigInt(0),
            };

            expect(gaugeVoterExitQueueFeeUtils.determineFeeMode(ticket)).toBe(
                GaugeVoterExitQueueFeeMode.TIERED,
            );
        });

        it('returns DYNAMIC when fees differ and slope is non-zero', () => {
            const ticket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000, // 50%
                minFeePercent: 1000, // 10%
                slope: BigInt(1e15), // Non-zero slope
            };

            expect(gaugeVoterExitQueueFeeUtils.determineFeeMode(ticket)).toBe(
                GaugeVoterExitQueueFeeMode.DYNAMIC,
            );
        });
    });

    describe('calculateFeeAtTime - FIXED mode', () => {
        const fixedTicket = {
            holder: '0x123' as `0x${string}`,
            queuedAt: 1000,
            minCooldown: 100,
            cooldown: 200,
            feePercent: 5000, // 50%
            minFeePercent: 5000, // 50%
            slope: BigInt(100),
        };

        it('returns same fee at any time', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 0,
                    ticket: fixedTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 100,
                    ticket: fixedTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 150,
                    ticket: fixedTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 200,
                    ticket: fixedTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 1000,
                    ticket: fixedTicket,
                }),
            ).toBe(50);
        });
    });

    describe('calculateFeeAtTime - TIERED mode', () => {
        const tieredTicket = {
            holder: '0x123' as `0x${string}`,
            queuedAt: 1000,
            minCooldown: 100,
            cooldown: 200,
            feePercent: 5000, // 50%
            minFeePercent: 1000, // 10%
            slope: BigInt(0),
        };

        it('returns max fee before cooldown', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 0,
                    ticket: tieredTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 50,
                    ticket: tieredTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 199,
                    ticket: tieredTicket,
                }),
            ).toBe(50);
        });

        it('returns min fee at and after cooldown', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 200,
                    ticket: tieredTicket,
                }),
            ).toBe(10);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 300,
                    ticket: tieredTicket,
                }),
            ).toBe(10);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 1000,
                    ticket: tieredTicket,
                }),
            ).toBe(10);
        });
    });

    describe('calculateFeeAtTime - DYNAMIC mode', () => {
        // Setup: 100 second decay window (from minCooldown=100 to cooldown=200)
        // Fee drops from 50% to 10% (40% reduction over 100 seconds = 0.4% per second)
        // Slope calculation: (5000 - 1000) basis points / 100 seconds = 40 basis points/second
        // In contract precision: slope = (0.4 * 1e18) / 100 = 4e15
        const dynamicTicket = {
            holder: '0x123' as `0x${string}`,
            queuedAt: 1000,
            minCooldown: 100,
            cooldown: 200,
            feePercent: 5000, // 50%
            minFeePercent: 1000, // 10%
            slope: BigInt(4e15), // Linear decay slope
        };

        it('returns max fee before and at minCooldown', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 0,
                    ticket: dynamicTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 50,
                    ticket: dynamicTicket,
                }),
            ).toBe(50);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 100,
                    ticket: dynamicTicket,
                }),
            ).toBe(50);
        });

        it('decays linearly between minCooldown and cooldown', () => {
            // At 125 (25 seconds into decay): 50% - (25 * 0.4%) = 50% - 10% = 40%
            const feeAt125 = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                timeElapsed: 125,
                ticket: dynamicTicket,
            });
            expect(feeAt125).toBeCloseTo(40, 1);

            // At 150 (50 seconds into decay): 50% - (50 * 0.4%) = 50% - 20% = 30%
            const feeAt150 = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                timeElapsed: 150,
                ticket: dynamicTicket,
            });
            expect(feeAt150).toBeCloseTo(30, 1);

            // At 175 (75 seconds into decay): 50% - (75 * 0.4%) = 50% - 30% = 20%
            const feeAt175 = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                timeElapsed: 175,
                ticket: dynamicTicket,
            });
            expect(feeAt175).toBeCloseTo(20, 1);
        });

        it('returns min fee at and after cooldown', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 200,
                    ticket: dynamicTicket,
                }),
            ).toBe(10);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 300,
                    ticket: dynamicTicket,
                }),
            ).toBe(10);
            expect(
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 1000,
                    ticket: dynamicTicket,
                }),
            ).toBe(10);
        });

        it('handles boundary at minCooldown correctly (should be max fee)', () => {
            // At exactly minCooldown, should still be max fee (timeElapsed <= minCooldown)
            const feeAtBoundary =
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 100,
                    ticket: dynamicTicket,
                });
            expect(feeAtBoundary).toBe(50);
        });

        it('starts decay immediately after minCooldown', () => {
            // At minCooldown + 1, decay should have started
            const feeAfterBoundary =
                gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                    timeElapsed: 101,
                    ticket: dynamicTicket,
                });
            expect(feeAfterBoundary).toBeLessThan(50);
            expect(feeAfterBoundary).toBeGreaterThan(10);
        });
    });

    describe('shouldShowFeeDialog', () => {
        it('returns false when both fees are zero', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                    feePercent: 0,
                    minFeePercent: 0,
                }),
            ).toBe(false);
        });

        it('returns false when both fees are null', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                    feePercent: null,
                    minFeePercent: null,
                }),
            ).toBe(false);
        });

        it('returns true when feePercent is greater than zero', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                    feePercent: 100,
                    minFeePercent: 0,
                }),
            ).toBe(true);
        });

        it('returns true when minFeePercent is greater than zero', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                    feePercent: 0,
                    minFeePercent: 100,
                }),
            ).toBe(true);
        });

        it('returns true when both fees are greater than zero', () => {
            expect(
                gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                    feePercent: 5000,
                    minFeePercent: 1000,
                }),
            ).toBe(true);
        });
    });

    describe('calculateReceiveAmount', () => {
        it('calculates correct receive amount with 0% fee', () => {
            const result = gaugeVoterExitQueueFeeUtils.calculateReceiveAmount({
                lockedAmount: BigInt(1000e18),
                feePercentage: 0,
            });
            expect(result).toBe(BigInt(1000e18));
        });

        it('calculates correct receive amount with 10% fee', () => {
            const lockedAmount = BigInt(1000e18);
            const result = gaugeVoterExitQueueFeeUtils.calculateReceiveAmount({
                lockedAmount,
                feePercentage: 10,
            });
            // 1000 - (1000 * 10%) = 900
            expect(result).toBe(BigInt(900e18));
        });

        it('calculates correct receive amount with 50% fee', () => {
            const lockedAmount = BigInt(1000e18);
            const result = gaugeVoterExitQueueFeeUtils.calculateReceiveAmount({
                lockedAmount,
                feePercentage: 50,
            });
            // 1000 - (1000 * 50%) = 500
            expect(result).toBe(BigInt(500e18));
        });

        it('calculates correct receive amount with 100% fee', () => {
            const result = gaugeVoterExitQueueFeeUtils.calculateReceiveAmount({
                lockedAmount: BigInt(1000e18),
                feePercentage: 100,
            });
            expect(result).toBe(BigInt(0));
        });

        it('handles fractional percentages correctly', () => {
            const lockedAmount = BigInt(1000e18);
            const result = gaugeVoterExitQueueFeeUtils.calculateReceiveAmount({
                lockedAmount,
                feePercentage: 2.5,
            });
            // 1000 - (1000 * 2.5%) = 975
            expect(result).toBe(BigInt(975e18));
        });
    });

    describe('formatFeePercent', () => {
        it('formats 0 basis points as 0%', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(0)).toBe(
                '0.00%',
            );
        });

        it('formats 5000 basis points as 50%', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(5000)).toBe(
                '50%',
            );
        });

        it('formats 10000 basis points as 100%', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(10_000)).toBe(
                '100%',
            );
        });

        it('formats small percentages with 2 decimals', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(50)).toBe(
                '0.50%',
            ); // 0.5%
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(25)).toBe(
                '0.25%',
            ); // 0.25%
        });

        it('formats percentages between 1-10 with 1 decimal', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(150)).toBe(
                '1.5%',
            ); // 1.5%
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(550)).toBe(
                '5.5%',
            ); // 5.5%
        });

        it('formats percentages >= 10 with no decimals', () => {
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(1000)).toBe(
                '10%',
            ); // 10%
            expect(gaugeVoterExitQueueFeeUtils.formatFeePercent(2500)).toBe(
                '25%',
            ); // 25%
        });
    });

    describe('getChartDataPoints', () => {
        it('returns empty array for FIXED mode', () => {
            const fixedTicket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000,
                minFeePercent: 5000,
                slope: BigInt(0),
            };

            const points = gaugeVoterExitQueueFeeUtils.getChartDataPoints({
                ticket: fixedTicket,
                currentTime: fixedTicket.queuedAt + fixedTicket.cooldown,
            });
            expect(points).toEqual([]);
        });

        it('generates points for TIERED mode including breakpoints', () => {
            const tieredTicket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000,
                minFeePercent: 1000,
                slope: BigInt(0),
            };

            const points = gaugeVoterExitQueueFeeUtils.getChartDataPoints({
                ticket: tieredTicket,
                pointCount: 6,
                currentTime: tieredTicket.queuedAt + tieredTicket.cooldown,
            });

            // Should include 0, minCooldown (100), cooldown (200), and evenly spaced points
            expect(points.length).toBeGreaterThan(0);
            expect(points[0]?.elapsedSeconds).toBe(0);
            expect(points).toContainEqual(
                expect.objectContaining({ elapsedSeconds: 100 }),
            );
            expect(points).toContainEqual(
                expect.objectContaining({ elapsedSeconds: 200 }),
            );

            // All points before cooldown should have max fee
            const beforeCooldown = points.filter((p) => p.elapsedSeconds < 200);
            beforeCooldown.forEach((p) => expect(p.feePercent).toBe(50));

            // All points at/after cooldown should have min fee
            const afterCooldown = points.filter((p) => p.elapsedSeconds >= 200);
            afterCooldown.forEach((p) => expect(p.feePercent).toBe(10));
        });

        it('generates points for DYNAMIC mode with linear decay', () => {
            const dynamicTicket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000,
                minFeePercent: 1000,
                slope: BigInt(4e15),
            };

            const points = gaugeVoterExitQueueFeeUtils.getChartDataPoints({
                ticket: dynamicTicket,
                pointCount: 6,
                currentTime: dynamicTicket.queuedAt + dynamicTicket.cooldown,
            });

            expect(points.length).toBeGreaterThan(0);

            // First point should be at 0
            expect(points[0]?.elapsedSeconds).toBe(0);

            // Last point should be at cooldown
            expect(points.at(-1)?.elapsedSeconds).toBe(200);

            // Points should show decreasing fee over time
            for (let i = 0; i < points.length - 1; i++) {
                expect(points[i].feePercent).toBeGreaterThanOrEqual(
                    points[i + 1].feePercent,
                );
            }
        });

        it('uses default point count of 6 when not specified', () => {
            const dynamicTicket = {
                holder: '0x123' as `0x${string}`,
                queuedAt: 1000,
                minCooldown: 100,
                cooldown: 200,
                feePercent: 5000,
                minFeePercent: 1000,
                slope: BigInt(4e15),
            };

            const points = gaugeVoterExitQueueFeeUtils.getChartDataPoints({
                ticket: dynamicTicket,
                currentTime: dynamicTicket.queuedAt + dynamicTicket.cooldown,
            });

            // Should generate 6 points
            expect(points.length).toBe(6);
        });
    });
});
