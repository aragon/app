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
            expect(result?.tags?.noise_class).toBeUndefined();
        });

        it('tags environment noise (in-app browsers, extension conflicts, deploy skew) as expected/info', () => {
            const environmentMessages = [
                'TypeError: JSON.stringify cannot serialize cyclic structures.',
                "TypeError: 'get' on proxy: property 'removeListener' is a read-only and non-configurable data property",
                "NotFoundError: Failed to execute 'removeChild' on 'Node'",
                "ReferenceError: Can't find variable: indexedDB",
                'SecurityError: The operation is insecure.',
                "SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
                'Error: Relay service: ClientOffline',
                'Error: Failed to find Server Action. This request might be from an older or newer deployment.',
                'UnrecognizedActionError: Server Action "403be7de8c" was not found on the server.',
                'Error: The destination stream closed early.',
            ];

            environmentMessages.forEach((message) => {
                const result = monitoringUtils.beforeSend(buildEvent(message));
                expect(result).not.toBeNull();
                expect(result?.tags?.noise_class).toEqual('expected');
                expect(result?.level).toEqual('info');
            });
        });

        it('tags AppKit disconnect failures as expected wallet behaviour', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent('AppKitError: Failed to disconnect'),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
        });

        it('keeps expected wallet behaviour, tags it expected and demotes to info', () => {
            const result = monitoringUtils.beforeSend(
                buildEvent('Error: User rejected the request'),
            );
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
            expect(result?.level).toEqual('info');
        });

        it('tags wallet-side cancellations surfaced as RPC errors as expected/info', () => {
            const cancellationMessages = [
                'TransactionExecutionError: An unknown RPC error occurred. Details: User disapproved requested methods',
                'TransactionExecutionError: An internal error was received. Details: User cancelled action on Trezor device (Passphrase dismissed)',
            ];

            cancellationMessages.forEach((message) => {
                const result = monitoringUtils.beforeSend(buildEvent(message));
                expect(result).not.toBeNull();
                expect(result?.tags?.noise_class).toEqual('expected');
                expect(result?.level).toEqual('info');
            });
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

        it('does not mis-tag a real bug when a broad phrase only appears in unrelated serialized data', () => {
            const event = {
                exception: {
                    values: [
                        { value: 'TypeError: cannot read properties of x' },
                    ],
                },
                // A broad phrase buried in an arbitrary field must NOT classify the
                // event — only the exception text / `.message` is matched.
                extra: {
                    __serialized__: {
                        detail: 'the wallet must be connected to the gauge',
                    },
                },
            } as never;
            const result = monitoringUtils.beforeSend(event);
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toBeUndefined();
        });

        it('still tags plain-object wallet rejections that carry their text in .message', () => {
            const event = {
                exception: {
                    values: [{ value: 'Object captured as promise rejection' }],
                },
                extra: {
                    __serialized__: { message: 'User rejected the request' },
                },
            } as never;
            const result = monitoringUtils.beforeSend(event);
            expect(result).not.toBeNull();
            expect(result?.tags?.noise_class).toEqual('expected');
        });
    });

    describe('toError', () => {
        it('rebuilds an Error from a serialized error so Sentry titles and groups it by name and message', () => {
            const serialized = {
                name: 'AragonBackendServiceError',
                message: 'Error parsing response (status=502)',
                stack: 'AragonBackendServiceError: Error parsing response\n    at n.fromResponse',
                code: 'parseError',
                status: 502,
            };
            const result = monitoringUtils['toError'](serialized) as Error & {
                code?: string;
                status?: number;
            };
            expect(result).toBeInstanceOf(Error);
            expect(result.name).toEqual(serialized.name);
            expect(result.message).toEqual(serialized.message);
            expect(result.stack).toEqual(serialized.stack);
            expect(result.code).toEqual(serialized.code);
            expect(result.status).toEqual(serialized.status);
        });

        it('passes errors, primitives and objects without a message through untouched', () => {
            const error = new Error('boom');
            const noMessage = { code: 4001 };
            expect(monitoringUtils['toError'](error)).toBe(error);
            expect(monitoringUtils['toError']('boom')).toEqual('boom');
            expect(monitoringUtils['toError'](undefined)).toBeUndefined();
            expect(monitoringUtils['toError'](noMessage)).toBe(noMessage);
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
