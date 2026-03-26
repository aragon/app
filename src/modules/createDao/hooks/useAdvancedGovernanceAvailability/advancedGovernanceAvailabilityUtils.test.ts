import { resolveAdvancedGovernanceAvailability } from './advancedGovernanceAvailabilityUtils';

describe('resolveAdvancedGovernanceAvailability', () => {
    it('returns true in non-production environments regardless of DAO timestamp', () => {
        const nonProdEnvs = [
            'local',
            'development',
            'preview',
            'staging',
        ] as const;

        for (const environment of nonProdEnvs) {
            expect(
                resolveAdvancedGovernanceAvailability({
                    environment,
                    daoBlockTimestamp: undefined,
                    cutoffTimestamp: undefined,
                }),
            ).toBe(true);
        }
    });

    it('returns true in production when DAO was created before cutoff', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(true);
    });

    it('returns false in production when DAO was created at or after cutoff', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_800_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);

        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_900_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);
    });

    it('returns false in production when DAO timestamp is undefined', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: undefined,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);
    });

    it('returns false in production when cutoff is undefined', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: undefined,
            }),
        ).toBe(false);
    });

    it('returns false in production when cutoff is empty string', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '',
            }),
        ).toBe(false);
    });

    it('returns false in production when cutoff is non-numeric', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: 'not-a-number',
            }),
        ).toBe(false);
    });

    it('returns false in production when cutoff is zero or negative', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '0',
            }),
        ).toBe(false);

        expect(
            resolveAdvancedGovernanceAvailability({
                environment: 'production',
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '-1',
            }),
        ).toBe(false);
    });
});
