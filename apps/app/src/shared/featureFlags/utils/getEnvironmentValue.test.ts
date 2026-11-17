import { getEnvironmentValue } from './getEnvironmentValue';

describe('getEnvironmentValue', () => {
    it('returns the own value of the environment', () => {
        expect(getEnvironmentValue({ local: true }, 'local')).toBe(true);
        expect(getEnvironmentValue({ production: false }, 'production')).toBe(
            false,
        );
    });

    it('returns undefined when the environment has no value', () => {
        expect(
            getEnvironmentValue({ production: true }, 'staging'),
        ).toBeUndefined();
        expect(getEnvironmentValue({}, 'production')).toBeUndefined();
        expect(getEnvironmentValue(undefined, 'local')).toBeUndefined();
    });

    it('does not fall back to the base environment', () => {
        expect(
            getEnvironmentValue({ production: true }, 'occ'),
        ).toBeUndefined();
    });

    it('treats non-boolean entries as absent', () => {
        expect(getEnvironmentValue({ occ: 'yes' }, 'occ')).toBeUndefined();
        expect(getEnvironmentValue({ occ: 1 }, 'occ')).toBeUndefined();
    });
});
