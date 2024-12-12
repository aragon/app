/**
 * @jest-environment node
 */

import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateRequest, generateResponse } from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import * as NextHeaders from 'next/headers';
import { NextResponse } from 'next/server';
import { type IRpcRequestOptions, RpcRequestUtils } from './rpcRequestUtils';

describe('rpcRequest utils', () => {
    const originalProcessEnv = process.env;
    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');
    const headersSpy = jest.spyOn(NextHeaders, 'headers');

    beforeEach(() => {
        headersSpy.mockResolvedValue({ get: jest.fn(() => 'http://localhost') } as unknown as ReadonlyHeaders);
    });

    afterEach(() => {
        process.env = originalProcessEnv;
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
        headersSpy.mockReset();
    });

    const createTestClass = (rpcKey?: string) => {
        process.env.NEXT_SECRET_RPC_KEY = rpcKey ?? 'test';
        return new RpcRequestUtils();
    };

    const createTestOptions = (chainId: string): IRpcRequestOptions => ({ params: Promise.resolve({ chainId }) });

    it('throws error when the rpc key is not defined', () => {
        testLogger.suppressErrors();
        expect(() => new RpcRequestUtils()).toThrow();
    });

    describe('request', () => {
        it('returns error when network definitions are not found for chain id', async () => {
            const testClass = createTestClass();
            await testClass.request(generateRequest(), createTestOptions('72983'));
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                { error: expect.stringMatching(/not supported/) as unknown },
                { status: 501 },
            );
        });

        it('calls the rpc endpoint with the specified parameters, parses and returns the result', async () => {
            const testClass = createTestClass();
            const parsedResponse = { result: 'test' };
            const fetchReturn = generateResponse({ json: jest.fn(() => Promise.resolve(parsedResponse)) });
            fetchSpy.mockResolvedValue(fetchReturn);
            await testClass.request(generateRequest(), createTestOptions('1'));
            expect(fetchSpy).toHaveBeenCalled();
            expect(fetchReturn.json).toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse);
        });
    });

    describe('checkReferer', () => {
        it('returns true when allowed-domain variable is not defined', () => {
            const testClass = createTestClass();
            expect(
                testClass['checkReferer']({ get: () => 'http://localhost' } as unknown as ReadonlyHeaders),
            ).toBeTruthy();
        });

        it('returns true when referer hostname ends with allowed-domain variable', () => {
            process.env.NEXT_PUBLIC_RPC_ALLOWED_DOMAIN = 'aragon.org';
            const testClass = createTestClass();
            const subdomain = { get: () => 'https://stg.app-next.aragon.org/' } as unknown as ReadonlyHeaders;
            expect(testClass['checkReferer'](subdomain)).toBeTruthy();
            const exact = { get: () => 'https://aragon.org/' } as unknown as ReadonlyHeaders;
            expect(testClass['checkReferer'](exact)).toBeTruthy();
        });
    });

    describe('chainIdToRpcEndpoint', () => {
        it('returns the rpc endpoint with the rpc key of the specified chain id', () => {
            const rpcKey = 'test-key';
            const testClass = createTestClass(rpcKey);

            expect(testClass['chainIdToRpcEndpoint']('1')).toEqual(
                `${networkDefinitions[Network.ETHEREUM_MAINNET].rpc}${rpcKey}`,
            );
            expect(testClass['chainIdToRpcEndpoint']('11155111')).toEqual(
                `${networkDefinitions[Network.ETHEREUM_SEPOLIA].rpc}${rpcKey}`,
            );
        });

        it('returns undefined when network definitions of chain id cannot be found', () => {
            const testClass = createTestClass();
            expect(testClass['chainIdToRpcEndpoint']('123')).toBeUndefined();
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
            const request = generateRequest({ method: 'POST', body: {} as ReadableStream });
            expect(testClass['buildRequestOptions'](request)).toEqual({
                method: request.method,
                body: request.body,
                headers: request.headers,
                duplex: 'half',
            });
        });
    });
});
