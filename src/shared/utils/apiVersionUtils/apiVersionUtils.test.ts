import { apiVersionUtils } from './apiVersionUtils';

describe('apiVersionUtils', () => {
    describe('getApiVersion', () => {
        const originalEnv = process.env.NEXT_PUBLIC_API_VERSION;

        afterEach(() => {
            process.env.NEXT_PUBLIC_API_VERSION = originalEnv;
        });

        it('should return v2 by default when env var is not set', () => {
            delete process.env.NEXT_PUBLIC_API_VERSION;
            expect(apiVersionUtils.getApiVersion()).toBe('v2');
        });

        it('should return v2 when env var is set to v2', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v2';
            expect(apiVersionUtils.getApiVersion()).toBe('v2');
        });

        it('should return v3 when env var is set to v3', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v3';
            expect(apiVersionUtils.getApiVersion()).toBe('v3');
        });

        it('should default to v2 for invalid version values', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'invalid';
            expect(apiVersionUtils.getApiVersion()).toBe('v2');
        });
    });

    describe('buildVersionedUrl', () => {
        const originalEnv = process.env.NEXT_PUBLIC_API_VERSION;

        afterEach(() => {
            process.env.NEXT_PUBLIC_API_VERSION = originalEnv;
        });

        it('should prepend version to path without version', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v2';
            expect(apiVersionUtils.buildVersionedUrl('/daos/:id')).toBe('/v2/daos/:id');
        });

        it('should replace existing version in path', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v3';
            expect(apiVersionUtils.buildVersionedUrl('/v2/daos/:id')).toBe('/v3/daos/:id');
        });

        it('should handle path without leading slash', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v2';
            expect(apiVersionUtils.buildVersionedUrl('daos/:id')).toBe('/v2/daos/:id');
        });

        it('should use version option when provided', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v2';
            expect(apiVersionUtils.buildVersionedUrl('/daos/:id', { version: 'v3' })).toBe('/v3/daos/:id');
        });

        it('should use forceVersion option over env', () => {
            process.env.NEXT_PUBLIC_API_VERSION = 'v3';
            expect(apiVersionUtils.buildVersionedUrl('/permissions/:id', { forceVersion: 'v2' })).toBe(
                '/v2/permissions/:id',
            );
        });

        it('should prioritize forceVersion over version option', () => {
            expect(apiVersionUtils.buildVersionedUrl('/daos/:id', { version: 'v3', forceVersion: 'v2' })).toBe(
                '/v2/daos/:id',
            );
        });
    });
});
