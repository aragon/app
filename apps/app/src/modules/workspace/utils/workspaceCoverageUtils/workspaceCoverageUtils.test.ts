import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceCoverage,
    WorkspaceCoverageSource,
    WorkspaceCoverageStatus,
} from '../../api/workspaceQueryService';
import { workspaceCoverageUtils } from './workspaceCoverageUtils';

describe('workspaceCoverage utils', () => {
    const account = {
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
    };

    const buildCoverage = (
        coverage?: Partial<IWorkspaceCoverage>,
    ): IWorkspaceCoverage => ({
        account,
        resource: 'transactions',
        source: WorkspaceCoverageSource.SAFE,
        status: WorkspaceCoverageStatus.AVAILABLE,
        ...coverage,
    });

    describe('getUnreadableAccounts', () => {
        it('returns only the unavailable entries from mixed coverage', () => {
            const unavailable = buildCoverage({
                status: WorkspaceCoverageStatus.UNAVAILABLE,
            });
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.AVAILABLE }),
                unavailable,
                buildCoverage({ status: WorkspaceCoverageStatus.UNVERIFIED }),
                buildCoverage({ status: WorkspaceCoverageStatus.PARTIAL }),
            ];
            expect(
                workspaceCoverageUtils.getUnreadableAccounts(coverage),
            ).toEqual([unavailable]);
        });

        it('returns an empty list for coverage holding no unavailable entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.UNVERIFIED }),
            ];
            expect(
                workspaceCoverageUtils.getUnreadableAccounts(coverage),
            ).toEqual([]);
        });

        it('returns an empty list for undefined coverage', () => {
            expect(
                workspaceCoverageUtils.getUnreadableAccounts(undefined),
            ).toEqual([]);
        });
    });

    describe('hasUnreadableAccounts', () => {
        it('reports nothing unreadable for an unverified entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.UNVERIFIED }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                false,
            );
        });

        it('reports nothing unreadable for a partial entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.PARTIAL }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                false,
            );
        });

        it('reports nothing unreadable for an unsupported entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.UNSUPPORTED }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                false,
            );
        });

        it('reports an unreadable account for an unavailable entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.AVAILABLE }),
                buildCoverage({ status: WorkspaceCoverageStatus.UNAVAILABLE }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                true,
            );
        });

        it('reports nothing unreadable for a stale entry', () => {
            const coverage = [
                buildCoverage({
                    status: WorkspaceCoverageStatus.AVAILABLE,
                    stale: true,
                }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                false,
            );
        });

        it('ignores whether the account was reached through a process', () => {
            const coverage = [
                buildCoverage({
                    status: WorkspaceCoverageStatus.UNVERIFIED,
                    via: account,
                }),
            ];
            expect(workspaceCoverageUtils.hasUnreadableAccounts(coverage)).toBe(
                false,
            );
        });

        it('reports nothing unreadable for undefined coverage', () => {
            expect(
                workspaceCoverageUtils.hasUnreadableAccounts(undefined),
            ).toBe(false);
        });
    });

    describe('hasIncompleteCount', () => {
        it('reports a complete count for an unverified entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.UNVERIFIED }),
            ];
            expect(workspaceCoverageUtils.hasIncompleteCount(coverage)).toBe(
                false,
            );
        });

        it('reports an incomplete count for a partial entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.PARTIAL }),
            ];
            expect(workspaceCoverageUtils.hasIncompleteCount(coverage)).toBe(
                true,
            );
        });

        it('reports an incomplete count for an unavailable entry', () => {
            const coverage = [
                buildCoverage({ status: WorkspaceCoverageStatus.UNAVAILABLE }),
            ];
            expect(workspaceCoverageUtils.hasIncompleteCount(coverage)).toBe(
                true,
            );
        });
    });
});
