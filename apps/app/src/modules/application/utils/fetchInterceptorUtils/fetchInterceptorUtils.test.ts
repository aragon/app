/**
 * @jest-environment node
 */

import type { IBackendApiMock } from '@/shared/types';

describe('fetchInterceptorUtils', () => {
    const originalFetch = global.fetch;
    const fetchMock = jest.fn();

    beforeEach(() => {
        global.fetch = fetchMock as unknown as typeof global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        fetchMock.mockReset();
    });

    /**
     * The interceptor captures `global.fetch` on construction and reads the mock registry from its
     * own module scope, so both must be loaded in an isolated registry after the fetch spy is
     * installed. Registering the test mock inside that registry keeps the app-wide list untouched.
     */
    const setupInterceptor = async (
        mock?: IBackendApiMock,
    ): Promise<typeof global.fetch> => {
        let intercepted = global.fetch;

        await jest.isolateModulesAsync(async () => {
            const { backendApiMocks } = await import('@/backendApiMocks');
            const { fetchInterceptorUtils } = await import(
                './fetchInterceptorUtils'
            );

            if (mock != null) {
                backendApiMocks.unshift(mock);
            }

            fetchInterceptorUtils.intercept(true);
            intercepted = global.fetch;
        });

        return intercepted;
    };

    it('does not intercept fetch when mocks are disabled', async () => {
        await jest.isolateModulesAsync(async () => {
            const { fetchInterceptorUtils } = await import(
                './fetchInterceptorUtils'
            );
            fetchInterceptorUtils.intercept(false);
        });

        expect(global.fetch).toBe(fetchMock);
    });

    it('forwards requests not matching any mock to the original fetch', async () => {
        const response = Response.json({ live: true });
        fetchMock.mockResolvedValue(response);

        const intercept = await setupInterceptor({
            url: /\/test-replace/,
            type: 'replace',
            data: { mocked: true },
        });

        await expect(
            intercept('https://api.aragon.org/test-other'),
        ).resolves.toBe(response);
    });

    it('replaces the response without calling the original fetch', async () => {
        const intercept = await setupInterceptor({
            url: /\/test-replace/,
            type: 'replace',
            data: { mocked: true },
        });

        const result = await intercept('https://api.aragon.org/test-replace');

        expect(await result.json()).toEqual({ mocked: true });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('deep-merges object mock data into the live response', async () => {
        fetchMock.mockResolvedValue(
            Response.json({ name: 'dao', settings: { a: 1 } }),
        );

        const intercept = await setupInterceptor({
            url: /\/test-merge/,
            type: 'merge',
            data: { settings: { b: 2 } },
        });

        const result = await intercept('https://api.aragon.org/test-merge');

        expect(await result.json()).toEqual({
            name: 'dao',
            settings: { a: 1, b: 2 },
            _merged: true,
        });
    });
});
