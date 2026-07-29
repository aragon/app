import { getEnvironment } from './getEnvironment';

describe('getEnvironment', () => {
    const originalEnv = process.env.NEXT_PUBLIC_ENV;

    afterEach(() => {
        process.env.NEXT_PUBLIC_ENV = originalEnv;
    });

    it('returns the matching environment when NEXT_PUBLIC_ENV is valid', () => {
        process.env.NEXT_PUBLIC_ENV = 'local';

        const env = getEnvironment();

        expect(env).toBe('local');
    });

    it('falls back to production when NEXT_PUBLIC_ENV is missing or invalid', () => {
        process.env.NEXT_PUBLIC_ENV = undefined;
        expect(getEnvironment()).toBe('production');

        process.env.NEXT_PUBLIC_ENV = 'unknown-env';
        expect(getEnvironment()).toBe('production');
    });
});
