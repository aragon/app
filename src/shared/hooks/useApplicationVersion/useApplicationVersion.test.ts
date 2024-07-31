import { renderHook } from '@testing-library/react';
import { useApplicationVersion } from './useApplicationVersion';

describe('useApplicationVersionHook', () => {
    it('should return correct application version and environment label for a defined environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'staging';

        const { result } = renderHook(() => useApplicationVersion());

        expect(result.current.version).toBe('1.0.0');
        expect(result.current.env).toBe('STG');
        expect(result.current.versionLabel).toBe('versionEnv');
    });

    it('should return version label as "version" when env is not defined', () => {
        process.env.version = '1.0.0';
        delete process.env.NEXT_PUBLIC_ENV;

        const { result } = renderHook(() => useApplicationVersion());

        expect(result.current.version).toBe('1.0.0');
        expect(result.current.env).toBeUndefined();
        expect(result.current.versionLabel).toBe('version');
    });
});
