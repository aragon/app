import { resolveAdvancedGovernanceAvailability } from './advancedGovernanceAvailabilityUtils';

describe('resolveAdvancedGovernanceAvailability', () => {
    it('returns true when DAO was created before cutoff', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(true);
    });

    it('returns false when DAO was created at or after cutoff', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_800_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);

        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_900_000_000,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);
    });

    it('returns false when DAO timestamp is undefined', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: undefined,
                cutoffTimestamp: '1800000000',
            }),
        ).toBe(false);
    });

    it('returns false when cutoff is undefined', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: undefined,
            }),
        ).toBe(false);
    });

    it('returns false when cutoff is empty string', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '',
            }),
        ).toBe(false);
    });

    it('returns false when cutoff is non-numeric', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: 'not-a-number',
            }),
        ).toBe(false);
    });

    it('returns false when cutoff is zero or negative', () => {
        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '0',
            }),
        ).toBe(false);

        expect(
            resolveAdvancedGovernanceAvailability({
                daoBlockTimestamp: 1_700_000_000,
                cutoffTimestamp: '-1',
            }),
        ).toBe(false);
    });
});
