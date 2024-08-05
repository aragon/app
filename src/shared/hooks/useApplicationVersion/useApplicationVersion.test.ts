import { renderHook } from '@testing-library/react';
import { useApplicationVersion } from './useApplicationVersion';

describe('useApplicationVersion hook', () => {
    const originalProcessEnv = process.env;

    afterEach(() => {
        process.env = originalProcessEnv;
    });

    it('returns the version with environment label for development', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'development';
        const { result } = renderHook(() => useApplicationVersion());
        expect(result.current).toMatch(/useApplicationVersion.versionEnv \(version=1.0.0,env=DEV\)/);
    });

    it('returns the version with environment label for staging', () => {
        process.env.version = '1.5.0';
        process.env.NEXT_PUBLIC_ENV = 'staging';
        const { result } = renderHook(() => useApplicationVersion());
        expect(result.current).toMatch(/useApplicationVersion.versionEnv \(version=1.5.0,env=STG\)/);
    });

    it('returns the version without environment label for unknown environment', () => {
        process.env.version = '1.2.3';
        process.env.NEXT_PUBLIC_ENV = 'production';
        const { result } = renderHook(() => useApplicationVersion());
        expect(result.current).toMatch(/useApplicationVersion.version \(version=1.2.3\)/);
    });
});
