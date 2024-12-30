import { renderHook } from '@testing-library/react';
import { useApplicationVersion } from './useApplicationVersion';

describe('useApplicationVersion hook', () => {
    const originalProcessEnv = process.env;

    afterEach(() => {
        process.env = originalProcessEnv;
    });

    it.each([
        { env: 'development', label: 'DEV' },
        { env: 'staging', label: 'STG' },
        { env: 'local', label: 'LOC' },
    ])('returns the version with environment label for $env', ({ env, label }) => {
        process.env.version = '1.5.0';
        process.env.NEXT_PUBLIC_ENV = env;
        const { result } = renderHook(() => useApplicationVersion());
        expect(result.current).toMatch(new RegExp(`useApplicationVersion.versionEnv \\(version=1.5.0,env=${label}\\)`));
    });

    it('returns the version without environment label for production environment', () => {
        process.env.version = '1.2.3';
        process.env.NEXT_PUBLIC_ENV = 'production';
        const { result } = renderHook(() => useApplicationVersion());
        expect(result.current).toMatch(/useApplicationVersion.version \(version=1.2.3\)/);
    });
});
