import { monitoringUtils } from './monitoringUtils';

describe('monitoring utils', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getBaseConfig', () => {
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

    describe('beforeSend', () => {
        const buildEvent = (message: string, url?: string) =>
            ({
                exception: { values: [{ value: message }] },
                request: url == null ? undefined : { url },
            }) as never;

        it('drops zero-signal browser-extension and crawler noise', () => {
            expect(
                monitoringUtils.beforeSend(
                    buildEvent("Can't find variable: __firefox__"),
                ),
            ).toBeNull();
            expect(
                monitoringUtils.beforeSend(
                    buildEvent('Object Not Found Matching Id:3'),
                ),
            ).toBeNull();
            expect(
                monitoringUtils.beforeSend(
                    buildEvent(
                        "Converting circular structure to JSON --> 'HTMLMetaElement' property '__reactFiber$abc'",
                    ),
                ),
            ).toBeNull();
        });

        it('keeps a genuine cyclic error (no __reactFiber) so we never miss our own bug', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent('TypeError: Converting circular structure to JSON'),
            );
            expect(result).not.toBeNull();
        });

        it('keeps expected wallet behaviour, tags it expected and demotes to info', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent('Error: User rejected the request'),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
            expect(result?.level).toEqual('info');
        });

        it('treats non-actionable ENS gateway failures as expected/info', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent(
                    'ContractFunctionExecutionError: The contract function "resolveWithGateways" reverted',
                ),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
            expect(result?.level).toEqual('info');
        });

        it('keeps unhandled wallet rejections (EIP-1193 code 4001) tagged expected', () => {
            const event = {
                exception: {
                    values: [{ value: 'Object captured as promise rejection' }],
                },
                extra: { __serialized__: { code: 4001, message: 'denied' } },
            } as never;
            const result = monitoringUtils.beforeSend(event);
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
        });

        it('tags backend/RPC failures as infra and keeps them', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent('SyntaxError: Unexpected token \'<\', "<html>"'),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('infra');
        });

        it('tags injection/scanner URLs as security-probe and keeps them', () => {
            // SSTI probe payload; built by concatenation to avoid a literal `${}`.
            const probeUrl = `https://app.aragon.org/dao/ethereum-mainnet/dfb__$${'{98991*97996}'}__::.x/dashboard`;
            const result = monitoringUtils.beforeSend(
                buildEvent('Error: Bad parameters', probeUrl),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('security-probe');
        });

        it('passes a genuine error through untagged', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent(
                    'TypeError: Cannot read properties of null',
                    'https://app.aragon.org/dao/base-mainnet/0x690C2e187c8254a887B35C0B4477ce6787F92855/proposals/DIP-17',
                ),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toBeUndefined();
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
