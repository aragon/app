/**
 * @jest-environment node
 */

import { generateNextRequest, generateResponse } from '@/shared/testUtils';
import type { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server';
import { ProxyBackendUtils, proxyBackendUtils } from './proxyBackendUtils';

describe('proxyBackend utils', () => {
    const originalEnv = process.env;
    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');

    afterEach(() => {
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
        process.env = originalEnv;
    });

    describe('request', () => {
        it('calls the rpc endpoint with the specified parameters, parses and returns the result', async () => {
            const parsedResponse = { result: 'test' };
            const fetchReturn = generateResponse({ json: jest.fn(() => Promise.resolve(parsedResponse)) });
            fetchSpy.mockResolvedValue(fetchReturn);
            await proxyBackendUtils.request(generateNextRequest());
            expect(fetchSpy).toHaveBeenCalled();
            expect(fetchReturn.json).toHaveBeenCalled();
            expect(nextResponseJsonSpy).toHaveBeenCalledWith(parsedResponse);
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
