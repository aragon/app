/**
 * @jest-environment node
 */

import { revalidateTag } from 'next/cache';
import type { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server';
import { SafeServiceErrorCode } from '@/shared/api/safeService/domain';
import { generateNextRequest, generateResponse } from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { type ISafeRequestOptions, ProxySafeUtils } from './proxySafeUtils';

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));

describe('proxySafe utils', () => {
    const originalProcessEnv = process.env;

    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');
    const revalidateTagSpy = jest.mocked(revalidateTag);

    beforeEach(() => {
        process.env.NEXT_SECRET_SAFE_API_KEY = 'test-safe-key';
        process.env.NEXT_RUNTIME = 'nodejs';
        process.env.CI = 'false';
    });

    afterEach(() => {
        process.env = { ...originalProcessEnv };
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
        revalidateTagSpy.mockReset();
    });

    const safeAddress = `0x${'a'.repeat(40)}`;

    const createTestOptions = (
        chainId: string,
        path: string[] = ['v1', 'safes', safeAddress, 'balances'],
    ): ISafeRequestOptions => ({
        params: Promise.resolve({ chainId, path }),
    });

    const createTestRequest = (search = '', method = 'GET', body?: unknown) =>
        generateNextRequest({
            method,
            nextUrl: { search } as NextURL,
            json: jest.fn().mockResolvedValue(body),
        });

    describe('constructor', () => {
        it('throws error when the safe api key is not defined on non CI context', () => {
            testLogger.suppressErrors();
            delete process.env.NEXT_SECRET_SAFE_API_KEY;
            process.env.CI = 'false';
            expect(() => new ProxySafeUtils()).toThrow(
                /NEXT_SECRET_SAFE_API_KEY/,
            );
        });

        it('does not throw error when the safe api key is not defined on CI context', () => {
            delete process.env.NEXT_SECRET_SAFE_API_KEY;
            process.env.CI = 'true';
            expect(() => new ProxySafeUtils()).not.toThrow();
        });
    });

    describe('request', () => {
        it('forwards the request to the safe transaction service with the bearer authorization header', async () => {
            const testClass = new ProxySafeUtils();
            const parsedResponse = [{ tokenAddress: null }];
            const fetchReturn = generateResponse({
                json: jest.fn(() => Promise.resolve(parsedResponse)),
            });
            fetchSpy.mockResolvedValue(fetchReturn);

            await testClass.request(
                createTestRequest('?trusted=true'),
                createTestOptions('1'),
            );

            expect(fetchSpy).toHaveBeenCalledWith(
                `https://api.safe.global/tx-service/eth/api/v1/safes/${safeAddress}/balances/?trusted=true`,
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'omit',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-safe-key',
                    }) as unknown,
                }),
            );
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse);
        });

        it('rejects a read outside the allowlisted surface', async () => {
            // The route is unauthenticated and spends a shared API key. Governance-body reads moved
            // to the Aragon backend, so an open GET here would only serve an abuser.
            const testClass = new ProxySafeUtils();

            await testClass.request(
                createTestRequest(),
                createTestOptions('1', ['v1', 'safes', safeAddress]),
            );

            expect(fetchSpy).not.toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'upstream-error' }),
                expect.objectContaining({ status: 400 }),
            );
        });

        it('forwards an uncached proposal POST body only to the supported Safe endpoint', async () => {
            const testClass = new ProxySafeUtils();
            const body = {
                safeTxHash: `0x${'1'.repeat(64)}`,
                senderSignature: '0xsignature',
            };
            fetchSpy.mockResolvedValue(
                generateResponse({
                    status: 201,
                    json: jest.fn(() => Promise.resolve({})),
                }),
            );

            await testClass.request(
                createTestRequest('', 'POST', body),
                createTestOptions('1', [
                    'v1',
                    'safes',
                    `0x${'a'.repeat(40)}`,
                    'multisig-transactions',
                ]),
            );

            expect(fetchSpy).toHaveBeenCalledWith(
                `https://api.safe.global/tx-service/eth/api/v1/safes/0x${'a'.repeat(40)}/multisig-transactions/`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(body),
                    cache: 'no-store',
                    credentials: 'omit',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-safe-key',
                        'Content-Type': 'application/json',
                    }) as unknown,
                }),
            );
        });

        it('rejects a POST to an unrelated transaction-service endpoint', async () => {
            const testClass = new ProxySafeUtils();

            await testClass.request(
                createTestRequest('', 'POST', {}),
                createTestOptions('1', ['v1', 'delegates']),
            );

            expect(fetchSpy).not.toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.UPSTREAM_ERROR,
                }),
                expect.objectContaining({ status: 400 }),
            );
        });

        it('preserves a successful empty POST response', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({
                    status: 201,
                    text: jest.fn().mockResolvedValue(''),
                }),
            );

            const response = await testClass.request(
                createTestRequest('', 'POST', { signature: '0xsignature' }),
                createTestOptions('1', [
                    'v1',
                    'multisig-transactions',
                    `0x${'1'.repeat(64)}`,
                    'confirmations',
                ]),
            );

            expect(response.status).toEqual(201);
            expect(nextResponseJsonSpy).not.toHaveBeenCalled();
        });

        it('caches a read against a per-safe tag so concurrent viewers share one upstream call', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ json: jest.fn().mockResolvedValue([]) }),
            );

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    next: {
                        revalidate: 10,
                        tags: ['safe:1', `safe:1:${safeAddress}`],
                    },
                }),
            );
        });

        it('never caches a write', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ json: jest.fn().mockResolvedValue({}) }),
            );

            await testClass.request(
                createTestRequest('', 'POST', { signature: '0xsignature' }),
                createTestOptions('1', [
                    'v1',
                    'safes',
                    `0x${'a'.repeat(40)}`,
                    'multisig-transactions',
                ]),
            );

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ cache: 'no-store' }),
            );
        });

        it('drops the cached safe state after a successful proposal so the signer sees their own signature', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ json: jest.fn().mockResolvedValue({}) }),
            );
            const safeAddress = `0x${'a'.repeat(40)}`;

            await testClass.request(
                createTestRequest('', 'POST', { nonce: '7' }),
                createTestOptions('1', [
                    'v1',
                    'safes',
                    safeAddress,
                    'multisig-transactions',
                ]),
            );

            // `expire: 0` rather than a stale-while-revalidate profile: read-your-own-writes.
            expect(revalidateTagSpy).toHaveBeenCalledWith(
                `safe:1:${safeAddress}`,
                {
                    expire: 0,
                },
            );
        });

        it('does not revalidate when the write failed', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ ok: false, status: 422 }),
            );

            await testClass.request(
                createTestRequest('', 'POST', { nonce: '7' }),
                createTestOptions('1', [
                    'v1',
                    'safes',
                    `0x${'a'.repeat(40)}`,
                    'multisig-transactions',
                ]),
            );

            expect(revalidateTagSpy).not.toHaveBeenCalled();
        });

        it('returns a typed unsupported-chain response for a chain without a transaction service', async () => {
            const testClass = new ProxySafeUtils();

            // Citrea (4114) is a supported app network with no Safe transaction service.
            await testClass.request(
                createTestRequest(),
                createTestOptions('4114'),
            );

            expect(fetchSpy).not.toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.UNSUPPORTED_CHAIN,
                }),
                expect.objectContaining({ status: 501 }),
            );
        });

        it('returns a typed unsupported-chain response for an unknown chain id', async () => {
            const testClass = new ProxySafeUtils();

            await testClass.request(
                createTestRequest(),
                createTestOptions('72983'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.UNSUPPORTED_CHAIN,
                }),
                expect.objectContaining({ status: 501 }),
            );
        });

        it('returns a typed degraded response with the upstream backoff on a rate limit', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({
                    ok: false,
                    status: 429,
                    headers: new Headers({ 'retry-after': '30' }),
                }),
            );

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.RATE_LIMITED,
                    retryAfter: 30,
                }),
                expect.objectContaining({
                    status: 429,
                    headers: { 'Retry-After': '30' },
                }),
            );
        });

        it('provides a default backoff when a rate limit response omits retry-after', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ ok: false, status: 429 }),
            );

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.RATE_LIMITED,
                    retryAfter: 60,
                }),
                expect.objectContaining({
                    status: 429,
                    headers: { 'Retry-After': '60' },
                }),
            );
        });

        it('forwards an upstream not-found as a typed not-found response', async () => {
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ ok: false, status: 404 }),
            );

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.NOT_FOUND,
                }),
                expect.objectContaining({ status: 404 }),
            );
        });

        it('returns a typed upstream-error response on an unexpected upstream status', async () => {
            testLogger.suppressErrors();
            const testClass = new ProxySafeUtils();
            fetchSpy.mockResolvedValue(
                generateResponse({ ok: false, status: 503 }),
            );

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.UPSTREAM_ERROR,
                }),
                expect.objectContaining({ status: 503 }),
            );
        });

        it('returns a typed connection-error response when the upstream cannot be reached', async () => {
            testLogger.suppressErrors();
            const testClass = new ProxySafeUtils();
            fetchSpy.mockRejectedValue(new Error('network down'));

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.CONNECTION_ERROR,
                }),
                expect.objectContaining({ status: 502 }),
            );
        });

        it('returns a typed not-configured response when the key cannot be read outside a server runtime', async () => {
            testLogger.suppressErrors();
            const testClass = new ProxySafeUtils();
            delete process.env.NEXT_RUNTIME;

            await testClass.request(
                createTestRequest(),
                createTestOptions('1'),
            );

            expect(fetchSpy).not.toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: SafeServiceErrorCode.NOT_CONFIGURED,
                }),
                expect.objectContaining({ status: 503 }),
            );
        });

        it('rejects a path attempting to escape the transaction service base url', async () => {
            const testClass = new ProxySafeUtils();

            await testClass.request(
                createTestRequest(),
                createTestOptions('1', ['v1', '..', 'other']),
            );

            expect(fetchSpy).not.toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(String) as unknown,
                }),
                expect.objectContaining({ status: 400 }),
            );
        });
    });

    describe('buildUpstreamPath', () => {
        it('joins the segments and appends the trailing slash required by the transaction service', () => {
            const testClass = new ProxySafeUtils();
            expect(
                testClass['buildUpstreamPath'](['v1', 'safes', '0xAddress']),
            ).toEqual('/v1/safes/0xAddress/');
        });

        it.each([
            { path: [], description: 'empty path' },
            { path: ['v1', ''], description: 'empty segment' },
            { path: ['..', 'v1'], description: 'traversal segment' },
        ])('returns undefined for a $description', ({ path }) => {
            const testClass = new ProxySafeUtils();
            expect(testClass['buildUpstreamPath'](path)).toBeUndefined();
        });
    });
});
