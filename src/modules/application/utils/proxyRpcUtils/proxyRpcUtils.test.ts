/**
 * @jest-environment node
 */

import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateNextRequest, generateRequest, generateResponse } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { testLogger } from '@/test/utils';
import { NextResponse } from 'next/server';
import { type IRpcRequestOptions, ProxyRpcUtils } from './proxyRpcUtils';

describe('proxyRpc utils', () => {
    const originalProcessEnv = process.env;

    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');

    beforeEach(() => {
        // Set default env vars for tests
        process.env.NEXT_SECRET_RPC_KEY = 'test-alchemy-key';
        process.env.NEXT_SECRET_ANKR_RPC_KEY = 'test-ankr-key';
        process.env.NEXT_SECRET_DRPC_RPC_KEY = 'test-drpc-key';
        process.env.NEXT_SECRET_PEAQ_RPC_KEY = 'test-peaq-key';
        process.env.CI = 'false';
    });

    afterEach(() => {
        process.env = { ...originalProcessEnv };
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
    });

    const createTestClass = (options?: {
        alchemyKey?: string;
        ankrKey?: string;
        drpcKey?: string;
        peaqKey?: string;
    }) => {
        if (options?.alchemyKey !== undefined) {
            process.env.NEXT_SECRET_RPC_KEY = options.alchemyKey;
        }
        if (options?.ankrKey !== undefined) {
            process.env.NEXT_SECRET_ANKR_RPC_KEY = options.ankrKey;
        }
        if (options?.drpcKey !== undefined) {
            process.env.NEXT_SECRET_DRPC_RPC_KEY = options.drpcKey;
        }
        if (options?.peaqKey !== undefined) {
            process.env.NEXT_SECRET_PEAQ_RPC_KEY = options.peaqKey;
        }
        return new ProxyRpcUtils();
    };

    const createTestOptions = (chainId: string): IRpcRequestOptions => ({ params: Promise.resolve({ chainId }) });

    describe('constructor', () => {
        it('throws error when alchemy rpc key is not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_RPC_KEY;
            process.env.CI = 'false';
            expect(() => new ProxyRpcUtils()).toThrow(/NEXT_SECRET_RPC_KEY/);
        });

        it('throws error when ankr rpc key is not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_ANKR_RPC_KEY;
            process.env.CI = 'false';
            expect(() => new ProxyRpcUtils()).toThrow(/NEXT_SECRET_ANKR_RPC_KEY/);
        });

        it('throws error when drpc rpc key is not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_DRPC_RPC_KEY;
            process.env.CI = 'false';
            expect(() => new ProxyRpcUtils()).toThrow(/NEXT_SECRET_DRPC_RPC_KEY/);
        });

        it('throws error when peaq rpc key is not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_PEAQ_RPC_KEY;
            process.env.CI = 'false';
            expect(() => new ProxyRpcUtils()).toThrow(/NEXT_SECRET_PEAQ_RPC_KEY/);
        });

        it('throws error when multiple rpc keys are not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_RPC_KEY;
            delete process.env.NEXT_SECRET_ANKR_RPC_KEY;
            process.env.CI = 'false';
            expect(() => new ProxyRpcUtils()).toThrow(/Missing RPC keys/);
        });

        it('does not throw error when rpc keys are not defined on CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_RPC_KEY;
            delete process.env.NEXT_SECRET_ANKR_RPC_KEY;
            delete process.env.NEXT_SECRET_DRPC_RPC_KEY;
            delete process.env.NEXT_SECRET_PEAQ_RPC_KEY;
            process.env.CI = 'true';
            expect(() => new ProxyRpcUtils()).not.toThrow();
        });
    });

    describe('request', () => {
        it('returns error when network definitions are not found for chain id', async () => {
            const testClass = createTestClass();
            await testClass.request(generateNextRequest(), createTestOptions('72983'));
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                { error: expect.stringMatching(/not supported/) as unknown },
                { status: 501 },
            );
        });

        it('calls the rpc endpoint with the specified parameters, parses and returns the result', async () => {
            const testClass = createTestClass();
            const parsedResponse = { result: 'test' };
            const fetchReturn = generateResponse({
                headers: new Headers({ 'content-type': 'application/json' }),
                json: jest.fn(() => Promise.resolve(parsedResponse)),
            });
            fetchSpy.mockResolvedValue(fetchReturn);
            await testClass.request(generateNextRequest(), createTestOptions('1'));
            expect(fetchSpy).toHaveBeenCalled();
            expect(fetchReturn.json).toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse);
        });
    });

    describe('chainIdToRpcEndpoint', () => {
        it('returns the private rpc endpoint with alchemy rpc key when configured', () => {
            const alchemyKey = 'test-alchemy-key';
            const testClass = createTestClass({ alchemyKey });

            const ethereumMainnet = networkDefinitions[Network.ETHEREUM_MAINNET];
            const expectedUrl = `${ethereumMainnet.privateRpcConfig!.rpcUrl}${alchemyKey}`;

            expect(testClass['chainIdToRpcEndpoint']('1')).toEqual(expectedUrl);
        });

        it('returns the private rpc endpoint with ankr rpc key when configured', () => {
            const ankrKey = 'test-ankr-key';
            const testClass = createTestClass({ ankrKey });

            // Find a network that uses ANKR (e.g., CHILIZ_MAINNET)
            const chilizMainnet = networkDefinitions[Network.CHILIZ_MAINNET];
            const expectedUrl = `${chilizMainnet.privateRpcConfig!.rpcUrl}${ankrKey}`;

            // Need to find the chainId for CHILIZ_MAINNET
            const chilizChainId = String(chilizMainnet.id);
            expect(testClass['chainIdToRpcEndpoint'](chilizChainId)).toEqual(expectedUrl);
        });

        it('returns the private rpc endpoint with drpc rpc key when configured', () => {
            const drpcKey = 'test-drpc-key';
            const testClass = createTestClass({ drpcKey });

            // Find a network that uses DRPC (e.g., KATANA_MAINNET)
            const katanaMainnet = networkDefinitions[Network.KATANA_MAINNET];
            const expectedUrl = `${katanaMainnet.privateRpcConfig!.rpcUrl}${drpcKey}`;

            const katanaChainId = String(katanaMainnet.id);
            expect(testClass['chainIdToRpcEndpoint'](katanaChainId)).toEqual(expectedUrl);
        });

        it('returns the private rpc endpoint with peaq rpc key when configured', () => {
            const peaqKey = 'test-peaq-key';
            const testClass = createTestClass({ peaqKey });

            const peaqMainnet = networkDefinitions[Network.PEAQ_MAINNET];
            const expectedUrl = `${peaqMainnet.privateRpcConfig!.rpcUrl}${peaqKey}`;

            const peaqChainId = String(peaqMainnet.id);
            expect(testClass['chainIdToRpcEndpoint'](peaqChainId)).toEqual(expectedUrl);
        });

        it('returns the public rpc endpoint when no private rpc is set for the given chain id', () => {
            const testClass = createTestClass();
            // Test with a network that doesn't exist - should return undefined
            // This tests the early return when network is not found
            expect(testClass['chainIdToRpcEndpoint']('999999')).toBeUndefined();
        });

        it('falls back to public rpc endpoint when private rpc key is missing', () => {
            testLogger.suppressErrors();
            const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

            // Delete ANKR key to simulate missing env var
            // Set CI=true to skip constructor validation and test runtime fallback
            delete process.env.NEXT_SECRET_ANKR_RPC_KEY;
            process.env.CI = 'true';
            const testClass = createTestClass();

            const chilizMainnet = networkDefinitions[Network.CHILIZ_MAINNET];
            const chilizChainId = String(chilizMainnet.id);

            // Should fallback to public RPC
            const result = testClass['chainIdToRpcEndpoint'](chilizChainId);
            expect(result).toEqual(chilizMainnet.rpcUrls.default.http[0]);
            expect(logErrorSpy).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    context: expect.objectContaining({
                        rpcProvider: 'ankr',
                        fallbackToPublicRpc: true,
                    }),
                }),
            );

            logErrorSpy.mockRestore();
        });

        it('returns undefined when network definitions of chain id cannot be found', () => {
            const testClass = createTestClass();
            expect(testClass['chainIdToRpcEndpoint']('unknown_chain')).toBeUndefined();
        });
    });

    describe('chainIdToNetwork', () => {
        it('returns the network related of the specified chain id', () => {
            const testClass = createTestClass();
            expect(testClass['chainIdToNetwork']('1')).toEqual(Network.ETHEREUM_MAINNET);
            expect(testClass['chainIdToNetwork']('137')).toEqual(Network.POLYGON_MAINNET);
            expect(testClass['chainIdToNetwork']('300')).toEqual(Network.ZKSYNC_SEPOLIA);
        });

        it('returns undefined when network definitions of chain id cannot be found', () => {
            const testClass = createTestClass();
            expect(testClass['chainIdToNetwork']('123')).toBeUndefined();
        });
    });

    describe('buildRequestOptions', () => {
        it('returns the parameters for the fetch call', () => {
            const testClass = createTestClass();
            const request = generateRequest({ method: 'POST', body: {} as ReadableStream, credentials: 'include' });

            const requestOptions = testClass['buildRequestOptions'](request);

            expect(requestOptions.method).toEqual(request.method);
            expect(requestOptions.body).toEqual(request.body);
            expect(requestOptions.duplex).toEqual('half');
            expect(requestOptions.credentials).toEqual('omit'); // always omit credentials on proxy requests
        });

        it('strips all headers from the request, but leaves content-type', () => {
            const testClass = createTestClass();
            const headers = new Headers({
                'test-header': 'test-value',
                cookie: 'test-cookie=test-value',
                Cookie: 'test-cookie=test-value',
            });
            const request = generateRequest({
                headers,
            });

            const requestOptions = testClass['buildRequestOptions'](request);

            expect(requestOptions.headers).toEqual({ 'Content-Type': 'application/json' });
        });
    });
});
