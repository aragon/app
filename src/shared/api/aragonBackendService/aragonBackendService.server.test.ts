/**
 * @jest-environment node
 */

import { AragonBackendService } from './aragonBackendService';

class ServiceTest extends AragonBackendService {}

describe('AragonBackend service (server)', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
    });

    it('initializes the service using the URL set as environment variable on server side', () => {
        const backendUrl = 'https://test.backend.com';
        process.env.ARAGON_BACKEND_URL = backendUrl;
        const serviceTest = new ServiceTest();
        expect(serviceTest['baseUrl']).toEqual(backendUrl);
    });
});
