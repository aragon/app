/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server';
import { generateResponse } from '../../testUtils';
import { AragonBackendService } from './aragonBackendService';

class ServiceTest extends AragonBackendService {}

describe('AragonBackend service (server)', () => {
    const originalEnv = process.env;
    const fetchSpy = jest.spyOn(global, 'fetch');
    const nextResponseJsonSpy = jest.spyOn(NextResponse, 'json');

    afterEach(() => {
        process.env = originalEnv;
        fetchSpy.mockReset();
        nextResponseJsonSpy.mockReset();
    });

    it('initializes the service using the URL set as environment variable on server side', () => {
        const backendUrl = 'https://test.backend.com';
        process.env.ARAGON_BACKEND_URL = backendUrl;
        const serviceTest = new ServiceTest();
        expect(serviceTest['baseUrl']).toEqual(backendUrl);
    });

    describe('request method with Authorization header', () => {
        it('adds Authorization header when ARAGON_BACKEND_API_KEY is set', async () => {
            const apiKey = 'test-api-key-123';
            const backendUrl = 'https://test-backend.com';
            process.env.ARAGON_BACKEND_API_KEY = apiKey;
            process.env.ARAGON_BACKEND_URL = backendUrl;

            const parsedResponse = { result: 'test' };
            const fetchReturn = generateResponse({ json: jest.fn(() => Promise.resolve(parsedResponse)) });
            fetchSpy.mockResolvedValue(fetchReturn);

            const serviceTest = new ServiceTest();
            await serviceTest.request('/test-endpoint');

            expect(fetchSpy).toHaveBeenCalledWith(
                `${backendUrl}/test-endpoint`,
                expect.objectContaining({
                    cache: 'no-store',
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }),
            );
        });
    });
});
