import { buildCorsOriginResolver } from './corsOrigin';

describe('buildCorsOriginResolver', () => {
    it('allows exact origins', () => {
        const resolve = buildCorsOriginResolver(['https://app.aragon.org']);

        expect(resolve('https://app.aragon.org')).toEqual(
            'https://app.aragon.org',
        );
        expect(resolve('https://evil.example.com')).toBeUndefined();
    });

    it('allows https origins matching a wildcard suffix pattern', () => {
        const resolve = buildCorsOriginResolver(['*.vercel.app']);

        expect(resolve('https://app-abc123-aragon-app.vercel.app')).toEqual(
            'https://app-abc123-aragon-app.vercel.app',
        );
        expect(
            resolve('http://app-abc123-aragon-app.vercel.app'),
        ).toBeUndefined();
        expect(resolve('https://vercel.app.evil.com')).toBeUndefined();
    });

    it('rejects origins that only contain the suffix as a substring', () => {
        const resolve = buildCorsOriginResolver(['*.vercel.app']);

        expect(resolve('https://fakevercel.app.example.com')).toBeUndefined();
    });

    it('rejects malformed origins', () => {
        const resolve = buildCorsOriginResolver([
            '*.vercel.app',
            'https://app.aragon.org',
        ]);

        expect(resolve('not-a-url')).toBeUndefined();
        expect(resolve('')).toBeUndefined();
    });
});
