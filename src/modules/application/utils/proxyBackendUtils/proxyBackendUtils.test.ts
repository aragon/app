/**
 * @jest-environment node
 */

import { generateNextRequest, generateResponse } from '@/shared/testUtils';
import type { NextURL } from 'next/dist/server/web/next-url';
import { type NextRequest, NextResponse } from 'next/server';
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
        it('calls the rpc endpoint with the specified parameters, parses and returns the result', async () => {
            const parsedResponse = { result: 'test' };
            const headers = new Headers();
            const fetchReturn = generateResponse({ json: jest.fn(() => Promise.resolve(parsedResponse)), headers });
            const mockNextResponse = {} as NextResponse;
            fetchSpy.mockResolvedValue(fetchReturn);
            nextResponseJsonSpy.mockReturnValue(mockNextResponse);

            const result = await proxyBackendUtils.request(generateNextRequest({ url: 'http://test.com' }));

            expect(fetchSpy).toHaveBeenCalled();
            expect(fetchReturn.json).toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse, fetchReturn);
            expect(result).toEqual(mockNextResponse);
        });

        it('appends the authorization header when set', async () => {
            const apiKey = 'test-api-key-123';
            process.env.NEXT_SECRET_ARAGON_BACKEND_API_KEY = apiKey;
            await proxyBackendUtils.request(generateNextRequest({ url: 'http://test.com' }));
            const request = fetchSpy.mock.calls[0][1] as NextRequest;
            expect(request.headers.get('Authorization')).toEqual(`Bearer ${apiKey}`);
        });
    });

    describe('buildBackendUrl', () => {
        it('returns the URL of the backend service', () => {
            const href = 'http://dev.aragon.app/api/backend/dao/0x1234?network=mainnet';
            process.env.ARAGON_BACKEND_URL = 'https://test-backend.com';
            const testClass = new ProxyBackendUtils();
            const request = generateNextRequest({ nextUrl: { href } as NextURL });
            expect(testClass['buildBackendUrl'](request)).toEqual(
                'https://test-backend.com/dao/0x1234?network=mainnet',
            );
        });
    });
});
