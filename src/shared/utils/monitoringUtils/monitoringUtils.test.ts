import { monitoringUtils } from './monitoringUtils';

describe('monitoring utils', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getBaseConfig', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isEnabledSpy = jest.spyOn(monitoringUtils as any, 'isEnabled');

        afterEach(() => {
            isEnabledSpy.mockReset();
        });

        afterAll(() => {
            isEnabledSpy.mockRestore();
        });

        it('returns the basic configurations for Sentry', () => {
            const env = 'staging';
            const version = '1.4.0';
            const enabled = true;
            process.env.NEXT_PUBLIC_ENV = env;
            process.env.version = version;
            isEnabledSpy.mockReturnValue(enabled);
            const result = monitoringUtils.getBaseConfig();
            expect(result.enabled).toEqual(enabled);
            expect(result.environment).toEqual(env);
            expect(result.release).toEqual(version);
        });
    });

    describe('isEnabled', () => {
        test.each([
            { env: 'staging', result: true },
            { env: 'development', result: true },
            { env: 'production', result: true },
            { env: 'local', result: false },
            { env: 'unknown', result: false },
        ])('returns $result for $env environment', ({ env, result }) => {
            process.env.NEXT_PUBLIC_ENV = env;
            expect(monitoringUtils['isEnabled']()).toEqual(result);
        });
    });
});
