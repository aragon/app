/**
 * @jest-environment node
 */

import type { NextURL } from 'next/dist/server/web/next-url';
import { type NextRequest, NextResponse } from 'next/server';
import { generateNextRequest, generateResponse } from '@/shared/testUtils';
import { ProxyBackendUtils, proxyBackendUtils } from './proxyBackendUtils';

describe('proxyBackend utils', () => {
    const originalEnv = process.env;
    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');

    beforeEach(() => {
        fetchSpy.mockResolvedValue(generateResponse());
    });

    afterEach(() => {
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
        process.env = originalEnv;
    });

    describe('request', () => {
        it('calls the backend, parses JSON when content-type is application/json, and returns it', async () => {
            const parsedResponse = { result: 'test' };
            const headers = new Headers({ 'content-type': 'application/json' });
            const fetchReturn = generateResponse({
                status: 200,
                headers,
                json: jest.fn(() => Promise.resolve(parsedResponse)),
            });
            const mockNextResponse = {} as NextResponse;
            fetchSpy.mockResolvedValue(fetchReturn);
            nextResponseJsonSpy.mockReturnValue(mockNextResponse);

            const result = await proxyBackendUtils.request(generateNextRequest({ url: 'http://test.com' }));

            expect(fetchSpy).toHaveBeenCalled();
            expect(fetchReturn.json).toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse, {
                status: fetchReturn.status,
                headers: fetchReturn.headers,
            });
            expect(result).toEqual(mockNextResponse);
        });

        it('forwards 204 responses without a body', async () => {
            const fetchReturn = generateResponse({ status: 204, headers: new Headers() });
            fetchSpy.mockResolvedValue(fetchReturn);

            const result = await proxyBackendUtils.request(generateNextRequest({ url: 'http://test.com' }));

            expect(nextResponseJsonSpy).not.toHaveBeenCalled();
            expect(result.status).toEqual(204);
        });

        it('appends the authorization header when set', async () => {
            const apiKey = 'test-api-key-123';
            process.env.NEXT_SECRET_ARAGON_BACKEND_API_KEY = apiKey;
            await proxyBackendUtils.request(generateNextRequest({ url: 'http://test.com' }));
            const request = fetchSpy.mock.calls[0][1] as NextRequest;
            expect(request.headers.get('X-API-Key')).toEqual(apiKey);
        });
    });

    describe('buildBackendUrl', () => {
        it('returns the URL of the backend service', () => {
            const href = 'http://dev.aragon.app/api/backend/dao/0x1234?network=mainnet';
            process.env.ARAGON_BACKEND_URL = 'https://test-backend.com';
            const testClass = new ProxyBackendUtils();
            const request = generateNextRequest({ nextUrl: { href } as NextURL });
            expect(testClass['buildBackendUrl'](request)).toEqual('https://test-backend.com/dao/0x1234?network=mainnet');
        });
    });
});
